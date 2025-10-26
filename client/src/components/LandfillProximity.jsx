import axios from "axios";
import L from "leaflet";

import { haversineDistance } from "../utils/haversineDistance";

export default async function LandfillProximity(map, lat, lng, color = "#b93b37c4", single = undefined) {
  if (!map) return [];

  let landfills = [];

  try {
    if (single) {
      const geoJsonData = JSON.parse(single.geoJson);
      const influenceFeature = geoJsonData.features.find(f => f.properties.type === "influence");
      const influenceRadius = influenceFeature?.properties?.influence_radius || 2000;

      landfills.push({ ...single, influenceRadius });
    } else {
      const response = await axios.get("/api/landfills/check-point", { params: { lat, lon: lng } });
      landfills = response.data;
      if (!landfills || landfills.length === 0) return [];
    }
  } catch (err) {
    console.error("Failed to fetch landfills for proximity:", err);
    return [];
  }

  const results = landfills.map(lf => {
    const influenceRadius = lf.influenceRadius || 2000;
    const distance = haversineDistance(lat, lng, lf.centerLat, lf.centerLon);

    const area = L.circle([lf.centerLat, lf.centerLon], {
      radius: influenceRadius,
      color,
      weight: 2,
      fillOpacity: 0.2,
      interactive: false
    }).addTo(map);

    return { ...lf, distance, inInfluence: distance <= influenceRadius, area, influenceRadius, id: lf.id, source: lf.source || "detected" };
  });
  return results;
}
