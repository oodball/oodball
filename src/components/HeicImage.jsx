import React, { useState, useEffect } from 'react';
import heic2any from 'heic2any';

function HeicImage({ src, alt, className, onError }) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      // Check if the file is HEIC
      if (src.toLowerCase().endsWith('.heic') || src.toLowerCase().endsWith('.heif')) {
        setIsLoading(true);
        try {
          // Fetch the HEIC file
          const response = await fetch(src);
          const blob = await response.blob();
          
          // Convert HEIC to JPEG
          const convertedBlob = await heic2any({
            blob: blob,
            toType: 'image/jpeg',
            quality: 0.8
          });
          
          // Create URL for the converted image
          const url = URL.createObjectURL(convertedBlob);
          setImageSrc(url);
        } catch (error) {
          console.error('Error converting HEIC:', error);
          if (onError) onError();
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadImage();
  }, [src, onError]);

  if (isLoading) {
    return <div className={`${className} loading-image`}>Converting image...</div>;
  }

  return (
    <img 
      src={imageSrc} 
      alt={alt} 
      className={className}
      onError={onError}
    />
  );
}

export default HeicImage; 