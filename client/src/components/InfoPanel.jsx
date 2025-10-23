import { FaArrowRight } from "react-icons/fa";
import { LuSquareDashed } from "react-icons/lu";
import { PiPolygonBold } from "react-icons/pi";
import { useState } from "react";

import LandfillImageCanvas from "./LandfillImageCanvas";

import "../css/InfoPanel.css";

function InfoPanel({ open, onClose, landfill }) {
  const [showBoundingBox, setShowBoundingBox] = useState(true);
  const [showBoundingPolygon, setShowBoundingPolygon] = useState(true);

  if (!landfill) return; // temp

  return <>
    <div className={`info-panel ${open ? "open" : ""}`}>
      <div className="info-panel-sidebar">
        <button className="panel-btn close" onClick={onClose}><FaArrowRight /></button>

        <button className={`panel-btn bbox ${showBoundingBox ? "" : "off"}`}
          title="Show bounding box" onClick={() => setShowBoundingBox(!showBoundingBox)}>
          <LuSquareDashed />
        </button>

        <button className={`panel-btn seg ${showBoundingPolygon ? "" : "off"}`}
          title="Show bounding polygon" onClick={() => setShowBoundingPolygon(!showBoundingPolygon)}>
          <PiPolygonBold />
        </button>
      </div>

      <div className="info-panel-main">
        <h2 className="info-panel-title">
          <img className="info-panel-logo" src="/logo.png" />
          Serbia Landfill Overview
        </h2>

        {landfill && <LandfillImageCanvas imageName={landfill.imageName} geoJson={landfill.geoJson} showBoundingBox={showBoundingBox} />}

        <div className="info-panel-details">
          <div className="info-panel-details-section">
            <h2>Landfill #{landfill.id}</h2>
            <h4>{`${landfill.status} Landfill`.toUpperCase()}</h4>
          </div>

          <div className="info-panel-details-section">
            <p>Estimated area<span>{landfill.areaM2} m²</span></p>
            <p>Estimated volume<span>{landfill.volumeM3} m³</span></p>
          </div>

          <div className="info-panel-details-section">
            <p>Estimated CH4 emissions<span>{landfill.annualCH4Tonnes} ton/year</span></p>
            <p>Estimated CH4 emissions (CO2eq)<span>{landfill.annualCO2eTonnes} ton/year</span></p>
          </div>
        </div>
      </div>
    </div>
  </>
}

export default InfoPanel;
