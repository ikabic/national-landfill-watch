import InfoPanel from "./InfoPanel";

import { IoMdOpen } from "react-icons/io";

import "../css/InfoPanel.css"

function EduInfoPanel({ open, onClose }) {
    return <InfoPanel title="Impact of Unsanitary Landfills" open={open} onClose={onClose}>
        <div className="info-panel-details" id="info">
            <div className="info-panel-details-section">
                <p>Landfills in Serbia are a major source of environmental concern due to improper waste management in many areas. Decomposing waste generates methane and other greenhouse gases, contributing to air pollution and climate change</p>
            </div>

            <div className="info-panel-details-section">
                <span style={{ marginBottom: "12px" }}>Ecological Consequences</span>
                <p style={{ display: "inline" }}>
                    <strong style={{ color: "var(--brand-secondary)" }}>Air Pollution: </strong>
                    Decomposing waste produces methane and other greenhouse gases, contributing to climate change. Additionally, odors and toxic gases can affect air quality for nearby communities.
                    <br /><br />
                    <strong style={{ color: "var(--brand-secondary)" }}>Water Contamination: </strong>
                    Rainwater and surface water can carry leachate—liquid formed from decomposing waste—into soil and groundwater, potentially contaminating drinking water sources.
                    <br /><br />
                    <strong style={{ color: "var(--brand-secondary)" }}>Soil Degradation: </strong>
                    Hazardous chemicals and heavy metals from waste can accumulate in the soil, reducing fertility and harming plants and microorganisms.
                    <br /><br />
                    <strong style={{ color: "var(--brand-secondary)" }}>Biodiversity Loss: </strong>
                    Landfills can destroy natural habitats, disrupt ecosystems, and pose risks to wildlife due to ingestion or entanglement in waste materials.
                    <br /><br />
                    <strong style={{ color: "var(--brand-secondary)" }}>Health Risks: </strong>
                    Proximity to landfills has been linked to respiratory problems, skin irritation, and other health issues for nearby residents.
                    <br /><br />
                    <strong style={{ color: "var(--brand-secondary)" }}>Visual and Social Impact: </strong>
                    Landfills can negatively affect local communities by reducing aesthetic value, lowering property prices, and causing noise and traffic problems.
                </p>
            </div>

            <div className="info-panel-details-section">
                <span style={{ marginBottom: "12px" }}>Mitigation Measures</span>
                <p>Modern landfills incorporate engineering solutions such as liners, leachate collection systems, and gas capture systems to minimize environmental impact. However, reducing waste generation, recycling, and proper waste management remain crucial to limit the ecological footprint of landfills.</p>
            </div>

            <div className="info-panel-details-section">
                <span style={{ marginBottom: "12px" }}>Learn More</span>
                <div className="info-links">
                    <a href="https://www.epa.gov/lmop/basic-information-about-landfill-gas">Landfill Gas <IoMdOpen size={12} className="link-icon" /></a>
                    <a href="https://aqmx.org/sites/default/files/resources/wasted_air_Serbia.pdf">Landfill Fires <IoMdOpen size={12} className="link-icon" /></a>
                    <a href="https://www.worldcleanupday.org/post/health-effects-of-waste-mismanagement">Effects on Health <IoMdOpen size={12} className="link-icon" /></a>
                </div>
            </div>
        </div>
    </InfoPanel>
}

export default EduInfoPanel;