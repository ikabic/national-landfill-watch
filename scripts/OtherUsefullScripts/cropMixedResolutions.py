import os
import cv2
import shutil

INPUT_DIR = "."
OUTPUT_DIR = "output"
THRESHOLD_RATIO = 0.2

def ensure_dirs(base_path):
    """Pravi potrebne foldere ako ne postoje."""
    for split in ["train", "test", "val"]:
        for sub in ["images", "labels"]:
            os.makedirs(os.path.join(base_path, split, sub), exist_ok=True)

def load_yolo_labels(label_path):
    """Ucitava YOLO labele iz txt fajla."""
    labels = []
    if not os.path.exists(label_path):
        return labels
    with open(label_path, "r") as f:
        for line in f:
            parts = line.strip().split()
            if len(parts) == 5:
                cls, x, y, w, h = parts
                labels.append([int(float(cls)), float(x), float(y), float(w), float(h)])
    return labels

def save_yolo_labels(label_path, labels):
    """upis labela YOLO"""
    with open(label_path, "w") as f:
        for cls, x, y, w, h in labels:
            f.write(f"{cls} {x:.6f} {y:.6f} {w:.6f} {h:.6f}\n")

def crop_and_resize(img, labels, orig_w, orig_h, crop_x, crop_y, crop_w, crop_h, out_size):
    """Vraca kropovanu sliku i yolo labele"""
    cropped_img = img[crop_y:crop_y+crop_h, crop_x:crop_x+crop_w]
    new_labels = []
    for cls, x, y, w, h in labels:
        if cls != 0:
            continue
        bx = x * orig_w
        by = y * orig_h
        bw = w * orig_w
        bh = h * orig_h
        xmin = bx - bw / 2
        xmax = bx + bw / 2
        ymin = by - bh / 2
        ymax = by + bh / 2

        inter_xmin = max(xmin, crop_x)
        inter_ymin = max(ymin, crop_y)
        inter_xmax = min(xmax, crop_x + crop_w)
        inter_ymax = min(ymax, crop_y + crop_h)

        if inter_xmin < inter_xmax and inter_ymin < inter_ymax:
            orig_area = (xmax - xmin) * (ymax - ymin)
            inter_area = (inter_xmax - inter_xmin) * (inter_ymax - inter_ymin)
            if inter_area / orig_area >= THRESHOLD_RATIO:
                nxmin = inter_xmin - crop_x
                nymin = inter_ymin - crop_y
                nxmax = inter_xmax - crop_x
                nymax = inter_ymax - crop_y

                nx = ((nxmin + nxmax) / 2) / crop_w
                ny = ((nymin + nymax) / 2) / crop_h
                nw = (nxmax - nxmin) / crop_w
                nh = (nymax - nymin) / crop_h
                new_labels.append([cls, nx, ny, nw, nh])

    resized = cv2.resize(cropped_img, (out_size, out_size))
    return resized, new_labels


def process_split(split_name):
    print(f"Obrada split-a: {split_name}")
    img_root = os.path.join(INPUT_DIR, split_name, "images")
    label_root = os.path.join(INPUT_DIR, split_name, "labels")

    output_img_root = os.path.join(OUTPUT_DIR, split_name, "images")
    output_label_root = os.path.join(OUTPUT_DIR, split_name, "labels")

    os.makedirs(output_img_root, exist_ok=True)
    os.makedirs(output_label_root, exist_ok=True)

    for res_folder in os.listdir(img_root):
        folder_path = os.path.join(img_root, res_folder)
        if not os.path.isdir(folder_path):
            continue

        for img_file in os.listdir(folder_path):
            if not img_file.lower().endswith((".jpg", ".jpeg", ".png")):
                continue

            img_path = os.path.join(folder_path, img_file)
            label_path = os.path.join(label_root, os.path.splitext(img_file)[0] + ".txt")

            img = cv2.imread(img_path)
            if img is None:
                continue
            h, w = img.shape[:2]
            labels = load_yolo_labels(label_path)

            crops = []

            if (w, h) == (2400, 1202):
                crops = [
                    ("_top_left", 0, 0, 600, 600),
                    ("_top_right", 600, 0, 600, 600),
                    ("_bottom_left", 0, 600, 600, 600),
                    ("_bottom_right", 600, 600, 600, 600),
                ]
            elif (w, h) == (1200, 600):
                crops = [
                    ("_left", 0, 0, 600, 600),
                    ("_right", 600, 0, 600, 600),
                ]
            elif (w, h) == (1600, 900):
                # DODAT KROP
                img = img[50:850, 0:1550]
                h, w = img.shape[:2]
                crops = [
                    ("_left", 0, 0, 800, 800),
                    ("_right", 750, 0, 800, 800),
                ]
            else:

                continue

            for suffix, cx, cy, cw, ch in crops:
                cropped, new_labels = crop_and_resize(img, labels, w, h, cx, cy, cw, ch, 512)
                new_name = os.path.splitext(img_file)[0] + suffix + ".jpg"
                new_img_path = os.path.join(output_img_root, new_name)
                new_label_path = os.path.join(output_label_root, os.path.splitext(new_name)[0] + ".txt")

                cv2.imwrite(new_img_path, cropped)
                save_yolo_labels(new_label_path, new_labels)

    print(f"Zavrseno: {split_name}\n")


def main():
    ensure_dirs(OUTPUT_DIR)
    for split in ["train", "test", "val"]:
        split_path = os.path.join(INPUT_DIR, split)
        if os.path.exists(split_path):
            process_split(split)
        else:
            print(f"⚠️ Preskačem {split} — ne postoji")

if __name__ == "__main__":
    main()
