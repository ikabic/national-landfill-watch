import pandas as pd

input_file = "combined.csv"
output_file = "formatted.csv"

df = pd.read_csv(input_file, sep=",", dtype=str)

result_rows = []

i = 0
while i < len(df):
    row = df.iloc[i]
    t = row["type"]

    if t == "Divlje deponije":
        row["type"] = "Wild"
        result_rows.append(row)
        i += 1
        continue

    if t == "Nesanitarne deponije":
        row["type"] = "Unsanitary"
        result_rows.append(row)
        i += 1
        continue

    group_name = t
    start_index = i

    while i + 1 < len(df) and df.iloc[i + 1]["type"] == group_name:
        i += 1

    end_index = i

    first = df.iloc[start_index]
    last = df.iloc[end_index]

    new_row = first.copy()
    new_row["area_m2"] = last["area_m2"]
    new_row["volume_m3"] = last["volume_m3"]

    new_row["annual_msw_ton"] = 0
    new_row["annual_ch4_tonnes"] = 0
    new_row["annual_co2e_tonnes"] = 0

    new_row["type"] = "Sanitary"

    result_rows.append(new_row)

    i += 1


final_df = pd.DataFrame(result_rows)
final_df.to_csv(output_file, index=False)

