import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './institute-registration.module.css';

// Dynamically import the entire MapComponent, which safely uses leaflet and hooks
const DynamicMap = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => <div style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc' }}>Loading Map...</div>
});

export default function MapModal({ onClose, onSave, initialLat, initialLng }) {
  const defaultPosition = [20.5937, 78.9629]; // India center
  const [position, setPosition] = useState(
    initialLat && initialLng ? { lat: parseFloat(initialLat), lng: parseFloat(initialLng) } : null
  );
  
  const [mapCenter, setMapCenter] = useState(position ? [position.lat, position.lng] : defaultPosition);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setMapCenter([lat, lon]);
        setPosition({ lat, lng: lon });
      } else {
        alert("Location not found. Please try a different search term.");
      }
    } catch (e) {
      console.error(e);
      alert("Error searching for location.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={styles.modalOverlay} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div className={styles.modalContent} style={{ 
        width: '90%', maxWidth: '800px', backgroundColor: 'white', 
        padding: '24px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 className={styles.sectionTitle} style={{ marginBottom: '8px', marginTop: 0, fontSize: '20px' }}>Select Location on Map</h3>
        <p style={{ marginBottom: '16px', color: '#64748b', fontSize: '14px' }}>Click anywhere on the map to drop a pin. Then confirm the location.</p>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input 
            type="text" 
            className={styles.appleInput} 
            placeholder="Search for a city, landmark, or address..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
          <button 
            type="button" 
            className={styles.btnSecondary} 
            onClick={handleSearch}
            disabled={isSearching}
            style={{ padding: '0 20px', whiteSpace: 'nowrap', borderRadius: '8px' }}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
          <DynamicMap center={mapCenter} position={position} setPosition={setPosition} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" className={styles.btnSecondary} onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px' }}>Cancel</button>
          <button 
            type="button"
            className={styles.btnPrimary} 
            onClick={() => onSave(position?.lat, position?.lng)}
            disabled={!position}
            style={{ 
              opacity: !position ? 0.5 : 1, 
              padding: '10px 20px', 
              borderRadius: '8px',
              backgroundColor: '#0F172A',
              color: 'white',
              border: 'none',
              cursor: position ? 'pointer' : 'not-allowed'
            }}
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}
