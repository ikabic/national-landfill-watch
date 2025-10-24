import axios from "axios";
import L from "leaflet";

async function LandfillProximity(map, lat, lng, color = "#b93b37c4", single = null) { 
    if (!map) return [];
    let landfills = [];

    if (single) landfills.push({...single, influenceRadius: JSON.parse(single.geoJson).features.find(f => f.properties.type === "influence").properties['influence_radius'] });
    else
        try {
            const response = await axios.get("/api/landfills/check-point", { params: { lat: lat, lon: lng } });
            landfills = response.data;
            if (landfills.length === 0) return;
        } catch (err) { console.error(err); }
        
    const areas = landfills.map(lf =>
        L.circle([lf.centerLat, lf.centerLon], { radius: lf.influenceRadius, color, weight: 2, fillOpacity: 0.2, interactive: false }).addTo(map)
    );
    return areas;
};

export default LandfillProximity;
