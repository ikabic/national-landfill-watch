import { FaSearch } from "react-icons/fa";
import { useState } from "react";

import "../css/SearchBar.css"

function SearchBar({ panelOpen }) {
    const [expanded, setExpanded] = useState(false);

    return <div className={`searchbar ${panelOpen ? "shifted" : ""} ${expanded ? "expanded" : "collapsed"}`}>
        <button onClick={() => setExpanded(!expanded)}>
            <FaSearch />
        </button>
        
        <input type="text" placeholder="Search..." />
    </div>
}

export default SearchBar;