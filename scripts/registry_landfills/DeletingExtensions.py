import pandas as pd

input_csv = "final.csv"
output_csv = "registry_landfills.csv"

df = pd.read_csv(input_csv)

df["image_name"] = df["image_name"].str.replace(".jpg", "", regex=False)

df.to_csv(output_csv, index=False, encoding="utf-8")


