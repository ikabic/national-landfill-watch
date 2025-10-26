import axios from "axios";
import L from "leaflet";

import { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { FaBars } from "react-icons/fa";
import { shiftMapCenter } from "../utils/shiftMapCenter";

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
import LayerPanel from "./LayerPanel";
import EduInfoPanel from "./EduInfoPanel";

import "leaflet/dist/leaflet.css";
import "../css/LandfillMap.css";


function LandfillMap() {
  const [landfills, setLandfills] = useState([]);
  const [registryLandfills, setRegistryLandfills] = useState([]);
  const [border, setBorder] = useState(null);
  const [selectedLandfill, setSelectedLandfill] = useState(null);
  const [panelOpen, setPanelOpen] = useState({ state: true, type: "Serbia" });
  const [layersOpen, setLayersOpen] = useState(false);
  const [proximityLandfills, setProximityLandfills] = useState([]);

  const [showRegistryLayer, setShowRegistryLayerState] = useState({ sanitary: false, unsanitary: false });
  const [showDetectedLayer, setShowDetectedLayerState] = useState({ sanitary: true, unsanitary: true });
  const setShowDetectedLayer = useCallback((updater) => setShowDetectedLayerState(prev => typeof updater === "function" ? updater(prev) : updater), []);
  const setShowRegistryLayer = useCallback((updater) => setShowRegistryLayerState(prev => typeof updater === "function" ? updater(prev) : updater), []);

  const activeMarkerRef = useRef(null);
  const landfillProximityRef = useRef([]);
  const mapRef = useRef(null);

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

  useEffect(() => {
    const timeout = setTimeout(() => shiftMapCenter(mapRef?.current, panelOpen.state, layersOpen), 150);
    return () => clearTimeout(timeout);
  }, [mapRef.current, panelOpen.state, layersOpen]);

  const handleOnLocation = (coords, zoom) => shiftMapCenter(mapRef?.current, panelOpen.state, layersOpen, coords, zoom);

  const handleMarkerClick = async (id, map, source) => {
    let landfill;
    const endpoint = source === "registry" ? `/api/registrylandfills/${id}` : `/api/landfills/${id}`;

    await axios.get(endpoint)
      .then(res => { landfill = { ...res.data, id: id, source: source }; setSelectedLandfill(landfill); })
      .then(() => {
        setPanelOpen({ state: true, type: "Landfill" });
        handleOnLocation([landfill.centerLat, landfill.centerLon]);
      })
      .catch(err => console.error(err));

    if (landfillProximityRef.current) landfillProximityRef.current.forEach(c => map.removeLayer(c));
    landfillProximityRef.current = [];

    if (source === "detected") {
      const area = await LandfillProximity(map, landfill.centerLat, landfill.centerLon, "#b93b37c4");
      if (area.length > 0) landfillProximityRef.current.push(...area.map(lf => lf.area));
    }
  };

  return <>
    <Logo />

    <MapContainer className="map" center={[44.8176, 20.4569]} zoom={8} minZoom={7} zoomSnap={0} wheelPxPerZoomLevel={100} ref={mapRef}
      zoomControl={false} renderer={L.canvas()} preferCanvas={true}>
      <TileLayer className="map-tiles" url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

      <SearchBar panelOpen={panelOpen} mapRefs={{ map: mapRef, activeMarkerRef, landfillProximityRef }} setPanelOpen={setPanelOpen} setProximityLandfills={setProximityLandfills} onLocation={handleOnLocation} />

      <div className="map-controls">
        <ZoomControls />
        <VerticalToolbar activeMarkerRef={activeMarkerRef} landfillProximityRef={landfillProximityRef} setLayersOpen={setLayersOpen} setPanelOpen={setPanelOpen} setProximityLandfills={setProximityLandfills} onLocation={handleOnLocation} />
      </div>

      {border && <GeoJSON data={border} renderer={L.canvas()} style={{ color: "#864c19", weight: 2, fillOpacity: 0 }} />}

      <MarkerCluster landfills={landfills} registryLandfills={registryLandfills} handleMarkerClick={handleMarkerClick} layersDetected={showDetectedLayer} layersRegistry={showRegistryLayer} />

      <UserPin activeMarkerRef={activeMarkerRef} landfillProximityRef={landfillProximityRef} setPanelOpen={setPanelOpen} setProximityLandfills={setProximityLandfills} onLocation={handleOnLocation} />

      {!panelOpen.state && <button className="panel-btn" onClick={() => setPanelOpen({ state: true, type: "Serbia" })}><FaBars /></button>}

      <MapLegend />
    </MapContainer>

    <LayerPanel open={layersOpen} onClose={() => setLayersOpen(false)} setShowDetectedLayer={setShowDetectedLayer} showDetectedLayer={showDetectedLayer} setShowRegistryLayer={setShowRegistryLayer} showRegistryLayer={showRegistryLayer} />

    <LandfillInfoPanel open={panelOpen.type === "Landfill" && panelOpen.state} landfill={selectedLandfill} onClose={() => setPanelOpen({ state: false, type: "" })} />
    <SerbiaInfoPanel open={panelOpen.type === "Serbia" && panelOpen.state} onClose={() => setPanelOpen({ state: false, type: "" })} onLandfillClick={(id) => handleMarkerClick(id, mapRef?.current, "detected")} />
    <ProximityInfoPanel open={panelOpen.type === "Proximity" && panelOpen.state} onClose={() => setPanelOpen({ state: false, type: "" })} landfills={proximityLandfills} onLandfillClick={(id) => handleMarkerClick(id, mapRef?.current, "detected")} setPanelOpen={setPanelOpen} />
    <EduInfoPanel open={panelOpen.type === "Info" && panelOpen.state} onClose={() => setPanelOpen({ state: false, type: "" })} />
  </>
}

export default LandfillMap;
