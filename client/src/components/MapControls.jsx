import { useMap } from "react-leaflet";
import { FaPlus, FaMinus } from "react-icons/fa";

import LocateMeButton from "./LocateMeButton";

import "../css/MapControls.css";

function MapControls({ activeMarkerRef }) {
  const map = useMap();

  return <div className="map-controls">
      <button onClick={() => map.zoomIn()}><FaPlus /></button>
      <button onClick={() => map.zoomOut()}><FaMinus /></button>
      <LocateMeButton activeMarkerRef={activeMarkerRef} />
    </div>
}

export default MapControls;
