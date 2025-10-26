# Skripta koja koristi Segment Anything Model da iz YOLO bounding box-ova generise precizne poligone

import os
import cv2
import numpy as np
import torch
from tqdm import tqdm
import json
from segment_anything import sam_model_registry, SamPredictor

# === KONFIGURACIJA ===
DATASET_DIR = "dataset"
RESOLUTION_M_PER_PX = 1.0
sam_checkpoint = "sam_vit_h_4b8939.pth"
model_type = "vit_h"
device = "cuda" if torch.cuda.is_available() else "cpu"

# === INIT SAM ===
sam = sam_model_registry[model_type](checkpoint=sam_checkpoint).to(device)
predictor = SamPredictor(sam)

# === FUNKCIJA ZA ČITANJE YOLO LABELA ===
def read_yolo_labels(label_path, img_width, img_height):
    bboxes = []
    if not os.path.exists(label_path):
        return bboxes
    with open(label_path, "r") as f:
        for line in f:
            parts = line.strip().split()
            if len(parts) < 5:
                continue
            cls, xc, yc, w, h = map(float, parts[:5])
            x1 = int((xc - w / 2) * img_width)
            y1 = int((yc - h / 2) * img_height)
            x2 = int((xc + w / 2) * img_width)
            y2 = int((yc + h / 2) * img_height)
            bboxes.append((cls, x1, y1, x2, y2))
    return bboxes

# === FOLDERI ===
img_dir = os.path.join(DATASET_DIR, "images")
lbl_dir = os.path.join(DATASET_DIR, "labels")
mask_out_dir = os.path.join(DATASET_DIR, "polygons2")
os.makedirs(mask_out_dir, exist_ok=True)

img_files = [f for f in os.listdir(img_dir) if f.endswith((".jpg", ".png", ".jpeg"))]

# === SEKVENCIJALNA OBRADA ===
for img_name in tqdm(img_files, desc="Processing images"):
    img_path = os.path.join(img_dir, img_name)
    lbl_path = os.path.join(lbl_dir, img_name.rsplit(".", 1)[0] + ".txt")
    out_path = os.path.join(mask_out_dir, img_name.rsplit(".", 1)[0] + ".geojson")

    image = cv2.imread(img_path)
    if image is None:
        continue

    predictor.set_image(image)
    h, w, _ = image.shape
    bboxes = read_yolo_labels(lbl_path, w, h)

    polygons = []

    for cls, x1, y1, x2, y2 in bboxes:
        input_box = np.array([x1, y1, x2, y2])
        masks, scores, logits = predictor.predict(box=input_box, multimask_output=False)
        mask = masks[0].astype(np.uint8) * 255

        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for contour in contours:
            contour = contour.squeeze().tolist()
            if len(contour) < 3:
                continue

            area_px = cv2.contourArea(np.array(contour))
            area_m2 = area_px * (RESOLUTION_M_PER_PX ** 2)

            polygons.append({
                "class": int(cls),
                "area_m2": area_m2,
                "coordinates": contour
            })

    geojson = {
        "type": "FeatureCollection",
        "features": []
    }

    for poly in polygons:
        geojson["features"].append({
            "type": "Feature",
            "properties": {
                "class": poly["class"],
                "area_m2": poly["area_m2"]
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[list(map(float, p)) for p in poly["coordinates"]]]
            }
        })

    with open(out_path, "w") as f:
        json.dump(geojson, f)