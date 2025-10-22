import axios from "axios";
import L from "leaflet";
import * as turf from "@turf/turf";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { FaBars } from "react-icons/fa";

import MarkerCluster from "./MarkerCluster";
import MapControls from "./MapControls";
import UserPin from "./UserPin";
import LandfillDetailsPanel from "./LandfillDetailsPanel";

import "leaflet/dist/leaflet.css";
import "../css/LandfillMap.css";

function LandfillMap() {
  const [landfills, setLandfills] = useState([]);
  const [border, setBorder] = useState(null);
  const [selectedLandfill, setSelectedLandfill] = useState(null);

  const activeMarkerRef = useRef(null);
  const landfillProximityRef = useRef([]);

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
              const a = turf.flatten(merged);
              const b = turf.flatten(data.features[i]);
              const unionInput = turf.featureCollection([...a.features, ...b.features]);
              merged = turf.combine(unionInput);
              merged = turf.buffer(merged, 0);
            } catch (err) { console.warn("Union failed for feature", i, err); }
          }
          setBorder(merged);
        } else if (data.type === "Feature") { setBorder(data);
        } else { console.error("Unexpected GeoJSON structure:", data); }
      })
      .catch((err) => console.error("Failed to load border:", err));
  }, []);

  const handleMarkerClick = (id) => {
    axios.get(`/api/landfills/${id}`)
      .then(res => setSelectedLandfill(res.data))
      .catch(err => console.error(err));
  };

  const closePanel = () => setSelectedLandfill(null);

  return (
    <MapContainer className="map" center={[44.8176, 20.4569]} zoom={8} minZoom={7} zoomSnap={0} wheelPxPerZoomLevel={100} zoomControl={false} renderer={L.canvas()} preferCanvas={true}>
      <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

      <MapControls activeMarkerRef={activeMarkerRef} landfillProximityRef={landfillProximityRef} />

      {border && <GeoJSON data={border} renderer={L.canvas()} style={{ color: "#d18135ff", weight: 2, fillOpacity: 0 }} />}

      <MarkerCluster landfills={landfills} handleMarkerClick={handleMarkerClick} />

      {selectedLandfill && <LandfillDetailsPanel landfill={selectedLandfill} onClose={closePanel} />}
      <UserPin activeMarkerRef={activeMarkerRef} landfillProximityRef={landfillProximityRef} />
      <button className="panel-btn"><FaBars /></button>
    </MapContainer>
  );
}

export default LandfillMap;
