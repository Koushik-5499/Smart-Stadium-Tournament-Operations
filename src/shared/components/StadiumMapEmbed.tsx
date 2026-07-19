import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { STADIUM_LOCATIONS, STADIUM_ZONES } from '../constants';
import type { ZoneDensity } from '../types';
import type { VolunteerAlert } from '../../modules/crowd-management/volunteerCopilot';
import L from 'leaflet';

// Fix for default Leaflet icon issues in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  liveData: ZoneDensity[];
  alerts: VolunteerAlert[];
}

// Center of MetLife stadium area roughly
const MAP_CENTER: [number, number] = [40.8136, -74.0744];

export default function StadiumMapEmbed({ liveData, alerts }: Props) {
  // We'll map the abstract x/y coordinates (0-100) of STADIUM_LOCATIONS to real lat/lng offsets
  const mapCoordinate = (x: number, y: number): [number, number] => {
    // Arbitrary scaling to fit a bounding box around MetLife
    const latOffset = (y - 50) * -0.00004; // invert Y so 0 is top
    const lngOffset = (x - 50) * 0.00006;
    return [MAP_CENTER[0] + latOffset, MAP_CENTER[1] + lngOffset];
  };

  return (
    <div style={{ width: '100%', height: '300px', background: '#e5e7eb', position: 'relative' }} role="region" aria-label="Interactive stadium live map">
      <MapContainer 
        center={MAP_CENTER} 
        zoom={16} 
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {STADIUM_LOCATIONS.filter(loc => loc.type === 'gate' || loc.type === 'concourse').map(loc => {
          // Find the zone mapping for this location. Let's find any zone that matches this gate.
          const zone = STADIUM_ZONES.find(z => z.gate === loc.name || z.name === loc.name);
          const density = zone ? liveData.find(d => d.zoneId === zone.id) : null;
          const alert = zone ? alerts.find(a => a.zoneId === zone.id) : null;

          return (
            <Marker 
              key={loc.id} 
              position={mapCoordinate(loc.x, loc.y)}
              title={loc.name}
              alt={`Map marker for ${loc.name}`}
              keyboard={true}
            >
              <Popup>
                <div style={{ padding: '4px', minWidth: '150px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{loc.name}</h4>
                  {density ? (
                    <div style={{ marginBottom: '8px' }}>
                      <p style={{ margin: '0', fontSize: '14px' }}>
                        Capacity: {Math.round(density.occupancyRate * 100)}%
                        ({density.currentCount} / {density.capacity})
                      </p>
                    </div>
                  ) : (
                    <p style={{ margin: '0', fontSize: '14px', color: 'gray' }}>No live data</p>
                  )}
                  {alert && (
                    <div style={{ marginTop: '8px', padding: '8px', background: '#fee2e2', borderRadius: '4px', fontSize: '13px' }}>
                      <strong>⚠️ Active Alert:</strong> {alert.reasoning}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Overlay to signify integration context */}
      <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000, background: 'var(--bg-card)', padding: '4px 8px', borderRadius: '4px', fontSize: 'var(--font-size-xs)', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        Leaflet + OpenStreetMap
      </div>
    </div>
  );
}
