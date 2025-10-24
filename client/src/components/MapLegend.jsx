import "../css/MapLegend.css"

function MapLegend() {
    return <div className="map-legend">
        <div className="legend-item">
            <div className="legend-icon" style={{ background: "#2E7D32" }}>♻️</div>
            <span>Sanitary Landfill</span>
        </div>

        <div className="legend-item">
            <div className="legend-icon" style={{ background: "#d18135ff" }}>☣️</div>
            <span>Unsanitary Landfill</span>
        </div>

        <div className="legend-item">
            <div className="legend-icon" style={{ background: "#b52727ff" }}>⬤</div>
            <span>Your Location</span>
        </div>
    </div>
}

export default MapLegend;