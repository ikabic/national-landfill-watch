import { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import 'leaflet/dist/leaflet.css';

function LandfillMap() {
  const [landfills, setLandfills] = useState([]);

  useEffect(() => {
   axios.get('/api/landfills')
     .then(res => setLandfills(res.data))
     .catch(err => console.error(err));

  }, []);

  return (
    <MapContainer center={[44.8176, 20.4569]} zoom={8} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {landfills.map(lf => (
        <Marker key={lf.id} position={[lf.lat, lf.lng]}>
          <Popup>{lf.name} ({lf.category})</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default LandfillMap;
