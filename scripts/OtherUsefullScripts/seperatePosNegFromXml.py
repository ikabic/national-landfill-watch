import os
import shutil
import xml.etree.ElementTree as ET

INPUT_BASE = "output"
OUTPUT_BASE = "separated_output"
DATASETS = ["train", "test"]

def ensure_dirs(base_path):
    for subset in ["positive", "negative"]:
        for subdir in ["JPEGImages", "Annotations"]:
            os.makedirs(os.path.join(base_path, subset, subdir), exist_ok=True)

def is_positive(xml_path):
    """Vrati True ako XML sadrži bar jedan <object> tag"""
    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()
        return len(root.findall("object")) > 0
    except ET.ParseError:
        print(f"Ne moze da se parsira: {xml_path}")
        return False

def process_dataset(dataset_name):
    print(f"Obrada: {dataset_name}")

    input_img_dir = os.path.join(INPUT_BASE, dataset_name, "JPEGImages")
    input_annot_dir = os.path.join(INPUT_BASE, dataset_name, "Annotations")

    output_dir = os.path.join(OUTPUT_BASE, dataset_name)
    ensure_dirs(output_dir)

    count_pos, count_neg = 0, 0

    for xml_file in os.listdir(input_annot_dir):
        if not xml_file.endswith(".xml"):
            continue

        xml_path = os.path.join(input_annot_dir, xml_file)
        img_name = xml_file.replace(".xml", ".jpg")
        img_path = os.path.join(input_img_dir, img_name)

        if not os.path.exists(img_path):
            print(f"Slika ne postoji za {xml_file}")
            continue

        if is_positive(xml_path):
            target = "positive"
            count_pos += 1
        else:
            target = "negative"
            count_neg += 1

        shutil.copy2(img_path, os.path.join(output_dir, target, "JPEGImages", img_name))
        shutil.copy2(xml_path, os.path.join(output_dir, target, "Annotations", xml_file))

    print(f"{dataset_name}: {count_pos} positive, {count_neg} negative\n")

def main():
    for ds in DATASETS:
        process_dataset(ds)

if __name__ == "__main__":
    main()
