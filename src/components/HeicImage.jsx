import React, { useState, useEffect } from 'react';
import heic2any from 'heic2any';

function HeicImage({ src, alt, className, onError }) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleError = (event) => {
    console.error('Error loading image:', src);
    setHasError(true);
    if (onError && typeof onError === 'function') {
      // Create a mock event if none was provided (from catch block)
      const errorEvent = event || { target: { style: { display: 'none' } } };
      onError(errorEvent);
    }
  };

  useEffect(() => {
    const loadImage = async () => {
      console.log('HeicImage: Processing src:', src);
      
      // Check if the file is HEIC
      if (src.toLowerCase().endsWith('.heic') || src.toLowerCase().endsWith('.heif')) {
        console.log('HeicImage: Detected HEIC file, starting conversion...');
        setIsLoading(true);
        setHasError(false);
        
        try {
          // Check if heic2any is available
          if (typeof heic2any !== 'function') {
            throw new Error('heic2any library not available');
          }

          // Fetch the HEIC file
          console.log('HeicImage: Fetching HEIC file...');
          const response = await fetch(src);
          if (!response.ok) {
            throw new Error(`Failed to fetch HEIC file: ${response.status} ${response.statusText}`);
          }
          
          const blob = await response.blob();
          console.log('HeicImage: HEIC blob size:', blob.size);
          
          // Check if blob is empty or too large
          if (blob.size === 0) {
            throw new Error('HEIC file is empty');
          }
          
          if (blob.size > 50 * 1024 * 1024) { // 50MB limit
            throw new Error('HEIC file is too large for conversion');
          }
          
          // Convert HEIC to JPEG
          console.log('HeicImage: Converting HEIC to JPEG...');
          const convertedBlob = await heic2any({
            blob: blob,
            toType: 'image/jpeg',
            quality: 0.8
          });
          
          if (!convertedBlob || convertedBlob.size === 0) {
            throw new Error('HEIC conversion failed - empty result');
          }
          
          console.log('HeicImage: Conversion successful, blob size:', convertedBlob.size);
          
          // Create URL for the converted image
          const url = URL.createObjectURL(convertedBlob);
          console.log('HeicImage: Created object URL:', url);
          setImageSrc(url);
          
        } catch (error) {
          console.error('HeicImage: Error converting HEIC:', error);
          
          // Try to provide a fallback message
          const fallbackMessage = `Unable to display HEIC image: ${error.message}`;
          console.warn(fallbackMessage);
          
          // Create a fallback image with error message
          const canvas = document.createElement('canvas');
          canvas.width = 400;
          canvas.height = 300;
          const ctx = canvas.getContext('2d');
          
          // Draw error background
          ctx.fillStyle = '#f8f9fa';
          ctx.fillRect(0, 0, 400, 300);
          
          // Draw error text
          ctx.fillStyle = '#6c757d';
          ctx.font = '16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('HEIC Image', 200, 120);
          ctx.fillText('Conversion Failed', 200, 150);
          ctx.font = '12px Arial';
          ctx.fillText('Please convert to JPEG', 200, 180);
          
          const fallbackUrl = canvas.toDataURL();
          setImageSrc(fallbackUrl);
          setHasError(true);
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log('HeicImage: Not a HEIC file, using original src');
        setHasError(false);
      }
    };

    loadImage();
  }, [src]);

  // For non-HEIC files, just render a regular img tag
  if (!src.toLowerCase().endsWith('.heic') && !src.toLowerCase().endsWith('.heif')) {
    console.log('HeicImage: Rendering regular img tag for:', src);
    return (
      <img 
        src={src} 
        alt={alt} 
        className={className}
        onError={handleError}
        onLoad={() => console.log('HeicImage: Image loaded successfully:', src)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className={`${className} loading-image`}>
        <div>Converting HEIC image...</div>
        <div style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>
          This may take a moment
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`${className} error-image`} style={{
        border: '2px dashed #dc3545',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div style={{ color: '#dc3545', fontWeight: 'bold', marginBottom: '8px' }}>
          HEIC Image Error
        </div>
        <div style={{ fontSize: '14px', color: '#6c757d' }}>
          Unable to convert HEIC format
        </div>
        <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
          Please convert to JPEG or PNG
        </div>
      </div>
    );
  }

  return (
    <img 
      src={imageSrc} 
      alt={alt} 
      className={className}
      onError={handleError}
      onLoad={() => console.log('HeicImage: Converted image loaded successfully:', imageSrc)}
    />
  );
}

export default HeicImage; 