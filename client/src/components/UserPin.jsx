import L from "leaflet";

import { useMapEvents } from "react-leaflet";
import { makePinIcon } from "../utils/makePinIcon";
import { haversineDistance } from "../utils/havesineDistance";

import LandfillProximity from "./LandfillProximity";

function UserPin({ activeMarkerRef, landfillProximityRef, setPanelOpen, setProximityLandfills, onLocation }) {
  const userIcon = makePinIcon("#b52727ff", "⬤");

  const map = useMapEvents({
    click: async (e) => {
      if (e.originalEvent.target.closest(".map-controls, .pin, .panel-btn, .actions")) return;

      if (activeMarkerRef.current) map.removeLayer(activeMarkerRef.current);

      landfillProximityRef.current.forEach(c => map.removeLayer(c));
      landfillProximityRef.current = [];

      const newMarker = L.marker(e.latlng, { icon: userIcon }).addTo(map);
      activeMarkerRef.current = newMarker;

      const landfills = await LandfillProximity(map, e.latlng.lat, e.latlng.lng);

      if (landfills.length > 0) {
        landfillProximityRef.current.push(...landfills.map(lf => lf.area));
        setProximityLandfills(landfills);
      } else {
        const res = await fetch("/api/landfills");
        const allLandfills = await res.json();

        const nearest = allLandfills
          .map(lf => ({ ...lf, distance: haversineDistance(e.latlng.lat, e.latlng.lng, lf.centerLat, lf.centerLon), id: lf.id, source: "detected" }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 3);

        setProximityLandfills(nearest);
      }
      setPanelOpen({ state: true, type: "Proximity" });
      onLocation([e.latlng.lat, e.latlng.lng]);
    }
  });

  return null;
}

export default UserPin;
