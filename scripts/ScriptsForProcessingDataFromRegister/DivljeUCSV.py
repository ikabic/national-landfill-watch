import pandas as pd

input_file = "divlje-deponije.xlsx"
output_file = "divlje_deponije.csv"

df = pd.read_excel(input_file)

df_selected = df[[
    "Tip deponije",
    "Geografska širina",
    "Geografska dužina",
    "Procenjena količina otpada (t)",
    "Procenjena površina smetlišta (m2)"
]].copy()

df_selected["start_year"] = 2005

df_selected = df_selected.rename(columns={
    "Tip deponije": "type",
    "Geografska širina": "lat",
    "Geografska dužina": "lon",
    "Procenjena količina otpada (t)": "total_mass_ton",
    "Procenjena površina smetlišta (m2)": "area_m2"
})

df_selected = df_selected[["type", "lat", "lon", "start_year", "total_mass_ton", "area_m2"]]
df_selected = df_selected.dropna(subset=["lat", "lon"])
df_selected.to_csv(output_file, index=False, encoding="utf-8-sig")

