import { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import L from "leaflet";
import { makePinIcon } from "../utils/makePinIcon";

import "../css/LandfillMap.css";
import "leaflet/dist/leaflet.css";

function LandfillMap() {
  const [landfills, setLandfills] = useState([]);
  const [border, setBorder] = useState(null);

  const sanitaryIcon = makePinIcon("#2E7D32", "♻️");
  const unsanitaryIcon = makePinIcon("#d18135ff", "☣️");

  useEffect(() => {
    axios.get("/api/landfills")
      .then((res) => setLandfills(res.data))
      .catch((err) => console.error(err));

    axios.get("/serbia-border.geojson")
      .then((res) => setBorder(res.data))
      .catch((err) => console.error("Failed to load border:", err));
  }, []);

  return <MapContainer className="map" center={[44.8176, 20.4569]} zoom={8} minZoom={7} zoomSnap={0} wheelPxPerZoomLevel={100}>
    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

    {border && <GeoJSON data={border} renderer={L.canvas()} style={{ color: "#d18135ff", weight: 2, fillOpacity: 0 }} />}

    {landfills.map((lf) => (
      <Marker key={lf.id} position={[lf.lat, lf.lng]} icon={lf.category === "Sanitary" ? sanitaryIcon : unsanitaryIcon}>
        <Popup>
          {lf.name} ({lf.category})
        </Popup>
      </Marker>
    ))}
  </MapContainer>
}

export default LandfillMap;
