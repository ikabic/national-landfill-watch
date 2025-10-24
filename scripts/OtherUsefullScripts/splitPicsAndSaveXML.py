import os
import xml.etree.ElementTree as ET
from PIL import Image

# Putevi do ulaznih i izlaznih foldera
DATASETS = ["train", "test"]
BASE_DIR = "."
OUTPUT_BASE = "output"

TILE_SIZE = 512
THRESHOLD_RATIO = 0.2  # 20% minimum area preseka da bi objekat ostao

def crop_image_and_boxes(img_path, xml_path, out_img_dir, out_annot_dir):
    img = Image.open(img_path)
    img_w, img_h = img.size
    base_name = os.path.splitext(os.path.basename(img_path))[0]

    # Učitaj XML anotaciju
    tree = ET.parse(xml_path)
    root = tree.getroot()

    objects = []
    for obj in root.findall("object"):
        name = obj.find("name").text
        bbox = obj.find("bndbox")
        xmin = int(bbox.find("xmin").text)
        ymin = int(bbox.find("ymin").text)
        xmax = int(bbox.find("xmax").text)
        ymax = int(bbox.find("ymax").text)
        objects.append((name, xmin, ymin, xmax, ymax))

    # 4 kvadranta slike
    tiles = [
        ("_top_left", 0, 0),
        ("_top_right", TILE_SIZE, 0),
        ("_bottom_left", 0, TILE_SIZE),
        ("_bottom_right", TILE_SIZE, TILE_SIZE),
    ]

    new_image_names = []

    for suffix, x_off, y_off in tiles:
        new_img = img.crop((x_off, y_off, x_off + TILE_SIZE, y_off + TILE_SIZE))
        new_name = f"{base_name}{suffix}.jpg"
        new_img.save(os.path.join(out_img_dir, new_name))

        annotation = ET.Element("annotation")
        ET.SubElement(annotation, "filename").text = new_name
        size_el = ET.SubElement(annotation, "size")
        ET.SubElement(size_el, "width").text = str(TILE_SIZE)
        ET.SubElement(size_el, "height").text = str(TILE_SIZE)
        ET.SubElement(size_el, "depth").text = "3"

        for name, xmin, ymin, xmax, ymax in objects:
            inter_xmin = max(xmin, x_off)
            inter_ymin = max(ymin, y_off)
            inter_xmax = min(xmax, x_off + TILE_SIZE)
            inter_ymax = min(ymax, y_off + TILE_SIZE)

            if inter_xmin < inter_xmax and inter_ymin < inter_ymax:
                orig_area = (xmax - xmin) * (ymax - ymin)
                inter_area = (inter_xmax - inter_xmin) * (inter_ymax - inter_ymin)

                if inter_area / orig_area >= THRESHOLD_RATIO:
                    nxmin = inter_xmin - x_off
                    nymin = inter_ymin - y_off
                    nxmax = inter_xmax - x_off
                    nymax = inter_ymax - y_off

                    obj_el = ET.SubElement(annotation, "object")
                    ET.SubElement(obj_el, "name").text = name
                    bbox = ET.SubElement(obj_el, "bndbox")
                    ET.SubElement(bbox, "xmin").text = str(nxmin)
                    ET.SubElement(bbox, "ymin").text = str(nymin)
                    ET.SubElement(bbox, "xmax").text = str(nxmax)
                    ET.SubElement(bbox, "ymax").text = str(nymax)

        out_xml = os.path.join(out_annot_dir, f"{base_name}{suffix}.xml")
        ET.ElementTree(annotation).write(out_xml)
        new_image_names.append(os.path.splitext(new_name)[0])

    return new_image_names


def process_dataset(dataset_name):
    print(f"🔄 Obrada dataseta: {dataset_name}")
    img_dir = os.path.join(BASE_DIR, dataset_name, "JPEGImages")
    xml_dir = os.path.join(BASE_DIR, dataset_name, "Annotations")

    out_img_dir = os.path.join(OUTPUT_BASE, dataset_name, "JPEGImages")
    out_annot_dir = os.path.join(OUTPUT_BASE, dataset_name, "Annotations")
    os.makedirs(out_img_dir, exist_ok=True)
    os.makedirs(out_annot_dir, exist_ok=True)

    all_new_files = []

    for filename in os.listdir(img_dir):
        if not filename.endswith(".jpg"):
            continue
        img_path = os.path.join(img_dir, filename)
        xml_path = os.path.join(xml_dir, filename.replace(".jpg", ".xml"))

        if os.path.exists(xml_path):
            new_names = crop_image_and_boxes(img_path, xml_path, out_img_dir, out_annot_dir)
            all_new_files.extend(new_names)
        else:
            print(f"⚠️  Preskačem {filename} — nema XML fajla")

    # Kreiraj txt listu
    txt_path = os.path.join(OUTPUT_BASE, dataset_name, f"{dataset_name}.txt")
    with open(txt_path, "w") as f:
        for name in all_new_files:
            f.write(name + "\n")

    print(f"✅ Gotovo: {len(all_new_files)} novih slika zapisano u {txt_path}\n")


def main():
    for ds in DATASETS:
        process_dataset(ds)


if __name__ == "__main__":
    main()
