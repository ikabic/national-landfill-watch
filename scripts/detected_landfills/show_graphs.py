# Skripta za prikaz grafova na osnovu trening epoha

import pandas as pd
import matplotlib.pyplot as plt

# Putanja do csv fajla
df = pd.read_csv("full_dataset.csv")

plt.style.use('seaborn-v0_8-darkgrid')

# Napravi 3x3 grid
fig, axes = plt.subplots(3, 3, figsize=(18, 12))
fig.subplots_adjust(hspace=0.4, wspace=0.3)

# === 1. TRAIN BOX LOSS ===
axes[0, 0].plot(df["epoch"], df["train/box_loss"], color="tab:blue")
axes[0, 0].set_title("Train Box Loss")
axes[0, 0].set_xlabel("Epoch")
axes[0, 0].set_ylabel("Loss")

# === 2. TRAIN CLS LOSS ===
axes[0, 1].plot(df["epoch"], df["train/cls_loss"], color="tab:orange")
axes[0, 1].set_title("Train Class Loss")
axes[0, 1].set_xlabel("Epoch")
axes[0, 1].set_ylabel("Loss")

# === 3. TRAIN DFL LOSS ===
axes[0, 2].plot(df["epoch"], df["train/dfl_loss"], color="tab:green")
axes[0, 2].set_title("Train DFL Loss")
axes[0, 2].set_xlabel("Epoch")
axes[0, 2].set_ylabel("Loss")

# === 4. VAL BOX LOSS ===
axes[1, 0].plot(df["epoch"], df["val/box_loss"], color="tab:red")
axes[1, 0].set_title("Val Box Loss")
axes[1, 0].set_xlabel("Epoch")
axes[1, 0].set_ylabel("Loss")

# === 5. VAL CLS LOSS ===
axes[1, 1].plot(df["epoch"], df["val/cls_loss"], color="tab:purple")
axes[1, 1].set_title("Val Class Loss")
axes[1, 1].set_xlabel("Epoch")
axes[1, 1].set_ylabel("Loss")

# === 6. VAL DFL LOSS ===
axes[1, 2].plot(df["epoch"], df["val/dfl_loss"], color="tab:brown")
axes[1, 2].set_title("Val DFL Loss")
axes[1, 2].set_xlabel("Epoch")
axes[1, 2].set_ylabel("Loss")

# === 7. PRECISION ===
axes[2, 0].plot(df["epoch"], df["metrics/precision(B)"], color="tab:cyan")
axes[2, 0].set_title("Precision")
axes[2, 0].set_xlabel("Epoch")
axes[2, 0].set_ylabel("Precision")

# === 8. RECALL ===
axes[2, 1].plot(df["epoch"], df["metrics/recall(B)"], color="tab:olive")
axes[2, 1].set_title("Recall")
axes[2, 1].set_xlabel("Epoch")
axes[2, 1].set_ylabel("Recall")

# === 9. mAP50 ===
axes[2, 2].plot(df["epoch"], df["metrics/mAP50(B)"], label="mAP50", color="tab:pink")
axes[2, 2].plot(df["epoch"], df["metrics/mAP50-95(B)"], label="mAP50-95", color="tab:gray")
axes[2, 2].set_title("mAP50 & mAP50-95")
axes[2, 2].set_xlabel("Epoch")
axes[2, 2].set_ylabel("mAP")
axes[2, 2].legend()

plt.tight_layout()
plt.show()
