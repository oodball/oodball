import React, { useState } from 'react';

function DigiballGalleryItem({
  photo,
  alt,
  onClick,
  showCaption = true,
  wrapItem = true,
  children,
}) {
  const [isPortrait, setIsPortrait] = useState(false);

  const handleLoad = (event) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    setIsPortrait(naturalHeight > naturalWidth);
  };

  const imageBlock = (
    <div className={`gallery-image-wrapper${isPortrait ? ' gallery-image-wrapper-portrait' : ''}`}>
      <img
        src={photo.src}
        alt={alt}
        className={`gallery-image${isPortrait ? ' gallery-image-portrait' : ''}`}
        loading="lazy"
        onLoad={handleLoad}
        onClick={onClick}
        style={onClick ? { cursor: 'pointer' } : undefined}
      />
      {showCaption && photo.caption && (
        <div className="gallery-caption">{photo.caption}</div>
      )}
      {children}
    </div>
  );

  if (!wrapItem) {
    return (
      <div className={isPortrait ? 'gallery-item-portrait' : undefined}>
        {imageBlock}
      </div>
    );
  }

  return (
    <div className={`gallery-item${isPortrait ? ' gallery-item-portrait' : ''}`}>
      {imageBlock}
    </div>
  );
}

export default DigiballGalleryItem;
