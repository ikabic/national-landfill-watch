import InfoPanel from "./InfoPanel";

import "../css/ProximityInfoPanel.css"

function ProximityInfoPanel({ open, onClose }) {
    return <InfoPanel title="Landfill Proximity Overview" open={open} onClose={onClose}>
        
    </InfoPanel>
}

export default ProximityInfoPanel;