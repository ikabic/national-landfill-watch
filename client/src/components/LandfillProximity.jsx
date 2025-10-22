import axios from "axios";
import L from "leaflet";

async function LandfillProximity(map, lat, lng, color = "#b93b37c4") {
    if (!map) return [];

    try {
        const response = await axios.get("/api/landfills/check-point", { params: { lat: lat, lon: lng } });
        const landfills = response.data;

        if (landfills.length === 0) return;

        const areas = landfills.map((lf) =>
            L.circle([lf.centerLat, lf.centerLon], { radius: lf.influenceRadius, color, weight: 2, fillOpacity: 0.2, interactive: false }).addTo(map)
        );
        return areas;
    } catch (err) { console.error(err); }
};

export default LandfillProximity;
