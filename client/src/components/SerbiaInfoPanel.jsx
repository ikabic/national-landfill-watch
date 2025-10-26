import axios from "axios";
import Chart from "chart.js/auto";

import { useEffect, useState, useRef } from "react";

import InfoPanel from "./InfoPanel";

import "../css/InfoPanel.css"

function SerbiaInfoPanel({ open, onClose, onLandfillClick }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [topLandfills, setTopLandfills] = useState([]);
    const [chartData, setChartData] = useState([]);

    const massChartRef = useRef(null);
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
                for (let i = 0; i < bins.length - 1; i++)
                    if (v >= bins[i] && v < bins[i + 1]) {
                        counts[i]++;
                        break;
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
                    backgroundColor: "#864c1988",
                    borderColor: "#864c19",
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

    return <InfoPanel title="Serbia Overview" open={open} onClose={onClose}>
        {loading && <p>Loading statistics...</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}

        <div className="info-panel-details" id="serbia">
            {stats && <>
                <div className="info-panel-details-section">
                    <span>Total Landfills: {stats.totalLandfills}</span>
                </div>

                <div className="info-panel-details-section">
                    <p>Average area<span> {stats.avgAreaM2.toFixed(2)} m²</span></p>
                    <p>Average volume<span> {stats.avgVolumeM3.toFixed(2)} m³</span></p>
                </div>

                <div className="info-panel-details-section">
                    <p>Average mass<span> {stats.avgTotalMassTon.toFixed(2)} ton</span></p>
                    <p>Total mass<span> {stats.sumTotalMassTon.toFixed(2)} ton</span></p>
                </div>

                <div className="info-panel-details-section">
                    <p>Average CH₄ emissions<span> {stats.avgAnnualCH4Tonnes.toFixed(2)} ton/year</span></p>
                    <p>Total CH₄ emissions<span> {stats.sumAnnualCH4Tonnes.toFixed(2)} ton/year</span></p>
                    <br />
                    <p>Average CH₄ emissions (CO₂eq)<span> {stats.avgAnnualCO2eTonnes.toFixed(2)} ton/year</span></p>
                    <p>Total CH₄ emissions (CO₂eq)<span> {stats.sumAnnualCO2eTonnes.toFixed(2)} ton/year</span></p>
                </div>
            </>
            }

            {topLandfills.length > 0 && <div className="info-panel-details-section">
                <span>Top 3 Largest Landfills by Area</span>
                {topLandfills.map(lf => <div key={lf.id} className="info-panel-listitem">
                    <span className="route" onClick={() => onLandfillClick(lf.id)}>{lf.status} Landfill ID {lf.id}</span>
                    <p style={{ textAlign: "center", justifyContent: "center" }}><small>
                        Area: {lf.areaM2?.toFixed(2)} m²
                        <br />
                        Mass: {lf.totalMassTon?.toFixed(2)} ton&nbsp;&nbsp;•&nbsp;
                        CH₄: {lf.annualCH4Tonnes?.toFixed(2)} ton/year
                    </small></p>
                </div>
                )}
            </div>
            }

            {chartData.length > 0 && <div className="info-panel-details-section">
                <span>Landfill Mass Distribution</span>
                <br />
                <canvas ref={massChartRef}></canvas>
            </div>
            }
        </div>
    </InfoPanel>
}

export default SerbiaInfoPanel;