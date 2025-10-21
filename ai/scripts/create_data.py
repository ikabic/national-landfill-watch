# Skripta za transformisanje YOLO izlaza testa u csv fajl sa podacima za bazu

import os
import glob
import csv
from pyproj import Transformer

# --- Folder sa YOLO label fajlovima ---
labels_folder = "test/labels"

# --- Output CSV ---
output_csv = "test/data/deponije_latlon_bbox.csv"

# --- UTM <-> WGS84 ---
transformer_to_wgs = Transformer.from_crs("EPSG:32634", "EPSG:4326", always_xy=True)

# --- Tile parametri ---
tile_size = 256
tiles_per_block = 2
pixel_resolution = 1  # 1 m/pixel
block_size = tile_size * tiles_per_block * pixel_resolution  # 512 m

xmin, ymax = 331367, 5117462  # NW corner

# --- Funkcija: YOLO -> UTM ---
def yolo_to_utm(row, col, x_center_norm, y_center_norm, w_norm, h_norm):
    block_x0 = xmin + col * block_size
    block_y0 = ymax - row * block_size

    x_center = block_x0 + x_center_norm * block_size
    y_center = block_y0 - y_center_norm * block_size  # y od gore prema dole

    width_m = w_norm * block_size
    height_m = h_norm * block_size
    return x_center, y_center, width_m, height_m

# --- Funkcija: UTM -> lat/lon ---
def utm_to_latlon(utm_x, utm_y):
    lon, lat = transformer_to_wgs.transform(utm_x, utm_y)
    return lat, lon

# --- Glavni loop ---
all_rows = []

label_files = glob.glob(os.path.join(labels_folder, "*.txt"))
print(f"🔹 Pronađeno label fajlova: {len(label_files)}")

for label_file in label_files:
    basename = os.path.splitext(os.path.basename(label_file))[0]
    parts = basename.split("_")
    if len(parts) < 4:
        print(f"⚠️ Preskačem fajl sa nepoznatim formatom: {label_file}")
        continue
    _, _, row_str, col_str = parts
    row = int(row_str)
    col = int(col_str)

    with open(label_file, "r") as f:
        lines = f.readlines()

    for line in lines:
        if line.strip() == "":
            continue
        class_id, xc, yc, w, h = map(float, line.strip().split())
        utm_x, utm_y, width_m, height_m = yolo_to_utm(row, col, xc, yc, w, h)
        center_lat, center_lon = utm_to_latlon(utm_x, utm_y)

        # Bounding box koordinate
        x_min = utm_x - width_m / 2
        y_max = utm_y + height_m / 2
        x_max = utm_x + width_m / 2
        y_min = utm_y - height_m / 2

        top_left_lat, top_left_lon = utm_to_latlon(x_min, y_max)
        bottom_right_lat, bottom_right_lon = utm_to_latlon(x_max, y_min)

        all_rows.append([
            basename, int(class_id),
            center_lat, center_lon,
            top_left_lat, top_left_lon,
            bottom_right_lat, bottom_right_lon
        ])

# --- Snimanje u CSV ---
os.makedirs(os.path.dirname(output_csv), exist_ok=True)
with open(output_csv, "w", newline="", encoding="utf-8") as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow([
        "tile_file", "class_id",
        "center_lat", "center_lon",
        "top_left_lat", "top_left_lon",
        "bottom_right_lat", "bottom_right_lon"
    ])
    writer.writerows(all_rows)

print(f"✅ Gotovo! Rezultati sa {len(all_rows)} detekcija su snimljeni u {output_csv}")
