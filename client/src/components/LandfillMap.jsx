import { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import * as turf from "@turf/turf";

import "../css/LandfillMap.css";
import "leaflet/dist/leaflet.css";
import LandfillDetailsPanel from "./LandfillDetailsPanel"; 

function LandfillMap() {
  const [landfills, setLandfills] = useState([]);
  const [border, setBorder] = useState(null);
  const [selectedLandfill, setSelectedLandfill] = useState(null);

  useEffect(() => {
    axios.get("/api/landfills")
      .then((res) => setLandfills(res.data))
      .catch((err) => console.error(err));

    axios.get("/serbia-border.geojson")
    .then((res) => {
      const data = res.data;

      if (data.type === "FeatureCollection" && data.features?.length > 0) {
        let merged = data.features[0];

        for (let i = 1; i < data.features.length; i++) {
          try {
            // Normalizuj obe geometrije da budu MultiPolygon
            const a = turf.flatten(merged);
            const b = turf.flatten(data.features[i]);

            // Ako flatten da više delova, spoji ih u kolekciju
            const unionInput = turf.featureCollection([
              ...a.features,
              ...b.features
            ]);

            // Napravi jedan MultiPolygon iz svih
            merged = turf.combine(unionInput);
            merged = turf.buffer(merged, 0); // da spoji i ako su male rupe
          } catch (err) {
            console.warn("Union failed for feature", i, err);
          }
        }

        setBorder(merged);
      } else if (data.type === "Feature") {
        setBorder(data);
      } else {
        console.error("Unexpected GeoJSON structure:", data);
      }
    })
    .catch((err) => console.error("Failed to load border:", err));
  }, []);

  const handleMarkerClick = (id) => {
    axios.get(`/api/landfills/${id}`)
      .then(res => setSelectedLandfill(res.data))
      .catch(err => console.error(err));
  };

  const closePanel = () => setSelectedLandfill(null);

  return <MapContainer className="map" center={[44.8176, 20.4569]} zoom={8} minZoom={7} zoomSnap={0} wheelPxPerZoomLevel={100}>
    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

    {border && <GeoJSON data={border} style={{ color: "#d18135ff", weight: 2, fillOpacity: 0 }} />}

    {landfills.map(lf => (
          <Marker
            key={lf.id}
            position={[lf.centerLat, lf.centerLon]}
            eventHandlers={{ click: () => handleMarkerClick(lf.id) }}
          >
            <Popup>{lf.id}</Popup>
          </Marker>
        ))}
    {selectedLandfill && (
        <LandfillDetailsPanel landfill={selectedLandfill} onClose={closePanel} />
      )}
  </MapContainer>
}

export default LandfillMap;
