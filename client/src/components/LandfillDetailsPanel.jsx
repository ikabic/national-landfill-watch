import React, { useRef, useEffect, useState } from "react";
import '../css/LandfillDetailsPanel.css';

function LandfillDetailsPanel({ landfill, onClose }) {
  const canvasRef = useRef(null);
  const [img, setImg] = useState(null);
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

      // nacrtaj osnovnu sliku
      ctx.drawImage(img, 0, 0);

      // nacrtaj bbox direktno na slici
      try {
        const geo = JSON.parse(landfill.geoJson);
        const bbox = geo.features.find(f => f.properties.type === "bbox");
        if (bbox) {
          ctx.beginPath();
          bbox.geometry.coordinates[0].forEach(([x, y], i) => {
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.closePath();
          ctx.strokeStyle = "white";  // ili crveno, ili šta želiš
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      } catch (err) {
        console.error("Failed to parse GeoJSON", err);
      }
    };
  }, [imageUrl, landfill]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const zoomSize = 300; 
    const zoom = 2; 

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // funkcija koja crta osnovnu sliku + bbox
      const drawBaseImage = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        // nacrtaj bounding box
        try {
          const geo = JSON.parse(landfill.geoJson);
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

      drawBaseImage();

      const handleMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        drawBaseImage(); // crta celu sliku sa bbox-om

        // region koji se zumira
        const sx = mouseX - zoomSize / (2 * zoom);
        const sy = mouseY - zoomSize / (2 * zoom);
        const sw = zoomSize / zoom;
        const sh = zoomSize / zoom;

        // pozicija zoom kvadrata centrirano na miš
        let dx = mouseX - zoomSize / 2;
        let dy = mouseY - zoomSize / 2;
        if (dx < 0) dx = 0;
        if (dy < 0) dy = 0;
        if (dx + zoomSize > canvas.width) dx = canvas.width - zoomSize;
        if (dy + zoomSize > canvas.height) dy = canvas.height - zoomSize;

        // nacrtaj zoom kvadrat
        ctx.drawImage(canvas, sx, sy, sw, sh, dx, dy, zoomSize, zoomSize);
      };

      const handleMouseLeave = () => drawBaseImage();

      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
      };
    };
  }, [imageUrl, landfill]);

  return (
    <div className="side-panel open">
      <button className="close-btn" onClick={onClose}>X</button>
      <h2>{landfill.imageName}</h2>

      <canvas ref={canvasRef} style={{ maxWidth: "100%", cursor: "zoom-in" }} />

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
