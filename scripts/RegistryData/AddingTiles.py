import pandas as pd
from pyproj import Transformer
import math


input_csv = "formatted.csv"
output_csv = "final.csv"

transformer_to_utm = Transformer.from_crs("EPSG:4326", "EPSG:32634", always_xy=True)


tile_size = 256
tiles_per_block = 2
block_size = tile_size * tiles_per_block

xmin = 331367
ymax = 5117462

df = pd.read_csv(input_csv)

center_x_list = []
center_y_list = []
image_names = []
radius_list = []

for _, row in df.iterrows():
    lat = float(row["lat"])
    lon = float(row["lon"])

    utm_x, utm_y = transformer_to_utm.transform(lon, lat)

    col = math.floor((utm_x - xmin) / block_size)
    row_block = math.floor((ymax - utm_y) / block_size)

    block_x0 = xmin + col * block_size
    block_y0 = ymax - row_block * block_size

    center_x_px = utm_x - block_x0
    center_y_px = block_y0 - utm_y

    center_x_list.append(round(center_x_px, 2))
    center_y_list.append(round(center_y_px, 2))

    image_names.append(f"tile_block_{row_block}_{col}.jpg")

    expanded_area = row["area_m2"] * 1.25
    radius_m = math.sqrt(expanded_area / math.pi)
    radius_list.append(round(radius_m, 2))

df["center_x_px"] = center_x_list
df["center_y_px"] = center_y_list
df["image_name"] = image_names
df["radius"] = radius_list

df.to_csv(output_csv, index=False, encoding="utf-8")
