import { LuSquareDashed, LuFocus } from "react-icons/lu";
import { PiPolygonBold } from "react-icons/pi";
import { toDMS } from "../utils/toDMS";
import { useState } from "react";

import LandfillImageCanvas from "./LandfillImageCanvas";
import InfoPanel from "./InfoPanel";

import "../css/LandfillInfoPanel.css"

function LandfillInfoPanel({ open, onClose, landfill }) {
    const [showBoundingBox, setShowBoundingBox] = useState(false);
    const [showBoundingPolygon, setShowBoundingPolygon] = useState(true);
    const [enableZoom, setEnableZoom] = useState(false);

    if (!landfill) return;

    return <InfoPanel title="Serbia Landfill Overview" open={open} onClose={onClose}
        actions={
            <>
                <button className={`panel-btn bbox ${showBoundingBox ? "on" : ""}`}
                    title="Show bounding box" onClick={() => setShowBoundingBox(!showBoundingBox)}>
                    <LuSquareDashed />
                </button>

                <button className={`panel-btn seg ${showBoundingPolygon ? "on" : ""}`}
                    title="Show bounding polygon" onClick={() => setShowBoundingPolygon(!showBoundingPolygon)}>
                    <PiPolygonBold />
                </button>

                <button className={`panel-btn zoom ${enableZoom ? "on" : ""}`}
                    title="Enable zoom" onClick={() => setEnableZoom(!enableZoom)}>
                    <LuFocus />
                </button>
            </>
        }
    >
        {landfill && <LandfillImageCanvas imageName={landfill.imageName} geoJson={landfill.geoJson} segmentation={landfill.segmentation} showBoundingBox={showBoundingBox} showBoundingPolygon={showBoundingPolygon} enableZoom={enableZoom} />}

        <div className="info-panel-details">
            <div className="info-panel-details-section">
                <h2>Landfill #{landfill.id}</h2>
                <p>{toDMS(landfill.centerLat, true)} {toDMS(landfill.centerLon, false)}</p>
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
    </InfoPanel>
}

export default LandfillInfoPanel;