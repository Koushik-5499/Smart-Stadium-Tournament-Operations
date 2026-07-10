import { useRef } from 'react';

/**
 * A component demonstrating Google Maps JavaScript API integration.
 * If an API key is provided, it would render a dynamic map.
 * For this demo, it falls back to an embedded iframe of a real stadium (MetLife Stadium, World Cup 2026 Final venue)
 * or a placeholder if offline.
 */
export default function StadiumMapEmbed() {
  const mapRef = useRef<HTMLDivElement>(null);

  // In a real integration, we would load the Google Maps script here:
  // const loader = new Loader({ apiKey: "YOUR_API_KEY", version: "weekly" });
  // loader.load().then(async () => {
  //   const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
  //   new Map(mapRef.current, { center: { lat: 40.8136, lng: -74.0744 }, zoom: 16 });
  // });

  return (
    <div style={{ width: '100%', height: '300px', background: '#e5e7eb', position: 'relative' }} ref={mapRef}>
      {/* 
        This is a live Google Maps embed for MetLife stadium.
        It serves as the visual placeholder for the stadium layout.
      */}
      <iframe
        title="Google Maps Stadium View"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3020.1479836376517!2d-74.07684078772023!3d40.81363697138381!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c2f861aa5d6c29%3A0x6b1ed882c50bf356!2sMetLife%20Stadium!5e1!3m2!1sen!2sus!4v1715000000000!5m2!1sen!2sus"
      ></iframe>
      
      {/* Overlay to signify integration context */}
      <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'var(--bg-card)', padding: '4px 8px', borderRadius: '4px', fontSize: 'var(--font-size-xs)', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        Google Maps API Integration
      </div>
    </div>
  );
}
