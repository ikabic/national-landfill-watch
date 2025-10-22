import { useMapEvents } from "react-leaflet";
import L from "leaflet";
import { makePinIcon } from "../utils/makePinIcon";
import axios from "axios";
import { useRef } from "react";

function UserPin({ activeMarkerRef }) {
  const userIcon = makePinIcon("#b52727ff", "⬤");
  const circlesRef = useRef([])

  const map = useMapEvents({
    click: async (e) => {
      if (e.originalEvent.target.closest(".map-controls, .pin, .panel-btn")) return;
      if (activeMarkerRef.current) map.removeLayer(activeMarkerRef.current);

      circlesRef.current.forEach(c => map.removeLayer(c));
      circlesRef.current = [];

      const newMarker = L.marker(e.latlng, { icon: userIcon }).addTo(map);
      activeMarkerRef.current = newMarker;

      try {
        const response = await axios.get("/api/landfills/check-point", {
          params: {
            lat: e.latlng.lat,
            lon: e.latlng.lng
          }
        });

        // postavi podatke u state da se renderuju
        // setLandfills(response.data);
        
        const landfills = response.data;
        console.log("Deponije u radiusu:", landfills);

        if (landfills.length === 0) {
          console.log("Nema deponija u blizini.");
          return;
        }

        landfills.forEach(lf => {
        const circle = L.circle([lf.centerLat, lf.centerLon], {
          radius: lf.influenceRadius,
          color: "#d9534f",
          weight: 2,
          fillOpacity: 0.2,
          interactive: false 
        }).addTo(map);

          circlesRef.current.push(circle);
        });
        
      } catch (err) {
        console.error("Greška: ", err);
      }
    },
  });

  return null;
}

export default UserPin;
