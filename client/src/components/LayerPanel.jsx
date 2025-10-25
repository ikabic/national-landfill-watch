import { FaArrowLeft } from "react-icons/fa";

import EyeToggle from "./EyeToggle";

import "../css/LayerPanel.css";

function LayerPanel({ open, onClose, showRegistryLayer, setShowRegistryLayer, showDetectedLayer, setShowDetectedLayer }) {
    return <>
        <div className={`layer-panel ${open ? "open" : ""}`}>
            <div className="layer-panel-sidebar">
                <button className="panel-btn close" onClick={onClose}><FaArrowLeft /></button>
            </div>

            <div className="layer-panel-main">
                <h2 className="layer-panel-title"> Marker Layers </h2>
                <div className="layer-panel-content">
                    <div className="layer">
                        <p className="registry-layer">
                            <span>  <span /> </span>
                            Study-Based Registry Landfills
                        </p>

                        <EyeToggle setVisible={setShowRegistryLayer} visible={showRegistryLayer} />
                    </div>

                    <div className="layer">
                        <p className="detected-layer">
                            <span>  <span /> </span>
                            Model Detected Landfills
                        </p>

                        <EyeToggle setVisible={setShowDetectedLayer} visible={showDetectedLayer} />
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default LayerPanel;
