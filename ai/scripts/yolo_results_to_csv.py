# Skripta za transformisanje YOLO izlaza testa u csv fajl sa podacima za bazu

import os
import glob
import csv
import json
from datetime import datetime
from pyproj import Transformer
from shapely.geometry import Polygon, Point, mapping
import math

labels_folder = "test/full_labels"
segmentation_folder = "segmentation"
output_csv = "test/data/full_dataset.csv"

# --- UTM <-> WGS84 ---
transformer_to_wgs = Transformer.from_crs("EPSG:32634", "EPSG:4326", always_xy=True)

# --- Tile parametri ---
tile_size = 256
tiles_per_block = 2
block_size = tile_size * tiles_per_block  # 512 px blok (1 px = 1 m)
xmin, ymax = 331367, 5117462  # NW corner

# --- Konstantne vrednosti ---
AVERAGE_HEIGHT_M = 2.5
MSW_DENSITY_TON_PER_M3 = 0.4
START_YEAR = 2005
current_year = datetime.now().year
K = 0.05
MCF = 0.5
DOC = 0.15
F = 0.5
CO2_EQ = 25
INFLUENCE_RADIUS_M = 150  # radius u metrima

# --- YOLO -> UTM ---
def yolo_to_utm(row, col, x_center_norm, y_center_norm, w_norm, h_norm):
    block_x0 = xmin + col * block_size
    block_y0 = ymax - row * block_size
    x_center = block_x0 + x_center_norm * block_size
    y_center = block_y0 - y_center_norm * block_size
    width_m = w_norm * block_size
    height_m = h_norm * block_size
    return x_center, y_center, width_m, height_m

# --- UTM -> lat/lon ---
def utm_to_latlon(utm_x, utm_y):
    lon, lat = transformer_to_wgs.transform(utm_x, utm_y)
    return lat, lon

# --- FOD metan model ---
def calc_fod_emission(amsw, k, years, mcf, doc, f, co2_eq):
    ch4_total = 0
    for t in range(years):
        ch4_t = amsw * (1 - math.exp(-k)) * (1 - math.exp(-k * t)) * mcf * doc * f
        ch4_total += ch4_t
    co2e_total = ch4_total * co2_eq
    annual_ch4 = ch4_total / years
    annual_co2e = co2e_total / years
    return round(annual_ch4, 2), round(annual_co2e, 2)

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

        parts = list(map(float, line.strip().split()))
        if len(parts) < 6:  # očekujemo i confidence
            continue
        class_id, xc, yc, w, h, conf = parts

        if conf < 0.6: 
            continue

        # --- YOLO u piksele ---
        center_x_px = xc * block_size
        center_y_px = yc * block_size
        width_px = w * block_size
        height_px = h * block_size

        # Bounding box
        x_min_px = center_x_px - width_px / 2
        y_min_px = center_y_px - height_px / 2
        x_max_px = center_x_px + width_px / 2
        y_max_px = center_y_px + height_px / 2

        # GeoJSON
        polygon_coords = [
            (x_min_px, y_min_px),
            (x_min_px, y_max_px),
            (x_max_px, y_max_px),
            (x_max_px, y_min_px),
            (x_min_px, y_min_px)
        ]
        polygon = Polygon(polygon_coords)
        bbox_geojson = mapping(polygon)
        circle = Point(center_x_px, center_y_px).buffer(INFLUENCE_RADIUS_M)
        circle_geojson = mapping(circle)

        geojson_dict = {
            "type": "FeatureCollection",
            "features": [
                {"type": "Feature", "geometry": bbox_geojson, "properties": {"type": "bbox"}},
                {"type": "Feature", "geometry": circle_geojson, "properties": {"type": "influence", "influence_radius": INFLUENCE_RADIUS_M}}
            ]
        }
        geojson_str = json.dumps(geojson_dict) 

        seg_path = os.path.join(segmentation_folder, f"{basename}.geojson")
        if os.path.exists(seg_path):
            with open(seg_path, "r") as sf:
                seg_data = json.load(sf)
                segmentation_str = json.dumps(seg_data)  
        else:
            segmentation_str = 'null'

        # Centar u UTM -> lat/lon
        utm_x, utm_y, _, _ = yolo_to_utm(row, col, xc, yc, w, h)
        center_lat, center_lon = utm_to_latlon(utm_x, utm_y)

        # Površina, zapremina, masa
        area_m2 = width_px * height_px
        volume_m3 = area_m2 * AVERAGE_HEIGHT_M
        total_mass_ton = volume_m3 * MSW_DENSITY_TON_PER_M3

        life_years = current_year - START_YEAR
        amswx = total_mass_ton / life_years
        annual_ch4, annual_co2e = calc_fod_emission(amswx, K, life_years, MCF, DOC, F, CO2_EQ)

        landfill = {
            "image_name": basename,
            "status": "detected",
            "start_year": START_YEAR,
            "life_years": life_years,
            "area_m2": round(area_m2, 2),
            "volume_m3": round(volume_m3, 2),
            "total_mass_ton": round(total_mass_ton, 2),
            "annual_msw_m3": round(amswx, 2),
            "annual_ch4_tonnes": annual_ch4,
            "annual_co2e_tonnes": annual_co2e,
            "geojson": geojson_str,
            "segmentation": segmentation_str,
            "center_lat": center_lat,
            "center_lon": center_lon,
            "geom": f"POINT({center_lon} {center_lat})",
            "influence_radius": INFLUENCE_RADIUS_M,
            "center_x_px": center_x_px,
            "center_y_px": center_y_px,
            "width_px": width_px,
            "height_px": height_px
        }

        all_rows.append(landfill)

# --- Snimanje u CSV ---
os.makedirs(os.path.dirname(output_csv), exist_ok=True)
with open(output_csv, "w", newline="", encoding="utf-8") as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=[
        "image_name","status","start_year","life_years",
        "area_m2","volume_m3","total_mass_ton",
        "annual_msw_m3","annual_ch4_tonnes","annual_co2e_tonnes",
        "geojson","segmentation","center_lat","center_lon","geom","influence_radius",
        "center_x_px","center_y_px","width_px","height_px"
    ], quoting=csv.QUOTE_ALL)
    writer.writeheader()
    writer.writerows(all_rows)

print(f"✅ Gotovo! Snimljeno {len(all_rows)} deponija u {output_csv}")
