
export function setupCanvasZoom(canvas, ctx, drawBaseImage, zoomSize = 140, zoom = 2) {
  const handleMouseMove = e => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    drawBaseImage();

    let sx = mouseX - zoomSize / (2 * zoom);
    let sy = mouseY - zoomSize / (2 * zoom);
    let sw = zoomSize / zoom;
    let sh = zoomSize / zoom;
    if (sx < 0) sx = 0;
    if (sy < 0) sy = 0;
    if (sx + sw > canvas.width) sx = canvas.width - sw;
    if (sy + sh > canvas.height) sy = canvas.height - sh;

    let dx = mouseX - zoomSize / 2;
    let dy = mouseY - zoomSize / 2;
    if (dx < 0) dx = 0;
    if (dy < 0) dy = 0;
    if (dx + zoomSize > canvas.width) dx = canvas.width - zoomSize;
    if (dy + zoomSize > canvas.height) dy = canvas.height - zoomSize;

    ctx.drawImage(canvas, sx, sy, sw, sh, dx, dy, zoomSize, zoomSize);
  };

  const handleMouseLeave = () => drawBaseImage();

  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseleave", handleMouseLeave);

  return () => {
    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("mouseleave", handleMouseLeave);
  };
}
