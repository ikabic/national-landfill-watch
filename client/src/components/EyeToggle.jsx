import { FaEye, FaEyeSlash } from "react-icons/fa";

import "../css/EyeToggle.css";

export default function EyeToggle({ visible, setVisible }) {
  return <button className="eye-toggle" onClick={() => setVisible(!visible)}>
    <div className={`icon-wrapper ${visible ? "hide" : "show"}`}> <FaEyeSlash /> </div>
    <div className={`icon-wrapper ${visible ? "show" : "hide"}`}> <FaEye /> </div>
  </button>
}
