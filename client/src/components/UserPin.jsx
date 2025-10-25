import L from "leaflet";

import { useMapEvents } from "react-leaflet";
import { makePinIcon } from "../utils/makePinIcon";

import LandfillProximity from "./LandfillProximity";

function UserPin({ activeMarkerRef, landfillProximityRef, setPanelOpen }) {
  const userIcon = makePinIcon("#b52727ff", "⬤");

  const map = useMapEvents({
    click: async (e) => {
      if (e.originalEvent.target.closest(".map-controls, .pin, .panel-btn, .searchbar")) return;
      if (activeMarkerRef.current) map.removeLayer(activeMarkerRef.current);

      landfillProximityRef.current.forEach(c => map.removeLayer(c));
      landfillProximityRef.current = [];

      const newMarker = L.marker(e.latlng, { icon: userIcon }).addTo(map);
      activeMarkerRef.current = newMarker;

      const areas = await LandfillProximity(map, e.latlng.lat, e.latlng.lng);
      if (areas) {
        areas.forEach(area => landfillProximityRef.current.push(area));
        setPanelOpen({ state: true, type: "Proximity" });
      }
    }
  });

  return null;
}

export default UserPin;
