# Skripta za pokretanje treninga podeljena u batch-eve zbog kolicine slika i opterecenja RAM-a

from ultralytics import YOLO
import os

model_path = "/workspace/best.pt"
output_base = "/workspace/results"
batch_index = 0  # batch koji želiš da pokreneš

# batch folder je već kreiran i nalazi se u batch_folders
batch_folder = f"/workspace/batch_{batch_index}"
output_folder = os.path.join(output_base, f"batch_{batch_index}")
os.makedirs(output_folder, exist_ok=True)

model = YOLO(model_path)

print(f"🔹 Processing batch: batch_{batch_index}, {len(os.listdir(batch_folder))} images")

model.predict(
    source=batch_folder,
    save=False,       # ne čuvaj slike sa detekcijama
    save_txt=True,    # čuvaj samo TXT sa koordinatama i confidence
    save_conf=True,   # confidence u TXT
    project=output_folder,
    name="",
    conf=0.4,
    batch=1,
    workers=0,
    device="cuda"
)

print("✅ Batch 1 obrađen. Rezultati u:", output_folder)