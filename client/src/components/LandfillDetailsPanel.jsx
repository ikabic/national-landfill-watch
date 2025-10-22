import React from "react";
import '../css/LandfillDetailsPanel.css';

function LandfillDetailsPanel({ landfill, onClose }) {
  if (!landfill) return null; 

  return (
    <div className="side-panel open">
      <button className="close-btn" onClick={onClose}>X</button>
      <h2>{landfill.name}</h2>
      <p>Status: {landfill.status}</p>
      <p>Area (m²): {landfill.areaM2}</p>
      <p>Volume (m³): {landfill.volumeM3}</p>
      <p>Methane (t/year): {landfill.methaneTonsPerYear}</p>
      <p>CO2e (t/year): {landfill.co2eTonsPerYear}</p>
      {/* mozda kasnije slike/geojson prikaz ?? */}
    </div>
  );
}

export default LandfillDetailsPanel;
