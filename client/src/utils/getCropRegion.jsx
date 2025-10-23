
export function getCropRegion(img, coords, aspectRatio = 1 / 4) {
  const imgWidth = img.width;
  const imgHeight = img.height;
  const cropH = imgWidth * aspectRatio;

  if (!coords || coords.length === 0) {
    const cropY = Math.max(0, (imgHeight - cropH) / 2);
    return { cropY, cropH };
  }

  const ys = coords.map(([, y]) => y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const bboxHeight = maxY - minY;

  let cropY = minY - (cropH - bboxHeight) / 2;

  if (minY < cropH / 2) cropY = 0;
  if (maxY > imgHeight - cropH / 2) cropY = imgHeight - cropH;

  cropY = Math.max(0, Math.min(cropY, imgHeight - cropH));

  return { cropY, cropH };
}
