import L from "leaflet";
import "leaflet.markercluster";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { makePinIcon } from "../utils/makePinIcon";
import { makeClusterIcon } from "../utils/makeClusterIcon";

import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "../css/MarkerCluster.css"

const sanitaryIcon = makePinIcon("#2E7D32", "♻️");
const unsanitaryIcon = makePinIcon("#d18135ff", "☣️");

function MarkerCluster({ landfills, registryLandfills, handleMarkerClick }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const registryClusters = L.markerClusterGroup({ iconCreateFunction: makeClusterIcon("registry") });
    const detectedClusters = L.markerClusterGroup({ iconCreateFunction: makeClusterIcon("detected") });

    landfills.forEach((lf) => {
      const marker = L.marker([lf.centerLat, lf.centerLon], { icon: lf.category === "Sanitary" ? sanitaryIcon : unsanitaryIcon })
        .on("click", () => handleMarkerClick(lf.id, map));

      detectedClusters.addLayer(marker);
    });

    registryLandfills.forEach((lf) => {
      const marker = L.marker([lf.centerLat, lf.centerLon], { icon: lf.category === "Sanitary" ? sanitaryIcon : unsanitaryIcon })
        .on("click", () => handleMarkerClick(lf.id, map));

      registryClusters.addLayer(marker);
    });

    map.addLayer(detectedClusters);
    map.addLayer(registryClusters);

    return () => {
      map.removeLayer(detectedClusters);
      map.removeLayer(registryClusters);
    }
  }, [landfills, registryLandfills, map, handleMarkerClick]);

  return null;
}

export default MarkerCluster;