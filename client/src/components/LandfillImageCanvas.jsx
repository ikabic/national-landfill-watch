import { useRef, useEffect } from "react";

function LandfillImageCanvas({ imageName, geoJson, showBoundingBox = true }) {
  const canvasRef = useRef(null);
  const imageUrl = `/static/images/landfills/${imageName}.jpg`;

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
        const geo = JSON.parse(geoJson);

        const bbox = geo.features.find(f => f.properties.type === "bbox");
        if (showBoundingBox && bbox) {
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
      } catch (err) { console.error(err); }
    };
  }, [imageUrl, geoJson, showBoundingBox]);

  return <canvas ref={canvasRef} />;
}

export default LandfillImageCanvas;
