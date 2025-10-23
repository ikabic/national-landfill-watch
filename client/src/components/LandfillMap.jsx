import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";

import MapControls from "./MapControls";
import { makePinIcon } from "../utils/makePinIcon";
import UserPin from "./UserPin";
import { FaBars } from "react-icons/fa";
import LandfillDetailsPanel from "./LandfillDetailsPanel";
import * as turf from "@turf/turf";

import "../css/LandfillMap.css";

function MarkerClusterGroupWrapper({ landfills, handleMarkerClick, sanitaryIcon, unsanitaryIcon }) {
  const map = useMap();

  useEffect(() => {
    const markers = L.markerClusterGroup();

    landfills.forEach((lf) => {
      const marker = L.marker([lf.centerLat, lf.centerLon], {
        icon: lf.category === "Sanitary" ? sanitaryIcon : unsanitaryIcon
      }).on("click", () => handleMarkerClick(lf.id, map));

      markers.addLayer(marker);
    });

    map.addLayer(markers);
    return () => map.removeLayer(markers);
  }, [landfills, map]);

  return null;
}

function LandfillMap() {
  const [landfills, setLandfills] = useState([]);
  const [border, setBorder] = useState(null);
  const activeMarkerRef = useRef(null);
  const [selectedLandfill, setSelectedLandfill] = useState(null);

  const sanitaryIcon = makePinIcon("#2E7D32", "♻️");
  const unsanitaryIcon = makePinIcon("#d18135ff", "☣️");

  const circlesRef = useRef([]);

  useEffect(() => {
    axios.get("/api/landfills/markers")
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

  const handleMarkerClick = (id, map) => {
    axios.get(`/api/landfills/${id}`)
      .then(res => {
        const landfill = res.data;
        setSelectedLandfill(landfill);

        circlesRef.current.forEach(c => map.removeLayer(c));
        circlesRef.current = [];

        const geo = JSON.parse(landfill.geoJson);
        const influenceRadius = geo.features.find(f => f.properties.type === "influence").properties['influence_radius'];

        const circle = L.circle([landfill.centerLat, landfill.centerLon], {
          radius: influenceRadius,
          color: "#d9534f",
          weight: 2,
          fillOpacity: 0.2,
          interactive: false 
        }).addTo(map);

        circlesRef.current.push(circle);
      })
      .catch(err => console.error(err));
  };

  const closePanel = () => setSelectedLandfill(null);

  return (
    <MapContainer className="map" center={[44.8176, 20.4569]} zoom={8} minZoom={7} zoomSnap={0} wheelPxPerZoomLevel={100} zoomControl={false} renderer={L.canvas()} preferCanvas={true}>
      <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

      <MapControls activeMarkerRef={activeMarkerRef} />

      {border && <GeoJSON data={border} renderer={L.canvas()} style={{ color: "#d18135ff", weight: 2, fillOpacity: 0 }} />}

      <MarkerClusterGroupWrapper
        landfills={landfills}
        handleMarkerClick={handleMarkerClick}
        sanitaryIcon={sanitaryIcon}
        unsanitaryIcon={unsanitaryIcon}
      />

      {selectedLandfill && <LandfillDetailsPanel landfill={selectedLandfill} onClose={closePanel} />}
      <UserPin activeMarkerRef={activeMarkerRef} circlesRef={circlesRef}/>
      <button className="panel-btn"><FaBars /></button>
    </MapContainer>
  );
}

export default LandfillMap;
