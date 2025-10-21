
CREATE DATABASE IF NOT EXISTS landfill_db; 
\c landfill_db

CREATE TABLE IF NOT EXISTS public.landfills (
    id serial PRIMARY KEY,
    name text NOT NULL,
    status text NOT NULL,
    area_m2 double precision,
    volume_m3 double precision,
    ch4_tonnes_per_year double precision,
    co2e_tonnes_per_year double precision,
    geojson text NOT NULL DEFAULT '{}',
    lat double precision,
    lng double precision,
    reportedat timestamp NOT NULL DEFAULT now()
);

TRUNCATE TABLE public.landfills RESTART IDENTITY;

INSERT INTO public.landfills (name, status, geojson, reportedat, lat, lng, area_m2, volume_m3, ch4_tonnes_per_year, co2e_tonnes_per_year)
VALUES
('Divlja deponija A', 'wild', '{}', NOW(), 44.8176, 20.4569, 1500, 900, 2.5, 8.0),
('Sanitarna B', 'sanitary', '{}', NOW(), 44.8200, 20.4600, 5000, 3000, 8.0, 25.0);

SELECT id, name, status, lat, lng, area_m2 FROM public.landfills;
