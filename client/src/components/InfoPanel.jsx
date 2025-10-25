import { FaArrowRight, FaArrowDown } from "react-icons/fa";
import { useMediaQuery } from "react-responsive";

import "../css/InfoPanel.css";

function InfoPanel({ open, onClose, title, actions, children }) {
  const isMobile = useMediaQuery({ maxWidth: "639px" });

  return <>
    <div className={`info-panel ${open ? "open" : ""}`}>
      <div className="info-panel-sidebar">
        <button className="panel-btn close" onClick={onClose}>
          {isMobile ? <FaArrowDown /> : <FaArrowRight />}
        </button>

        {actions}
      </div>

      <div className="info-panel-main">
        <h2 className="info-panel-title">
          <img className="info-panel-logo" src="/logo.png" />
          {title}
        </h2>

        <div className="info-panel-content"> {children} </div>
      </div>
    </div>
  </>
}

export default InfoPanel;
