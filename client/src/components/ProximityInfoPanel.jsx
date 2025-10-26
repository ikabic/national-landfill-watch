import InfoPanel from "./InfoPanel";

function ProximityInfoPanel({ open, onClose, landfills, onLandfillClick, setPanelOpen }) {
  if (!open) return null;

  const inInfluence = landfills?.filter(lf => lf.inInfluence);
  const nearest = landfills?.sort((a, b) => a.distance - b.distance).slice(0, 3);
  const formatter = new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return <InfoPanel title="Landfill Proximity Overview" open={open} onClose={onClose}>
    <div className="info-panel-details" id="serbia">
      <div className="info-panel-details-section">
        {inInfluence?.length > 0
          ? <p style={{ display: "inline" }}>
            <strong style={{ color: "var(--brand-secondary)" }}>WARNING:</strong> Your location is within the influence zone of one or more landfills
          </p>
          : <p>Your location is not in the immediate vicinity of any mapped landfills.</p>
        }
      </div>

      <div className="info-panel-details-section">
        <span>{inInfluence?.length > 0 ? "Landfills in Proximity" : "Closest Landfills"}</span>
        {nearest.map((lf) => <div key={lf.id} className="info-panel-listitem">
          <span style={{ color: "var(--brand-secondary)" }}>{lf.distance.toFixed(2)} km away</span>
          <span className="route" onClick={() => onLandfillClick(lf.id)}>{lf.status} Landfill ID {lf.id}</span>
          <p style={{ textAlign: "center", justifyContent: "center" }}><small>
            Area: {formatter.format(lf.areaM2?.toFixed(2))} m²
            <br />
            Mass: {formatter.format(lf.totalMassTon?.toFixed(2))} ton&nbsp;&nbsp;•&nbsp;
            CH₄: {formatter.format(lf.annualCH4Tonnes?.toFixed(2))} ton/year
          </small></p>
        </div>
        )}
      </div>

      {inInfluence?.length > 0 && <div className="info-panel-details-section">
        <p style={{ textAlign: "justify", marginBottom: "12px" }}>You're near one or more landfill sites. The air here might contain methane and other gases from decomposing waste, and nearby soil or water could be affected too. Try to stay aware of your surroundings — pollution isn't always visible.</p>
        <span className="route" onClick={() => setPanelOpen({ state: true, type: "Info" })}>Learn More</span>
      </div>
      }
    </div>
  </InfoPanel>
}

export default ProximityInfoPanel;
