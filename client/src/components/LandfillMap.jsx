import axios from "axios";
import L from "leaflet";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { FaBars } from "react-icons/fa";

import MarkerCluster from "./MarkerCluster";
import ZoomControls from "./ZoomControls";
import UserPin from "./UserPin";
import MapLegend from "./MapLegend";
import InfoPanel from "./InfoPanel";
import LandfillProximity from "./LandfillProximity";
import VerticalToolbar from "./VerticalToolbar";
import Logo from "./Logo";

import "leaflet/dist/leaflet.css";
import "../css/LandfillMap.css";

function LandfillMap() {
  const [landfills, setLandfills] = useState([]);
  const [border, setBorder] = useState(null);
  const [selectedLandfill, setSelectedLandfill] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const activeMarkerRef = useRef(null);
  const landfillProximityRef = useRef([]);

  useEffect(() => {
    axios.get("/api/landfills/markers")
      .then((res) => setLandfills(res.data))
      .catch((err) => console.error(err));

    axios.get("/serbia.geojson")
      .then((res) => {
        const data = res.data;

        if (data.type === "FeatureCollection" && data.features?.length > 0) setBorder(data.features[0]);
        else if (data.type === "Feature") setBorder(data);
        else console.error("Unexpected GeoJSON structure:", data);
      })
      .catch((err) => console.error("Failed to load border:", err));

    axios.get("/api/registrylandfills/markers")
      .then((res) => {console.log(res.data)})
      .catch((err) => console.error(err));
  }, []);

  const handleMarkerClick = async (id, map) => {
    let landfill;
    await axios.get(`/api/landfills/${id}`)
      .then(res => { landfill = { ...res.data, id: id }; setSelectedLandfill(landfill); })
      .then(() => setPanelOpen(true))
      .catch(err => console.error(err));

    if (landfillProximityRef.current) landfillProximityRef.current.forEach(c => map.removeLayer(c));
    landfillProximityRef.current = [];

    const area = await LandfillProximity(map, 0, 0, "#b93b37c4", landfill);
    if (area) landfillProximityRef.current.push(...area);
  };

  return <>
    <Logo />

    <MapContainer className="map" center={[44.8176, 20.4569]} zoom={8} minZoom={7} zoomSnap={0} wheelPxPerZoomLevel={100} zoomControl={false} renderer={L.canvas()} preferCanvas={true}>
      <TileLayer className="map-tiles" url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

      <div className="map-controls">
        <ZoomControls />
        <VerticalToolbar activeMarkerRef={activeMarkerRef} landfillProximityRef={landfillProximityRef} />
      </div>

      {border && <GeoJSON data={border} renderer={L.canvas()} style={{ color: "#864c19", weight: 2, fillOpacity: 0 }} />}

      <MarkerCluster landfills={landfills} handleMarkerClick={handleMarkerClick} />

      <UserPin activeMarkerRef={activeMarkerRef} landfillProximityRef={landfillProximityRef} />

      {!panelOpen && <button className="panel-btn" onClick={() => setPanelOpen(true)}><FaBars /></button>}

      <MapLegend />
    </MapContainer>

    <InfoPanel open={panelOpen} landfill={selectedLandfill} onClose={() => setPanelOpen(false)} />
  </>
}

export default LandfillMap;
