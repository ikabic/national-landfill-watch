
CREATE DATABASE landfill_db;

\c landfill_db

CREATE TABLE IF NOT EXISTS public.landfills (
    id serial PRIMARY KEY,
    name text NOT NULL,
    category text NOT NULL,
    geojson text NOT NULL,
    reportedat timestamp NOT NULL DEFAULT NOW()
);

INSERT INTO public.landfills (name, category, geojson, reportedat)
VALUES
('Divlja deponija A', 'wild', '{}' , NOW()),
('Sanitarna B', 'sanitary', '{}' , NOW());
