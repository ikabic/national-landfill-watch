import { useState } from "react";
import { FaArrowDown } from "react-icons/fa";

import EyeToggle from "./EyeToggle";

import "../css/Layer.css";

function Layer({ name, className, show, setShow }) {
    const [open, setOpen] = useState(false);

    const showAll = show.sanitary || show.unsanitary;

    return <div className="layer-item">
        <div className="layer">
            <p className={className}>
                <span><span /></span>
                {name}
            </p>

            <div className="layer-actions">
                <EyeToggle setVisible={() => setShow(prev => ({ sanitary: !(prev.sanitary && prev.unsanitary), unsanitary: !(prev.sanitary && prev.unsanitary) }))} visible={showAll} />
                <button className={`layer-arrow ${open ? "rotated" : ""}`} onClick={() => setOpen(!open)}>
                    <FaArrowDown />
                </button>
            </div>
        </div>

        <div className={`layer-dropdown ${open ? "open" : ""}`}>
            <div className="sub-layer">
                <p>
                    <span>♻️</span>
                    Sanitary Landfills
                </p>
                <EyeToggle setVisible={() => setShow(prev => ({ ...prev, sanitary: !prev.sanitary }))} visible={show.sanitary} />
            </div>
            <div className="sub-layer">
                <p>
                    <span>☣️</span>
                    Unsanitary Landfills
                </p>
                <EyeToggle setVisible={() => setShow(prev => ({ ...prev, unsanitary: !prev.unsanitary }))} visible={show.unsanitary} />
            </div>
        </div>
    </div>
}

export default Layer;
