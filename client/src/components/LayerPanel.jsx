import { FaArrowLeft, FaArrowDown } from "react-icons/fa";
import { useMediaQuery } from "react-responsive";

import Layer from "./Layer";

import "../css/LayerPanel.css";

function LayerPanel({ open, onClose, showRegistryLayer, setShowRegistryLayer, showDetectedLayer, setShowDetectedLayer }) {
    const isMobile = useMediaQuery({ maxWidth: "639px" });

    return <>
        <div className={`layer-panel ${open ? "open" : ""}`}>
            <div className="layer-panel-sidebar">
                <button className="panel-btn close" onClick={onClose}>{isMobile ? <FaArrowDown /> : <FaArrowLeft />}</button>
            </div>

            <div className="layer-panel-main">
                <h2 className="layer-panel-title"> Marker Layers </h2>
                <div className="layer-panel-content">
                    <Layer name="Model Detected Landfills" className="detected-layer" show={showDetectedLayer} setShow={setShowDetectedLayer} />
                    <Layer name="Study-Based Registry Landfills" className="registry-layer" show={showRegistryLayer} setShow={setShowRegistryLayer} />
                </div>
            </div>
        </div>
    </>
}

export default LayerPanel;
