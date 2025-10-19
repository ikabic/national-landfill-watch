
CREATE DATABASE landfill_db;

\c landfill_db

CREATE TABLE IF NOT EXISTS landfills (
    id serial PRIMARY KEY,
    name text NOT NULL,
    category text NOT NULL,
    geojson text NOT NULL,
    reportedat timestamp NOT NULL,
    lat double precision NOT NULL,
    lng double precision NOT NULL
);

INSERT INTO landfills (name, category, geojson, reportedat, lat, lng)
VALUES
('Divlja deponija A', 'wild', '{}', NOW(), 44.8176, 20.4569),   
('Sanitarna B', 'sanitary', '{}', NOW(), 44.8200, 20.4600);      

SELECT * FROM landfills;