import { useState, useRef } from "react";
import { useMap } from "react-leaflet";
import axios from "axios";
import L from "leaflet";
import { FaSearch } from "react-icons/fa";
import LandfillProximity from "./LandfillProximity";
import { makePinIcon } from "../utils/makePinIcon";

import "../css/SearchBar.css";

function SearchBar({ panelOpen, mapRefs, setPanelOpen }) {
    const [expanded, setExpanded] = useState(false);
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    const userIcon = makePinIcon("#b52727ff", "⬤");
    const inputRef = useRef(null);

    const handleSearch = async (e) => {
       const value = e.target.value;
       setQuery(value);

       if (value.length < 3) {
         setSuggestions([]);
         return;
       }

       try {
         const res = await axios.get("https://nominatim.openstreetmap.org/search", {
           params: {
           q: value,
           format: "json",
           addressdetails: 1,
           countrycodes: "RS",
           limit: 5,
         },
        });
         setSuggestions(res.data);
       } catch (err) {
         console.error("Error fetching search suggestions:", err);
       }
    };

  const map = useMap();
  const handleSelect = async (place) => {
    setQuery(place.display_name);
    setSuggestions([]);

    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);

    if (mapRefs.activeMarkerRef.current) map.removeLayer(mapRefs.activeMarkerRef.current);
    mapRefs.landfillProximityRef.current.forEach((c) => map.removeLayer(c));
    mapRefs.landfillProximityRef.current = [];

    const newMarker = L.marker([lat, lon], { icon: userIcon }).addTo(map);
    mapRefs.activeMarkerRef.current = newMarker;

    map.setView([lat, lon], 13);

    const areas = await LandfillProximity(map, lat, lon);
    if (areas) {
      areas.forEach((area) => mapRefs.landfillProximityRef.current.push(area));
      setPanelOpen({ state: true, type: "Proximity" });
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); 
      if (suggestions.length > 0) {
        handleSelect(suggestions[0]); 
      }
    }
  };

    return (
    <div className={`searchbar ${panelOpen ? "shifted" : ""} ${expanded ? "expanded" : "collapsed"}`}>
      <button onClick={() => setExpanded(!expanded)}>
        <FaSearch />
      </button>

      {expanded && (
        <div className="search-input-wrapper">
          <input
            ref={inputRef}    
            type="text"
            value={query}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            onFocus={() => inputRef.current?.select()}
            placeholder="Enter your location..."
            title={query}
          />
          {suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((place, idx) => (
                <li key={idx} onClick={() => handleSelect(place)}>
                  {place.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;