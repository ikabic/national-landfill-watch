import L from "leaflet";

export function makeClusterIcon(classPrefix) {
  return (cluster) =>
    L.divIcon({
      html: `<div><span>${cluster.getChildCount()}</span></div>`,
      className: `marker-cluster marker-cluster-${
        cluster.getChildCount() >= 100
          ? "large"
          : cluster.getChildCount() >= 10
          ? "medium"
          : "small"
      }-${classPrefix}`,
      iconSize: L.point(40, 40, true),
    });
}
