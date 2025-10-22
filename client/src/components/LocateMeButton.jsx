import L from "leaflet";

import { useMap } from "react-leaflet";
import { FaLocationArrow } from "react-icons/fa";
import { toast } from "react-toastify";
import { makePinIcon } from "../utils/makePinIcon";

import LandfillProximity from "./LandfillProximity";

import 'react-toastify/dist/ReactToastify.css';

function LocateMeButton({ activeMarkerRef, landfillProximityRef }) {
    const map = useMap();

    const handleLocate = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                map.flyTo([latitude, longitude], 16, { duration: 1.5 });

                if (activeMarkerRef.current) map.removeLayer(activeMarkerRef.current);
                landfillProximityRef.current.forEach(c => map.removeLayer(c));
                landfillProximityRef.current = [];

                const userIcon = makePinIcon("#b52727ff", "⬤");
                activeMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);

                const areas = await LandfillProximity(map, latitude, longitude);
                if(areas) areas.forEach(area => landfillProximityRef.current.push(area));

                areas && areas.length > 0 
                ? toast.warn("Your location is within the influence area of one or more unsanitary landfills.")
                : toast.info("Your location is not in the immediate vicinity of any mapped landfills.");
            },
            (err) => { toast.error("Unable to retrieve your location: " + err.message); }
        );
    };

    return <button className="locate-btn" onClick={handleLocate}><FaLocationArrow /></button>
}

export default LocateMeButton;
