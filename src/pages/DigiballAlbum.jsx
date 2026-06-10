import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import albums from '../digiball_albums';

function DigiballAlbum() {
  const { albumId } = useParams();
  const [selectedImage, setSelectedImage] = useState(null);

  const album = albums[albumId];
  const photos = album ? album.photos : [];

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    if (selectedImage) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  const handleCloseModal = (e) => {
    if (e.target === e.currentTarget) setSelectedImage(null);
  };

  const navigateImage = (direction) => {
    if (!selectedImage) return;
    const currentIndex = photos.findIndex(p => p.src === selectedImage.src);
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < photos.length) {
      setSelectedImage(photos[newIndex]);
    }
  };

  useEffect(() => {
    const handleKeyNav = (e) => {
      if (!selectedImage) return;
      if (e.key === 'ArrowRight') navigateImage(1);
      if (e.key === 'ArrowLeft') navigateImage(-1);
    };
    document.addEventListener('keydown', handleKeyNav);
    return () => document.removeEventListener('keydown', handleKeyNav);
  });

  if (!album) {
    return (
      <div className="digiball">
        <div className="gallery-container">
          <p>Album not found.</p>
          <Link to="/digiball">Back to Albums</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="digiball">
      <div className="gallery-container">
        <div className="album-header">
          <Link to="/digiball" className="album-back-link">← Albums</Link>
          <h2 className="album-page-title">{album.title}</h2>
        </div>

        <div className="gallery-grid">
          {photos.map((photo, index) => (
            <div key={index} className="gallery-item">
              <div className="gallery-image-wrapper">
                <img
                  src={photo.src}
                  alt={photo.caption || album.title}
                  className="gallery-image"
                  loading="lazy"
                  onClick={() => setSelectedImage(photo)}
                  style={{ cursor: 'pointer' }}
                />
                {photo.caption && (
                  <div className="gallery-caption">{photo.caption}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {photos.length === 0 && (
          <p style={{ textAlign: 'center', fontFamily: "'Courier New', monospace", color: '#5d2e0a', marginTop: '2rem' }}>
            No photos yet.
          </p>
        )}
      </div>

      {selectedImage && (
        <div className="lightbox-overlay" onClick={handleCloseModal}>
          <div className="lightbox-content">
            <button
              className="lightbox-close"
              onClick={() => setSelectedImage(null)}
              aria-label="Close"
            >
              ×
            </button>
            <button
              className="lightbox-nav lightbox-prev"
              onClick={() => navigateImage(-1)}
              disabled={photos.findIndex(p => p.src === selectedImage.src) === 0}
              aria-label="Previous"
            >
              ‹
            </button>
            <img
              src={selectedImage.src}
              alt={selectedImage.caption || ''}
              className="lightbox-image"
            />
            <button
              className="lightbox-nav lightbox-next"
              onClick={() => navigateImage(1)}
              disabled={photos.findIndex(p => p.src === selectedImage.src) === photos.length - 1}
              aria-label="Next"
            >
              ›
            </button>
            {selectedImage.caption && (
              <div className="lightbox-caption">{selectedImage.caption}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DigiballAlbum;
