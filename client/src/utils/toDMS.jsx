
export function toDMS(deg, isLat = false) {
  const absolute = Math.abs(deg);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(1);

  const direction = deg >= 0
    ? (isLat ? "N" : "E")
    : (isLat ? "S" : "W");

  return `${degrees}°${minutes}'${seconds}"${direction}`;
}