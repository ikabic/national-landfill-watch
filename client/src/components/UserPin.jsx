import { useMapEvents } from "react-leaflet";
import L from "leaflet";
import { makePinIcon } from "../utils/makePinIcon";

function UserPin({ activeMarkerRef }) {
  const userIcon = makePinIcon("#b52727ff", "⬤");

  const map = useMapEvents({
    click(e) {
      if (e.originalEvent.target.closest(".map-controls")) return;
      if (activeMarkerRef.current) map.removeLayer(activeMarkerRef.current);

      const newMarker = L.marker(e.latlng, { icon: userIcon }).addTo(map);
      activeMarkerRef.current = newMarker;
    },
  });

  return null;
}

export default UserPin;
