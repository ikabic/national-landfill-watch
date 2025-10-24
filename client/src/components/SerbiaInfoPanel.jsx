import { useEffect, useState, useRef } from "react";
import axios from "axios";
import InfoPanel from "./InfoPanel";
import Chart from "chart.js/auto";

import "../css/LandfillInfoPanel.css"

function SerbiaInfoPanel({ open, onClose }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [topLandfills, setTopLandfills] = useState([]);
    const [chartData, setChartData] = useState([]);

    const areaChartRef = useRef(null);
    const massChartRef = useRef(null);
    const areaChartInstance = useRef(null);
    const massChartInstance = useRef(null);

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

    useEffect(() => {
        if (!open) return;

        axios.get("/api/landfills/chart-data")
            .then(res => setChartData(res.data))
            .catch(err => console.error("Failed to load chart data:", err));
    }, [open]);

    useEffect(() => {
        if (!chartData.length) return;

        const massValues = chartData.map(lf => lf.totalMassTon);

        const createHistogram = (values, bins) => {
            const counts = new Array(bins.length - 1).fill(0);
            values.forEach(v => {
                for (let i = 0; i < bins.length - 1; i++) {
                    if (v >= bins[i] && v < bins[i + 1]) {
                        counts[i]++;
                        break;
                    }
                }
            });
            const labels = bins.slice(0, -1).map((b, i) => `${bins[i]}-${bins[i + 1]}`);
            return { counts, labels };
        };

        const massBins = [0, 100, 500, 1000, 2000, 5000, 10000, 20000];
        const massHist = createHistogram(massValues, massBins);

        if (massChartInstance.current) massChartInstance.current.destroy();
        massChartInstance.current = new Chart(massChartRef.current, {
            type: "bar",
            data: {
                labels: massHist.labels,
                datasets: [{
                    label: "Number of Landfills",
                    data: massHist.counts,
                    backgroundColor: "rgba(255, 99, 132, 0.5)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    x: { title: { display: true, text: "Mass (t)" } },
                    y: { title: { display: true, text: "Number of Landfills" }, beginAtZero: true }
                }
            }
        });

    }, [chartData]);

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

        {chartData.length > 0 && (
            <div className="charts-container">
                <h3>Landfill Mass Distribution</h3>
                <canvas ref={massChartRef}></canvas>
            </div>
        )}
        </InfoPanel>
    );
}

export default SerbiaInfoPanel;