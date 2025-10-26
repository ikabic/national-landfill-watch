import { useState } from "react";
import { FaMap, FaLayerGroup, FaAngleDown } from "react-icons/fa";

import LocateMeButton from "./LocateMeButton";

import "../css/VerticalToolbar.css";

function VerticalToolbar({ activeMarkerRef, landfillProximityRef, setLayersOpen, setPanelOpen, setProximityLandfills, onLocation }) {
    const [expanded, setExpanded] = useState(true);

    return <div className={`toolbar ${expanded ? "expanded" : "collapsed"}`}>
         <button className={`toolbar-btn toggle ${expanded ? "rotated" : ""}`} onClick={() => setExpanded(!expanded)} title="Toggle toolbar">
            <FaAngleDown />
        </button>

        <div className="toolbar-buttons">
            <button onClick={() => onLocation([44.8176, 20.4569], 8)}><FaMap/></button>
            <LocateMeButton activeMarkerRef={activeMarkerRef} landfillProximityRef={landfillProximityRef} setPanelOpen={setPanelOpen} setProximityLandfills={setProximityLandfills} onLocation={onLocation} />
            <button onClick={() => setLayersOpen(true)}><FaLayerGroup /></button>
        </div>
    </div>
}

export default VerticalToolbar;
