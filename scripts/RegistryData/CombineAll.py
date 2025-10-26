import pandas as pd
import os

divlje_file = "divlje_deponije_final.csv"
sanitarne_file = "sanitarne_deponije_final.csv"
nesanitarne_file = "nesanitarne_deponije_final.csv"

output_file = "combined.csv"


dfs = []

for f in [divlje_file, sanitarne_file, nesanitarne_file]:
    if os.path.exists(f):
        df = pd.read_csv(f)
        dfs.append(df)

if dfs:
    df_final = pd.concat(dfs, ignore_index=True)
    df_final.to_csv(output_file, index=False, encoding="utf-8-sig")
    print(f"✅ Sve deponije spojene u {output_file}, ukupno redova: {len(df_final)}")

