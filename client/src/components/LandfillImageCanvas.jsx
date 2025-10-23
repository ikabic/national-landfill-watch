import { useRef, useEffect } from "react";
import { getCropRegion } from "../utils/getCropRegion";
import { setupCanvasZoom } from "../utils/setupCanvasZoom";

function LandfillImageCanvas({ imageName, geoJson, segmentation, showBoundingBox = true, showBoundingPolygon = true, enableZoom = true }) {
  const canvasRef = useRef(null);
  const imageUrl = `/static/images/landfills/${imageName}.jpg`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = imageUrl;
    let cleanup = null;

    img.onload = () => {
      let coords = [];
      try {
        const geo = JSON.parse(geoJson);
        coords = geo.features.find(f => f.properties.type === "bbox")?.geometry?.coordinates?.[0] || [];
      } catch { console.warn("Invalid GeoJSON"); }

      const { cropY, cropH } = getCropRegion(img, coords, 1 / 2);

      const containerWidth = canvas.parentElement.clientWidth;
      const scale = containerWidth / img.width;
      const scaledHeight = cropH * scale;

      canvas.width = containerWidth;
      canvas.height = scaledHeight;

      const drawBaseImage = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, cropY, img.width, cropH, 0, 0, canvas.width, scaledHeight);

        if (showBoundingBox && coords.length > 0) {
          ctx.beginPath();
          coords.forEach(([x, y], i) => {
            //if (y < cropY || y > cropY + cropH) return;
            const sx = x * scale;
            const sy = (y - cropY) * scale;
            i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
          });
          ctx.closePath();
          ctx.strokeStyle = "white";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        try {
          if (showBoundingPolygon && segmentation) {
            const seg = JSON.parse(segmentation);
            seg.features.forEach((feature) => {
              if (feature.geometry.type === "Polygon") {
                ctx.beginPath();
                feature.geometry.coordinates[0].forEach(([x, y], i) => {
                  const sx = x * scale;
                  const sy = (y - cropY) * scale;
                  i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
                });
                ctx.closePath();
                ctx.strokeStyle = "lime";
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.fillStyle = "rgba(0,255,0,0.2)";
                ctx.fill();
              }
            });
          }
        } catch (err) {
          console.error("Failed to parse segmentation JSON", err);
        }
      }

      drawBaseImage();
      if (enableZoom) cleanup = setupCanvasZoom(canvas, ctx, drawBaseImage);
    };
    return () => { if (cleanup) cleanup(); };
  }, [imageUrl, geoJson, segmentation, showBoundingBox, showBoundingPolygon, enableZoom]);

  return <canvas className="info-panel-image" ref={canvasRef} />;
}

export default LandfillImageCanvas;
