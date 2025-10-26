import pandas as pd
import math
from datetime import datetime

AVERAGE_HEIGHT_M = 2.5
MSW_DENSITY_TON_PER_M3 = 0.5
START_YEAR_DEFAULT = 2005
K = 0.1
MCF = 0.6
DOC = 0.218
F = 0.5
DOCF = 0.5
CO2_EQ = 28

current_year = datetime.now().year

def calc_fod_emission(msw_per_year, k, years, mcf, doc, f, co2_eq):
    ch4_total = 0
    L0 = DOC * DOCF * F * (16.0 / 12.0)

    for t in range(1, years + 1):
        ch4_t = 0
        for x in range(1, t + 1):
            ch4_t += msw_per_year * L0 * k * math.exp(-k * (t - x)) * mcf
        ch4_total += ch4_t

    co2e_total = ch4_total * co2_eq
    annual_ch4 = ch4_total / years
    annual_co2e = co2e_total / years

    return round(annual_ch4, 2), round(annual_co2e, 2)

input_file = "divlje_deponije.csv"
output_file = "divlje_deponije_final.csv"
df = pd.read_csv(input_file)

results = []

for idx, row in df.iterrows():
    total_mass_ton = row['total_mass_ton']
    start_year = row.get('start_year', START_YEAR_DEFAULT)
    if pd.isna(start_year):
        start_year = START_YEAR_DEFAULT

    life_years = current_year - int(start_year)
    life_years = max(life_years, 1)

    area_m2 = row['area_m2']
    volume_m3 = area_m2 * AVERAGE_HEIGHT_M

    amswx = total_mass_ton / life_years

    annual_ch4, annual_co2e = calc_fod_emission(amswx, K, life_years, MCF, DOC, F, CO2_EQ)

    results.append({
        "type": row['type'],
        "lat": row['lat'],
        "lon": row['lon'],
        "start_year": start_year,
        "life_years": life_years,
        "total_mass_ton": round(total_mass_ton, 2),
        "area_m2": round(area_m2, 2),
        "volume_m3": round(volume_m3, 2),
        "annual_msw_ton": round(amswx, 2),
        "annual_ch4_tonnes": annual_ch4,
        "annual_co2e_tonnes": annual_co2e
    })

df_out = pd.DataFrame(results)
df_out.to_csv(output_file, index=False, encoding="utf-8-sig")
