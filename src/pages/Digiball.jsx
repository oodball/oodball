import React, { useState, useEffect } from 'react';

function Digiball() {
  const [selectedImage, setSelectedImage] = useState(null);

  // Gallery items - you can add more images here
  const galleryItems = [
    {
      src: "/images/Digiball/digiball.JPG",
      alt: "The First Pic!",
      caption: "The First Pic!"
    },
    // Add more gallery items here as needed
    // {
    //   src: "/images/Digiball/image2.jpg",
    //   alt: "Description",
    //   caption: "Caption text"
    // },
  ];

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  const handleImageClick = (item) => {
    setSelectedImage(item);
  };

  const handleCloseModal = (e) => {
    // Close if clicking the backdrop (not the image itself)
    if (e.target === e.currentTarget) {
      setSelectedImage(null);
    }
  };

  return (
    <div className="digiball">
      <div className="gallery-container">
        <div className="gallery-grid">
          {galleryItems.map((item, index) => (
            <div key={index} className="gallery-item">
              <div className="gallery-image-wrapper">
                <img 
                  src={item.src} 
                  alt={item.alt}
                  className="gallery-image"
                  onClick={() => handleImageClick(item)}
                  style={{ cursor: 'pointer' }}
                />
                <div className="gallery-caption">
                  {item.caption}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
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
            <img 
              src={selectedImage.src} 
              alt={selectedImage.alt}
              className="lightbox-image"
            />
            {selectedImage.caption && (
              <div className="lightbox-caption">
                {selectedImage.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Digiball; 