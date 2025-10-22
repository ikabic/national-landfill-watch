import React, { useRef, useEffect } from "react";
import '../css/LandfillDetailsPanel.css';

function LandfillDetailsPanel({ landfill, onClose }) {
  const canvasRef = useRef(null);
  if (!landfill) return null;

  const imageUrl = `/static/images/landfills/${landfill.imageName}.jpg`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      try {
        const geo = JSON.parse(landfill.geoJson);

        // Nacrtaj bounding box
        const bbox = geo.features.find(f => f.properties.type === "bbox");
        if (bbox) {
          ctx.beginPath();
          bbox.geometry.coordinates[0].forEach(([x, y], i) => {
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.closePath();
          ctx.strokeStyle = "white";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

      } catch (err) {
        console.error("Failed to parse GeoJSON", err);
      }
    };
  }, [imageUrl, landfill]);

  return (
    <div className="side-panel open">
      <button className="close-btn" onClick={onClose}>X</button>
      <h2>{landfill.imageName}</h2>

      <canvas ref={canvasRef} style={{ maxWidth: "100%" }} />

      <p>Status: {landfill.status}</p>
      <p>Start Year: {landfill.startYear}</p>
      <p>Life Years: {landfill.lifeYears}</p>
      <p>Area (m²): {landfill.areaM2}</p>
      <p>Volume (m³): {landfill.volumeM3}</p>
      <p>Total Mass (t): {landfill.totalMassTon}</p>
      <p>Annual MSW (m³/year): {landfill.annualMswM3}</p>
      <p>Annual CH4 (t/year): {landfill.annualCH4Tonnes}</p>
      <p>Annual CO2e (t/year): {landfill.annualCO2eTonnes}</p>

      <p>Center Lat: {landfill.centerLat}</p>
      <p>Center Lon: {landfill.centerLon}</p>
      <p>Center X (px): {landfill.centerX}</p>
      <p>Center Y (px): {landfill.centerY}</p>
      <p>Width (px): {landfill.width}</p>
      <p>Height (px): {landfill.height}</p>
    </div>
  );
}

export default LandfillDetailsPanel;
