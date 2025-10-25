import { useRef, useEffect } from "react";
import { getCropRegion } from "../utils/getCropRegion";
import { setupCanvasZoom } from "../utils/setupCanvasZoom";
import axios from "axios"

function LandfillImageCanvas({ landfill, showBoundingBox = true, showBoundingPolygon = true, enableZoom = true }) {
  const canvasRef = useRef(null);
  const imageName = landfill.imageName;
  const geoJson = landfill.geoJson;
  const segmentation = landfill.segmentation;
  const imageUrl = `/static/images/landfills/${imageName}.jpg`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let cleanup = null;

    axios.head(imageUrl)
      .then(() => {
        const img = new Image();
        img.src = imageUrl;

        img.onload = () => {
        let coords = [];
        if (landfill.source === "detected") {
          try {
            const geo = JSON.parse(geoJson);
            coords = geo.features.find(f => f.properties.type === "bbox")?.geometry?.coordinates?.[0] || [];
          } catch { console.warn("Invalid GeoJSON"); }
        } else {
          coords.push([landfill.centerX, landfill.centerY])
        }

        const { cropY, cropH } = getCropRegion(img, coords, 1 / 2);

        const containerWidth = canvas.parentElement.clientWidth;
        const scale = containerWidth / img.width;
        const scaledHeight = cropH * scale;

        canvas.width = containerWidth;
        canvas.height = scaledHeight;

        const drawBaseImage = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, cropY, img.width, cropH, 0, 0, canvas.width, scaledHeight);

          if (landfill.source === "detected") {
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
          } else {
            ctx.beginPath();
            ctx.arc(landfill.centerX * scale, (landfill.centerY - cropY) * scale, landfill.radius * scale, 0, 2 * Math.PI);
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }

        drawBaseImage();
        if (enableZoom) cleanup = setupCanvasZoom(canvas, ctx, drawBaseImage);
      };
    })
    .catch(err => {
      const containerWidth = canvas.parentElement.clientWidth;
      const containerHeight = 200; 
      canvas.width = containerWidth;
      canvas.height = containerHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "16px sans-serif";
      ctx.fillStyle = "red";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Slika ne postoji", canvas.width / 2, canvas.height / 2);
    });

    return () => { if (cleanup) cleanup(); };
  }, [imageUrl, geoJson, segmentation, showBoundingBox, showBoundingPolygon, enableZoom]);

  return <canvas className="info-panel-image" ref={canvasRef} />;
}

export default LandfillImageCanvas;
