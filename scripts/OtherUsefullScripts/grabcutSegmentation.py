"""
GrabCut segmentation za izračunavanje površine deponija
"""

import cv2
import numpy as np
from pathlib import Path
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
import json

class LandfillAreaCalculator:

    
    def __init__(self, pixel_resolution=1.0):

        self.pixel_resolution = pixel_resolution 
    
    def read_yolo_labels(self, label_path, img_width, img_height):

        bboxes = []
        
        with open(label_path, 'r') as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) == 5:
                    class_id, x_center, y_center, width, height = map(float, parts)
                    
                    x_center_px = x_center * img_width
                    y_center_px = y_center * img_height
                    width_px = width * img_width
                    height_px = height * img_height
                    
                    xmin = int(x_center_px - width_px / 2)
                    ymin = int(y_center_px - height_px / 2)
                    xmax = int(x_center_px + width_px / 2)
                    ymax = int(y_center_px + height_px / 2)
                    
                    bboxes.append({
                        'class_id': int(class_id),
                        'bbox': (xmin, ymin, xmax, ymax)
                    })
        
        return bboxes
    
    def apply_grabcut(self, image, bbox, iterations=5):

        xmin, ymin, xmax, ymax = bbox
        
        h, w = image.shape[:2]
        xmin = max(0, xmin)
        ymin = max(0, ymin)
        xmax = min(w, xmax)
        ymax = min(h, ymax)
        
        mask = np.zeros(image.shape[:2], np.uint8)
        bgd_model = np.zeros((1, 65), np.float64)
        fgd_model = np.zeros((1, 65), np.float64)
        
        rect = (xmin, ymin, xmax - xmin, ymax - ymin)
        
        try:
            cv2.grabCut(
                image,
                mask,
                rect,
                bgd_model,
                fgd_model,
                iterations,
                cv2.GC_INIT_WITH_RECT
            )
            
            binary_mask = np.where((mask == 2) | (mask == 0), 0, 1).astype('uint8')
            
            return binary_mask
        
        except Exception as e:
            print(f"GrabCut failed: {e}")
            return np.zeros(image.shape[:2], np.uint8)
    
    def refine_mask(self, mask, min_area=100):

        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)
        
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
        
        num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(
            mask, connectivity=8
        )
        
        refined_mask = np.zeros_like(mask)
        
        for i in range(1, num_labels):
            area = stats[i, cv2.CC_STAT_AREA]
            if area >= min_area:
                refined_mask[labels == i] = 1
        
        return refined_mask
    
    def calculate_area(self, mask):

        num_pixels = np.sum(mask)
        
        square_meters = num_pixels * (self.pixel_resolution ** 2)
        
        hectares = square_meters / 10000
        
        return {
            'pixels': int(num_pixels),
            'square_meters': float(square_meters),
            'hectares': float(hectares)
        }
    
    def extract_contour(self, mask):

        contours, _ = cv2.findContours(
            mask.astype(np.uint8),
            cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_SIMPLE
        )
        
        if len(contours) == 0:
            return None
        
        largest_contour = max(contours, key=cv2.contourArea)
        
        return largest_contour
    
    def process_single_landfill(self, image, bbox, landfill_id=0, visualize=False):

        print(f"\nProcessing landfill #{landfill_id}")
        

        mask = self.apply_grabcut(image, bbox, iterations=5)
        
        if np.sum(mask) == 0:
            print(f"GrabCut produced empty mask")
            return None
        
        refined_mask = self.refine_mask(mask, min_area=100)
        
        if np.sum(refined_mask) == 0:
            print(f"   ⚠️  Refined mask is empty")
            return None
        
        area = self.calculate_area(refined_mask)
        
        contour = self.extract_contour(refined_mask)
        
        print(f"   ✓ Area: {area['hectares']:.4f} ha ({area['square_meters']:.1f} m²)")
        
        result = {
            'landfill_id': landfill_id,
            'bbox': bbox,
            'mask': refined_mask,
            'contour': contour,
            'area': area
        }
        
        if visualize:
            self.visualize_result(image, bbox, refined_mask, contour, area, landfill_id)
        
        return result
    
    def process_image(self, image_path, label_path, visualize=True):

        print(f"\n{'='*60}")
        print(f"PROCESSING: {Path(image_path).name}")
        print(f"{'='*60}")
        
        image = cv2.imread(str(image_path))
        if image is None:
            print(f"Cannot load image: {image_path}")
            return None
        
        h, w = image.shape[:2]
        
        bboxes = self.read_yolo_labels(label_path, w, h)
        
        if len(bboxes) == 0:
            print(" No landfills found in labels")
            return None
        
        print(f"Found {len(bboxes)} landfill(s)")
        
        results = []
        
        for idx, bbox_data in enumerate(bboxes):
            result = self.process_single_landfill(
                image,
                bbox_data['bbox'],
                landfill_id=idx,
                visualize=False
            )
            
            if result is not None:
                results.append(result)
        
        if visualize and len(results) > 0:
            self.visualize_all_results(image, results)
        
        summary = {
            'image': str(image_path),
            'total_landfills': len(results),
            'total_area_hectares': sum(r['area']['hectares'] for r in results),
            'total_area_m2': sum(r['area']['square_meters'] for r in results),
            'landfills': [
                {
                    'id': r['landfill_id'],
                    'area_hectares': r['area']['hectares'],
                    'area_m2': r['area']['square_meters'],
                    'bbox': r['bbox']
                }
                for r in results
            ]
        }
        
        return summary
    
    def visualize_result(self, image, bbox, mask, contour, area, landfill_id):

        fig, axes = plt.subplots(1, 4, figsize=(20, 5))
        
        ax = axes[0]
        ax.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        xmin, ymin, xmax, ymax = bbox
        rect = Rectangle((xmin, ymin), xmax-xmin, ymax-ymin,
                        linewidth=2, edgecolor='red', facecolor='none')
        ax.add_patch(rect)
        ax.set_title('Original + BBox')
        ax.axis('off')
        
        ax = axes[1]
        ax.imshow(mask, cmap='gray')
        ax.set_title('GrabCut Mask')
        ax.axis('off')
        
        ax = axes[2]
        result_img = cv2.cvtColor(image, cv2.COLOR_BGR2RGB).copy()
        if contour is not None:
            cv2.drawContours(result_img, [contour], -1, (0, 255, 0), 2)
        ax.imshow(result_img)
        ax.set_title('Contour')
        ax.axis('off')
        
        ax = axes[3]
        overlay = cv2.cvtColor(image, cv2.COLOR_BGR2RGB).copy()
        overlay[mask == 1] = overlay[mask == 1] * 0.5 + np.array([255, 0, 0]) * 0.5
        ax.imshow(overlay.astype('uint8'))
        ax.set_title(f'Overlay\nArea: {area["hectares"]:.4f} ha')
        ax.axis('off')
        
        plt.suptitle(f'Landfill #{landfill_id}', fontsize=16, fontweight='bold')
        plt.tight_layout()
        plt.show()
    
    def visualize_all_results(self, image, results):

        fig, axes = plt.subplots(1, 3, figsize=(18, 6))
        
        ax = axes[0]
        img_display = cv2.cvtColor(image, cv2.COLOR_BGR2RGB).copy()
        for result in results:
            xmin, ymin, xmax, ymax = result['bbox']
            cv2.rectangle(img_display, (xmin, ymin), (xmax, ymax), (255, 0, 0), 2)
            cv2.putText(img_display, f"#{result['landfill_id']}", 
                       (xmin, ymin-10), cv2.FONT_HERSHEY_SIMPLEX, 
                       0.7, (255, 0, 0), 2)
        ax.imshow(img_display)
        ax.set_title('Original with BBoxes')
        ax.axis('off')
        
        ax = axes[1]
        combined_mask = np.zeros(image.shape[:2], dtype=np.uint8)
        for result in results:
            combined_mask += result['mask']
        ax.imshow(combined_mask, cmap='hot')
        ax.set_title('All Masks Combined')
        ax.axis('off')
        
        ax = axes[2]
        overlay = cv2.cvtColor(image, cv2.COLOR_BGR2RGB).copy()
        for idx, result in enumerate(results):
            color = plt.cm.Set1(idx / max(len(results), 1))[:3]
            color = tuple(int(c * 255) for c in color)
            
            overlay[result['mask'] == 1] = overlay[result['mask'] == 1] * 0.6 + np.array(color) * 0.4
            
            if result['contour'] is not None:
                cv2.drawContours(overlay, [result['contour']], -1, color, 2)
            
            if result['contour'] is not None and len(result['contour']) > 0:
                M = cv2.moments(result['contour'])
                if M["m00"] != 0:
                    cx = int(M["m10"] / M["m00"])
                    cy = int(M["m01"] / M["m00"])
                    text = f"#{result['landfill_id']}\n{result['area']['hectares']:.2f}ha"
                    cv2.putText(overlay, f"#{result['landfill_id']}", 
                               (cx-20, cy), cv2.FONT_HERSHEY_SIMPLEX, 
                               0.6, (255, 255, 255), 2)
        
        ax.imshow(overlay.astype('uint8'))
        
        total_area = sum(r['area']['hectares'] for r in results)
        ax.set_title(f'Segmentation Results\nTotal: {total_area:.4f} ha')
        ax.axis('off')
        
        plt.tight_layout()
        plt.show()
    
    def batch_process(self, images_dir, labels_dir, output_json='landfill_areas.json'):

        images_dir = Path(images_dir)
        labels_dir = Path(labels_dir)
        
        all_results = []
        
        image_files = list(images_dir.glob('*.jpg')) + list(images_dir.glob('*.png'))
        
        print(f"\n{'#'*60}")
        print(f"BATCH PROCESSING: {len(image_files)} images")
        print(f"{'#'*60}")
        
        for img_file in image_files:
            label_file = labels_dir / (img_file.stem + '.txt')
            
            if not label_file.exists():
                print(f"No labels for {img_file.name}, skipping...")
                continue
            
            result = self.process_image(img_file, label_file, visualize=False)
            
            if result:
                all_results.append(result)
        
        with open(output_json, 'w') as f:
            json.dump(all_results, f, indent=2)
        
        print(f"\n{'='*60}")
        print("BATCH PROCESSING COMPLETE")
        print(f"{'='*60}")
        print(f"Processed: {len(all_results)} images")
        print(f"Results saved: {output_json}")
        
        total_landfills = sum(r['total_landfills'] for r in all_results)
        total_area = sum(r['total_area_hectares'] for r in all_results)
        
        print(f"\nSTATISTICS:")
        print(f"   Total landfills: {total_landfills}")
        print(f"   Total area: {total_area:.2f} hectares ({total_area*10000:.0f} m²)")
        print(f"   Average area per landfill: {total_area/total_landfills:.4f} ha")
        
        return all_results


if __name__ == "__main__":
    

    calculator = LandfillAreaCalculator(pixel_resolution=1.0)
    """"Test sa jednom slikom"""
    result = calculator.process_image(
        image_path='0321_right.jpg',
        label_path='0321_right.txt',        
        visualize=True
    )
    
    if result:
        print("\n" + "="*60)
        print("FINALNI REZULTAT:")
        print("="*60)
        print(f"Broj deponija: {result['total_landfills']}")
        print(f"Ukupna površina: {result['total_area_hectares']:.4f} hektara")
        print(f"                 ({result['total_area_m2']:.1f} m²)")
        print("="*60)