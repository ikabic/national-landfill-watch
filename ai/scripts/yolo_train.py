# Skripta za pokretanje treninga

from ultralytics import YOLO

model = YOLO("yolo11m.pt")

model.train(
    resume=False,
    epochs=800,
    data="dataset/data.yaml",
    imgsz=512,
    batch=16,
    device=0,
    name="full_dataset",
    verbose=False,
    cache='disk',
    workers=8,
    save=True,
    save_period=1,
    hsv_h=0.03,
    hsv_s=0.5,
    hsv_v=0.5,
    degrees=15.0,
    translate=0.12,
    scale=0.3,
    shear=0.0,
    perspective=0.0,
    flipud=0.0,
    fliplr=0.7,
    mosaic=1.0,
    mixup=0.2,
)