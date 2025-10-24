import L from "leaflet";
import "leaflet.markercluster";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { makePinIcon } from "../utils/makePinIcon";

import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

const sanitaryIcon = makePinIcon("#2E7D32", "♻️");
const unsanitaryIcon = makePinIcon("#d18135ff", "☣️");

function MarkerCluster({ landfills, handleMarkerClick }) {
  const map = useMap(); 

  useEffect(() => {
    if (!map) return;

    const markers = L.markerClusterGroup();

    landfills.forEach((lf) => {
      const marker = L.marker([lf.centerLat, lf.centerLon], { icon: lf.category === "Sanitary" ? sanitaryIcon : unsanitaryIcon })
      .on("click", () => handleMarkerClick(lf.id, map));

      markers.addLayer(marker);
    });

    map.addLayer(markers);

    return () => map.removeLayer(markers);
  }, [landfills, map, handleMarkerClick]);

  return null;
}

export default MarkerCluster;