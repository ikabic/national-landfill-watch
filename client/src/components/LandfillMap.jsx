import axios from "axios";
import L from "leaflet";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { FaBars } from "react-icons/fa";

import MarkerCluster from "./MarkerCluster";
import ZoomControls from "./ZoomControls";
import UserPin from "./UserPin";
import MapLegend from "./MapLegend";
import LandfillInfoPanel from "./LandfillInfoPanel";
import SerbiaInfoPanel from "./SerbiaInfoPanel";
import ProximityInfoPanel from "./ProximityInfoPanel";
import LandfillProximity from "./LandfillProximity";
import VerticalToolbar from "./VerticalToolbar";
import Logo from "./Logo";
import SearchBar from "./SearchBar";

import "leaflet/dist/leaflet.css";
import "../css/LandfillMap.css";

function LandfillMap() {
  const [landfills, setLandfills] = useState([]);
  const [registryLandfills, setRegistryLandfills] = useState([]);
  const [border, setBorder] = useState(null);
  const [selectedLandfill, setSelectedLandfill] = useState(null);
  const [panelOpen, setPanelOpen] = useState({ state: true, type: "Serbia" });

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
      .then((res) => setRegistryLandfills(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleMarkerClick = async (id, map) => {
    let landfill;
    await axios.get(`/api/landfills/${id}`)
      .then(res => { landfill = { ...res.data, id: id }; setSelectedLandfill(landfill); })
      .then(() => setPanelOpen({ state: true, type: "Landfill" }))
      .catch(err => console.error(err));

    if (landfillProximityRef.current) landfillProximityRef.current.forEach(c => map.removeLayer(c));
    landfillProximityRef.current = [];

    const area = await LandfillProximity(map, 0, 0, "#b93b37c4", landfill);
    if (area) landfillProximityRef.current.push(...area);
  };

  return <>
    <Logo />

    <MapContainer className="map" center={[44.8176, 20.4569]} zoom={8} minZoom={7} zoomSnap={0} wheelPxPerZoomLevel={100} zoomControl={false} renderer={L.canvas()} preferCanvas={true}  whenCreated={(mapInstance) => (window._leaflet_map_instance = mapInstance)}>
      <TileLayer className="map-tiles" url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
      <SearchBar panelOpen={panelOpen.state} mapRefs={{ activeMarkerRef, landfillProximityRef }} setPanelOpen={setPanelOpen} />

      <div className="map-controls">
        <ZoomControls />
        <VerticalToolbar activeMarkerRef={activeMarkerRef} landfillProximityRef={landfillProximityRef} />
      </div>

      {border && <GeoJSON data={border} renderer={L.canvas()} style={{ color: "#864c19", weight: 2, fillOpacity: 0 }} />}

      <MarkerCluster landfills={landfills} registryLandfills={registryLandfills} handleMarkerClick={handleMarkerClick} />

      <UserPin activeMarkerRef={activeMarkerRef} landfillProximityRef={landfillProximityRef} setPanelOpen={setPanelOpen} />

      {!panelOpen.state && <button className="panel-btn" onClick={() => setPanelOpen({ state: true, type: "Serbia" })}><FaBars /></button>}

      <MapLegend />
    </MapContainer>

    <LandfillInfoPanel open={panelOpen.type === "Landfill" && panelOpen.state} landfill={selectedLandfill} onClose={() => setPanelOpen({ state: false, type: "" })} />
    <SerbiaInfoPanel open={panelOpen.type === "Serbia" && panelOpen.state} onClose={() => setPanelOpen({ state: false, type: "" })} />
    <ProximityInfoPanel open={panelOpen.type === "Proximity" && panelOpen.state} onClose={() => setPanelOpen({ state: false, type: "" })} />
  </>
}

export default LandfillMap;
