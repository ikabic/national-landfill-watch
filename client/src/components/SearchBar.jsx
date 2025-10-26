import axios from "axios";
import L from "leaflet";
import { haversineDistance } from "../utils/distance";

import { useState, useRef, useEffect } from "react";
import { useMap } from "react-leaflet";
import { FaSearch } from "react-icons/fa";
import { makePinIcon } from "../utils/makePinIcon";
import { handleMapInteractions } from "../utils/handleMapInteractions";

import LandfillProximity from "./LandfillProximity";

import "../css/SearchBar.css";

function SearchBar({ panelOpen, mapRefs, setPanelOpen, setProximityLandfills }) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [selectedPlace, setSelectedPlace] = useState("");

  const userIcon = makePinIcon("#b52727ff", "⬤");
  const inputRef = useRef(null);
  const map = mapRefs.map.current;

  const { enableMapInteractions, disableMapInteractions } = handleMapInteractions({ map });

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.length < 3 || debouncedQuery === selectedPlace) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const res = await axios.get("https://nominatim.openstreetmap.org/search", {
          params: { q: debouncedQuery, format: "json", addressdetails: 1, countrycodes: "RS", limit: 5 }
        });
        setSuggestions(res.data);
      } catch (err) { console.error("Error fetching search suggestions:", err); }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  const handleSelect = async (place) => {
    setSelectedPlace(place.display_name);
    setQuery(place.display_name);
    setSuggestions([]);
    enableMapInteractions();
    const map = mapRefs.map.current;
    if (!map) return;

    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);

    if (mapRefs.activeMarkerRef.current) map.removeLayer(mapRefs.activeMarkerRef.current);
    mapRefs.landfillProximityRef.current.forEach((c) => map.removeLayer(c));
    mapRefs.landfillProximityRef.current = [];

    const newMarker = L.marker([lat, lon], { icon: userIcon }).addTo(map);
    mapRefs.activeMarkerRef.current = newMarker;

    map.setView([lat, lon], 16);
    const landfills = await LandfillProximity(map, lat, lon); 
    if (!landfills || landfills.length === 0) {
       const res = await axios.get("/api/landfills/markers");
       const allLandfills = res.data;

       const nearest = allLandfills
          .map(lf => ({
              ...lf,
              distance: haversineDistance(lat, lon, lf.centerLat, lf.centerLon),
              id: lf.id,
              source: "detected"
         }))
         .sort((a, b) => a.distance - b.distance)
         .slice(0, 3);

      setProximityLandfills(nearest);
      
       setPanelOpen({ state: true, type: "Proximity" });
     } else {
 
       setProximityLandfills(landfills);
       landfills.forEach(lf => {if (lf.area) mapRefs.landfillProximityRef.current.push(lf.area);});
      setPanelOpen({ state: true, type: "Proximity" });
     }

  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length > 0) handleSelect(suggestions[0]);
    }
  };

  return <div className={`searchbar ${panelOpen.state ? "shifted" : ""} ${expanded ? "expanded" : "collapsed"}`} onMouseEnter={disableMapInteractions} onMouseLeave={enableMapInteractions}>
    <button onClick={() => setExpanded(!expanded)}> <FaSearch /> </button>

    {expanded && (
      <div className="search-input-wrapper">
        <input ref={inputRef} type="text" value={query} title={query} placeholder="Search for location..."
          onChange={async (e) => setQuery(e.target.value)} onKeyDown={handleKeyDown} onFocus={() => inputRef.current?.select()} />

        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((place, idx) => {
              console.log(place.address)
              const addr = place.address || {};
              const village = addr.village || "";
              const city = addr.town || addr.city || "";
              const district = addr.state || addr.county || "";
              const displayText = [village, city, district].filter(Boolean).join(", ");

              return (
                <li key={idx} onClick={() => handleSelect(place)}>
                  {displayText || place.display_name}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    )}
  </div>
}

export default SearchBar;