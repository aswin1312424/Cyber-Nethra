import React from 'react';
import loadingVid from '../assets/loading.mp4';

const LoadingScreen = () => {
  return (
    <div style={styles.loaderContainer}>
      <video 
        autoPlay 
        muted 
        playsInline
        style={styles.video}
      >
        <source src={loadingVid} type="video/mp4" />
      </video>
    </div>
  );
};

const styles = {
  loaderContainer: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    width: '100vw', 
    height: '100vh', 
    background: '#000', // Black background so there are no white flashes
    overflow: 'hidden',
    zIndex: 9999 
  },
  video: { 
    width: '100%', 
    height: '100%', 
    objectFit: 'cover', // This is the magic line that makes it fill the screen
    display: 'block'
  }
};

export default LoadingScreen;