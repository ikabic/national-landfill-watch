import { useMap } from "react-leaflet";
import { FaLocationArrow } from "react-icons/fa";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import L from "leaflet";
import { makePinIcon } from "../utils/makePinIcon";

function LocateMeButton({ activeMarkerRef }) {
    const map = useMap();

    const handleLocate = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                map.flyTo([latitude, longitude], 13, { duration: 1.5 });

                if (activeMarkerRef.current) map.removeLayer(activeMarkerRef.current);

                const userIcon = makePinIcon("#b52727ff", "⬤");
                activeMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
            },
            (err) => { toast.error("Unable to retrieve your location: " + err.message); }
        );
    };

    return <button className="locate-btn" onClick={handleLocate}><FaLocationArrow /></button>
}

export default LocateMeButton;
