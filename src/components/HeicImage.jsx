import React from 'react';

/**
 * Lightweight image component with lazy loading.
 * HEIC files should be pre-converted to JPEG via `npm run convert-heic` before build.
 */
function HeicImage({ src, alt, className, onError }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={onError}
    />
  );
}

export default HeicImage;
