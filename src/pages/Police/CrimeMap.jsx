import React from 'react';

const CrimeMap = () => {
    // Mock Data for "Hotspots"
    const hotspots = [
        { id: 1, lat: 20, lng: 30, intensity: 'high', label: 'Financial Fraud Hub (Delhi)' },
        { id: 2, lat: 60, lng: 70, intensity: 'medium', label: 'Phishing Ring (Jamtara)' },
        { id: 3, lat: 40, lng: 50, intensity: 'low', label: 'Carding (Mumbai)' },
        { id: 4, lat: 80, lng: 20, intensity: 'high', label: 'Crypto Scams (Bangalore)' },
    ];

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={{ color: '#003366', margin: 0 }}>🗺️ Geo-Spatial Crime Mapping</h2>
                <p style={{ color: '#627D98', margin: '5px 0' }}>Real-time visualization of cyber crime hotspots.</p>
            </div>

            <div style={styles.mapContainer}>
                {/* Simulated Map Background */}
                <div style={styles.mapGrid}>
                    {/* Render Grid Lines */}
                    {[...Array(10)].map((_, i) => (
                        <div key={`v-${i}`} style={{ ...styles.gridLine, left: `${i * 10}%`, height: '100%', width: '1px' }} />
                    ))}
                    {[...Array(10)].map((_, i) => (
                        <div key={`h-${i}`} style={{ ...styles.gridLine, top: `${i * 10}%`, width: '100%', height: '1px' }} />
                    ))}

                    {/* Render Hotspots */}
                    {hotspots.map(spot => (
                        <div
                            key={spot.id}
                            style={{
                                ...styles.hotspot,
                                top: `${spot.lat}%`,
                                left: `${spot.lng}%`,
                                backgroundColor: spot.intensity === 'high' ? 'rgba(229, 62, 62, 0.6)' :
                                    spot.intensity === 'medium' ? 'rgba(221, 107, 32, 0.6)' : 'rgba(49, 130, 206, 0.6)'
                            }}
                        >
                            <div style={styles.pulse} />
                            <div style={styles.tooltip}>{spot.label}</div>
                        </div>
                    ))}
                </div>

                <div style={styles.legend}>
                    <div style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#E53E3E' }}></span> High Intensity</div>
                    <div style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#DD6B20' }}></span> Moderate Activity</div>
                    <div style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#3182CE' }}></span> Developing Cluster</div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' },
    header: { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
    mapContainer: { flex: 1, background: '#1A202C', borderRadius: '15px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
    mapGrid: { width: '100%', height: '100%', position: 'relative' },
    gridLine: { position: 'absolute', background: 'rgba(255,255,255,0.05)' },
    hotspot: {
        position: 'absolute', width: '60px', height: '60px', borderRadius: '50%',
        transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer'
    },
    pulse: {
        width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%',
        animation: 'pulse 2s infinite', opacity: 0.8
    },
    tooltip: {
        position: 'absolute', bottom: '70px', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.8)', color: 'white', padding: '5px 10px', borderRadius: '4px',
        fontSize: '12px', whiteSpace: 'nowrap', pointerEvents: 'none'
    },
    legend: {
        position: 'absolute', bottom: '20px', right: '20px', background: 'rgba(0,0,0,0.7)',
        padding: '15px', borderRadius: '8px', color: 'white', backdropFilter: 'blur(5px)'
    },
    legendItem: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', fontSize: '12px' },
    legendDot: { width: '10px', height: '10px', borderRadius: '50%' }
};

export default CrimeMap;
