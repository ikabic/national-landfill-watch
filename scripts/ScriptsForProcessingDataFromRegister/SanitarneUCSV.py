import pandas as pd

input_file = "sanitarne-deponije.xlsx"
output_file = "sanitarne_deponije.csv"

df = pd.read_excel(input_file)
df.columns = ["type", "lat", "lon", "start_year", "total_mass_ton"]
df.to_csv(output_file, index=False, encoding="utf-8-sig")

