import { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import LandfillDetailsPanel from "./LandfillDetailsPanel"; 

function LandfillMap() {
  const [landfills, setLandfills] = useState([]);
  const [selectedLandfill, setSelectedLandfill] = useState(null);

  useEffect(() => {
    axios.get('/api/landfills')
      .then(res => setLandfills(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleMarkerClick = (id) => {
    axios.get(`/api/landfills/${id}`)
      .then(res => setSelectedLandfill(res.data))
      .catch(err => console.error(err));
  };

  const closePanel = () => setSelectedLandfill(null);

  return (
    <div>
      <MapContainer center={[44.8176, 20.4569]} zoom={8} style={{ height: '100vh', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {landfills.map(lf => (
          <Marker
            key={lf.id}
            position={[lf.lat, lf.lng]}
            eventHandlers={{ click: () => handleMarkerClick(lf.id) }}
          >
            <Popup>{lf.name}</Popup>
          </Marker>
        ))}
      </MapContainer>

       {selectedLandfill && (
          <LandfillDetailsPanel landfill={selectedLandfill} onClose={closePanel} />
       )}
    </div>
  );
}

export default LandfillMap;
