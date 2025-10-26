import axios from "axios";
import L from "leaflet";

import { haversineDistance } from "../utils/havesineDistance";
import { useMap } from "react-leaflet";
import { FaLocationArrow } from "react-icons/fa";
import { makePinIcon } from "../utils/makePinIcon";

import LandfillProximity from "./LandfillProximity";

function LocateMeButton({ activeMarkerRef, landfillProximityRef, setPanelOpen, setProximityLandfills, onLocation }) {
    const map = useMap();

    const handleLocate = () => {
        if (!navigator.geolocation) {
            console.error("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;

                if (activeMarkerRef.current) map.removeLayer(activeMarkerRef.current);
                landfillProximityRef.current.forEach(c => map.removeLayer(c));
                landfillProximityRef.current = [];

                const userIcon = makePinIcon("#b52727ff", "⬤");
                activeMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);

                let landfills = await LandfillProximity(map, latitude, longitude);

                if (!landfills || landfills.length === 0) {
                    const res = await axios.get("/api/landfills");
                    const allLandfills = res.data;

                    const nearest = allLandfills
                        .map(lf => ({ ...lf, distance: haversineDistance(latitude, longitude, lf.centerLat, lf.centerLon), id: lf.id, source: "detected" }))
                        .sort((a, b) => a.distance - b.distance)
                        .slice(0, 3);

                    setProximityLandfills(nearest);
                } else {
                    setProximityLandfills(landfills);
                    landfills.forEach(lf => { if (lf.area) landfillProximityRef.current.push(lf.area); });   
                }
                setPanelOpen({ state: true, type: "Proximity" });
                onLocation([latitude, longitude], 16);
            },
            (err) => { console.error("Unable to retrieve your location: " + err.message); }
        );
    };

    return <button className="locate-btn" onClick={handleLocate}><FaLocationArrow /></button>;
}

export default LocateMeButton;
