import React from 'react';
import { Link } from 'react-router-dom';
import albums, { ALBUM_ORDER } from '../digiball_albums';
import DigiballGalleryItem from '../components/DigiballGalleryItem';

function Digiball() {
  const albumList = ALBUM_ORDER
    .filter((id) => albums[id])
    .map((id) => ({
      id,
      title: albums[id].title,
      cover: albums[id].photos.length > 0 ? albums[id].photos[0] : null,
    }));

  return (
    <div className="digiball">
      <div className="gallery-container">
        <div className="album-grid">
          {albumList.map((album) => (
            <Link to={`/digiball/${album.id}`} key={album.id} className="album-card">
              {album.cover ? (
                <DigiballGalleryItem
                  photo={album.cover}
                  alt={album.title}
                  showCaption={false}
                  wrapItem={false}
                >
                  <div className="album-card-title">{album.title}</div>
                </DigiballGalleryItem>
              ) : (
                <div className="gallery-image-wrapper">
                  <div className="album-placeholder" />
                  <div className="album-card-title">{album.title}</div>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Digiball;
