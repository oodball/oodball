import React from 'react';
import { Link } from 'react-router-dom';
import albums from '../digiball_albums';

function Digiball() {
  const albumList = Object.entries(albums).map(([id, album]) => ({
    id,
    title: album.title,
    cover: album.photos.length > 0 ? album.photos[0].src : null,
  }));

  return (
    <div className="digiball">
      <div className="gallery-container">
        <div className="album-grid">
          {albumList.map((album) => (
            <Link to={`/digiball/${album.id}`} key={album.id} className="album-card">
              <div className="gallery-image-wrapper">
                {album.cover ? (
                  <img
                    src={album.cover}
                    alt={album.title}
                    className="gallery-image"
                    loading="lazy"
                  />
                ) : (
                  <div className="album-placeholder" />
                )}
                <div className="album-card-title">
                  {album.title}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Digiball;
