import { useEffect, useState } from "react";
import axios from "axios";
import InfoPanel from "./InfoPanel";

import "../css/LandfillInfoPanel.css"

function SerbiaInfoPanel({ open, onClose }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [topLandfills, setTopLandfills] = useState([]);

    useEffect(() => {
        if (!open) return;

        setLoading(true);
        setError(null);

        axios.get("/api/landfills/statistics")
        .then(res => {
            setStats(res.data.stats);
            setTopLandfills(res.data.topLandfills);
        })
        .catch(err => {
            console.error("Failed to load statistics:", err);
            setError("Failed to load statistics");
        })
        .finally(() => setLoading(false));
    }, [open]);

    return (
        <InfoPanel title="Serbia Overview" open={open} onClose={onClose}>
        {loading && <p>Loading statistics...</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}

        {stats && (
            <div className="stats-grid">
                <div><strong>Total Landfills:</strong> {stats.totalLandfills}</div>
                <div><strong>Avg. Area (m²):</strong> {stats.avgAreaM2.toFixed(2)}</div>
                <div><strong>Avg. Volume (m³):</strong> {stats.avgVolumeM3.toFixed(2)}</div>
                <div><strong>Avg. Mass (t):</strong> {stats.avgTotalMassTon.toFixed(2)}</div>
                <div><strong>Total Mass (t):</strong> {stats.sumTotalMassTon.toFixed(2)}</div>
                <div><strong>Avg. Annual CH₄ (t):</strong> {stats.avgAnnualCH4Tonnes.toFixed(2)}</div>
                <div><strong>Total Annual CH₄ (t):</strong> {stats.sumAnnualCH4Tonnes.toFixed(2)}</div>
                <div><strong>Avg. Annual CO₂e (t):</strong> {stats.avgAnnualCO2eTonnes.toFixed(2)}</div>
                <div><strong>Total Annual CO₂e (t):</strong> {stats.sumAnnualCO2eTonnes.toFixed(2)}</div>
            </div>
        )}

        {topLandfills.length > 0 && (
            <div className="top-landfills">
            <h3>Top 3 Largest Landfills by Area</h3>
            <ul>
                {topLandfills.map(lf => (
                <li key={lf.id}>
                    Landfill ID <strong>{lf.id}</strong> ({lf.status}) - 
                    Area: {lf.areaM2?.toFixed(2)} m², 
                    Mass: {lf.totalMassTon?.toFixed(2)} t, 
                    CH₄: {lf.annualCH4Tonnes?.toFixed(2)} t, 
                    CO₂e: {lf.annualCO2eTonnes?.toFixed(2)} t
                </li>
                ))}
            </ul>
            </div>
        )}
        </InfoPanel>
    );
}

export default SerbiaInfoPanel;