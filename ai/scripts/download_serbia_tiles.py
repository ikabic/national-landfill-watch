# Skripta za skidanje svih tile-ova Srbije u formatu 512x512, .jpg, 1m/pixel-u

import os
import requests
from io import BytesIO
from PIL import Image
import numpy as np
from concurrent.futures import ThreadPoolExecutor, as_completed

# --- PARAMETRI ---
tile_size = 256
tiles_per_block = 2  # 2×2 = 512×512 px
pixel_resolution = 1  # 1 m/pixel
output_dir = "tiles_jpg_serbia"
os.makedirs(output_dir, exist_ok=True)

# --- Granice Srbije (EPSG:32634) ---
xmin, ymax = 331367, 5117462  # severozapadni ugao
xmax, ymin = 666517, 4635954  # jugoistočni ugao

# --- Izračunavanje broja blokova ---
total_x_tiles = int((xmax - xmin) / (tile_size * pixel_resolution))
total_y_tiles = int((ymax - ymin) / (tile_size * pixel_resolution))
total_blocks_x = total_x_tiles // tiles_per_block
total_blocks_y = total_y_tiles // tiles_per_block

print(f"Ukupno blokova: {total_blocks_x * total_blocks_y}")
print(f"Pokriće: cela Srbija\n")

# --- Početni blok (NW ugao) ---
start_bx = 0
start_by = 0

def is_blank_tile(img_array, threshold=0.95):
    """Proverava da li je tile skoro prazan (npr. bela ili crna površina)."""
    mask = np.all((img_array <= 5) | (img_array >= 250), axis=2)
    fraction_blank = mask.sum() / mask.size
    return fraction_blank >= threshold

def download_block(bx, by):
    """Preuzima blok od 2×2 tile-a i spaja u jednu sliku."""
    x0 = xmin + bx * tiles_per_block * tile_size * pixel_resolution
    y0 = ymax - by * tiles_per_block * tile_size * pixel_resolution

    block_img = np.zeros((tiles_per_block * tile_size,
                          tiles_per_block * tile_size, 3), dtype=np.uint8)

    missing_tiles = 0
    empty_tiles = 0

    for ty in range(tiles_per_block):
        for tx in range(tiles_per_block):
            x = x0 + tx * tile_size * pixel_resolution
            y = y0 - ty * tile_size * pixel_resolution
            bbox = f"{x},{y - tile_size},{x + tile_size},{y}"

            url = (
                f"https://basemap.geosrbija.rs/basemap_cache/mapcache.ashx?"
                f"LAYERS=ss30_2021_temp&QUERYABLE=false&TRANSPARENT=FALSE&FORMAT=image/jpeg"
                f"&VERSION=1.1.1&SERVICE=WMS&REQUEST=GetMap&STYLES=&SRS=EPSG:32634"
                f"&BBOX={bbox}&WIDTH={tile_size}&HEIGHT={tile_size}"
            )

            try:
                response = requests.get(url, timeout=10)
                response.raise_for_status()
                img = Image.open(BytesIO(response.content)).convert("RGB")
                img_array = np.array(img)

                if is_blank_tile(img_array):
                    empty_tiles += 1
                    continue

                y_start = ty * tile_size
                y_end = y_start + tile_size
                x_start = tx * tile_size
                x_end = x_start + tile_size
                block_img[y_start:y_end, x_start:x_end, :] = img_array

            except Exception:
                missing_tiles += 1

    total_tiles = tiles_per_block * tiles_per_block
    valid_tiles = total_tiles - missing_tiles - empty_tiles

    if valid_tiles == 0:
        return None, bx, by, missing_tiles, empty_tiles

    # Snimanje kao JPEG
    output_path = os.path.join(output_dir, f"tile_block_{by}_{bx}.jpg")
    block_pil = Image.fromarray(block_img)
    block_pil.save(output_path, format="JPEG", quality=90, optimize=True)

    return output_path, bx, by, missing_tiles, empty_tiles

# --- Kreiranje liste svih blokova (cela Srbija) ---
blocks_to_download = [(bx, by) for by in range(start_by, total_blocks_y) for bx in range(start_bx, total_blocks_x)]

# --- Paralelno preuzimanje ---
max_workers = 4  
saved_blocks = 0

with ThreadPoolExecutor(max_workers=max_workers) as executor:
    future_to_block = {executor.submit(download_block, bx, by): (bx, by) for bx, by in blocks_to_download}

    for future in as_completed(future_to_block):
        result = future.result()
        if result:
            output_path, bx, by, missing, empty = result
            if output_path:
                saved_blocks += 1
            #     print(f"✅ Sačuvan blok: {output_path} | Missing: {missing}, Blank: {empty}")
            # else:
            #     print(f"❌ Prazan blok bx={bx}, by={by}")

print(f"\n✅ Završeno — sačuvano {saved_blocks}/{len(blocks_to_download)} blokova (cela Srbija).")
