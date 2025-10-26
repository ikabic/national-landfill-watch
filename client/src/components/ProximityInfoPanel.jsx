import InfoPanel from "./InfoPanel";
import "../css/ProximityInfoPanel.css";

function ProximityInfoPanel({ open, onClose, landfills, onCardClick }) {
  if (!open) return null;
  console.log("Landfills for panel:", landfills);

  const inInfluence = landfills?.filter(lf => lf.inInfluence);
  const nearest = landfills
    ?.sort((a, b) => a.distance - b.distance)
    .slice(0, 3);

  return (
    <InfoPanel title="Landfill Proximity Overview" open={open} onClose={onClose}>
      {inInfluence?.length > 0 ? (
        inInfluence.map((lf, i) => (
          <div
            key={i}
            className="proximity-card warning"
            onClick={() => onCardClick(lf)}
          >
            <strong>WARNING:</strong> Your location is within influence zone of a landfill with status {lf.status || "unknown"}.
          </div>
        ))
      ) : (
        <>
          <p className="proximity-message">
            Your location is not in the immediate vicinity of any mapped landfills.
          </p>
          <h3>Closest landfills:</h3>
          {nearest.map((lf, i) => (
            <div
              key={i}
              className="proximity-card"
              onClick={() => onCardClick(lf)}
            >
               {lf.status || "unknown"} ({lf.distance.toFixed(2)} km)
            </div>
          ))}
        </>
      )}
    </InfoPanel>
  );
}

export default ProximityInfoPanel;
