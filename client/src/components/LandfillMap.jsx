import { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, Circle } from "react-leaflet";

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
      .then((res) => setBorder(res.data))
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
          <>
          <Marker
            key={lf.id}
            position={[lf.lat, lf.lng]}
            eventHandlers={{ click: () => handleMarkerClick(lf.id) }}
          >
            <Popup>{lf.name}</Popup>
          </Marker>
           {selectedLandfill?.id === lf.id && (
             <Circle
                  key={`circle-${lf.id}`}
                  center={[lf.lat, lf.lng]}
                  radius={1000}
                  pathOptions={{ color: "red", fillColor: "red", fillOpacity: 0.15 }}
             />
           )}
        </>
        ))}
    {selectedLandfill && (
        <LandfillDetailsPanel landfill={selectedLandfill} onClose={closePanel} />
      )}
  </MapContainer>
}

export default LandfillMap;
