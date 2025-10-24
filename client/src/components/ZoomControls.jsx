import { useMap } from "react-leaflet";
import { FaPlus, FaMinus } from "react-icons/fa";

import "../css/ZoomControls.css";

function ZoomControls() {
  const map = useMap();

  return <div className="zoom-controls">
      <button onClick={() => map.zoomIn()}><FaPlus /></button>
      <button onClick={() => map.zoomOut()}><FaMinus /></button>
    </div>
}

export default ZoomControls;
