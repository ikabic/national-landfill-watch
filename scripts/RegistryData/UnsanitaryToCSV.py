import pandas as pd

input_file = "nesanitarne-deponije.xlsx"
output_file = "nesanitarne_deponije.csv"

df = pd.read_excel(input_file)

df_selected = df[[
    "Tip deponije",
    "Geografska širina",
    "Geografska dužina",
    "Godina početka deponovanja",
    "Godina završetka deponovanja",
    "Prosečne godišnje količine otpada, koji se odlaže na nesanitarnu deponiju - smetlište (t)"
]].copy()

df_selected["Godina završetka deponovanja"] = df_selected["Godina završetka deponovanja"].fillna(2025)

df_selected["Godina početka deponovanja"] = pd.to_numeric(df_selected["Godina početka deponovanja"], errors="coerce")
df_selected["Godina završetka deponovanja"] = pd.to_numeric(df_selected["Godina završetka deponovanja"], errors="coerce")
df_selected["Prosečne godišnje količine otpada, koji se odlaže na nesanitarnu deponiju - smetlište (t)"] = pd.to_numeric(
    df_selected["Prosečne godišnje količine otpada, koji se odlaže na nesanitarnu deponiju - smetlište (t)"], errors="coerce"
)

df_selected["total_mass_ton"] = (
    df_selected.apply(
        lambda row: (min(row["Godina završetka deponovanja"], 2025) - row["Godina početka deponovanja"])
        * row["Prosečne godišnje količine otpada, koji se odlaže na nesanitarnu deponiju - smetlište (t)"],
        axis=1
    )
)

df_selected = df_selected.rename(columns={
    "Tip deponije": "type",
    "Geografska širina": "lat",
    "Geografska dužina": "lon",
    "Godina početka deponovanja": "start_year"
})

df_final = df_selected[["type", "lat", "lon", "start_year", "total_mass_ton"]]

df_final.to_csv(output_file, index=False, encoding="utf-8-sig")

print(f"✅ Fajl '{input_file}' uspešno konvertovan u '{output_file}' sa izračunatom totalnom količinom otpada (default 2025).")
