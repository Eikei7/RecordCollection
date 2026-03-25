import React from 'react';

export default function CollectionList({ collection, onRemove, viewMode }) {
  if (collection.length === 0) return <p className="description">Collection is empty.</p>;

  const listClass = viewMode === 'list' ? 'album-list-view' : 'album-grid-view';

  return (
    <div className={`collection-grid ${listClass}`}>
      {collection.map(album => (
        <div key={album.mbid} className="album-card-cover-focus">
          <div className="cover-focus-wrapper">
            {album.cover_url ? <img src={album.cover_url} alt="cover" className="cover-focus-image" /> : <div className="no-cover cover-focus-image">No Cover</div>}
            <button onClick={() => onRemove(album.mbid)} className="btn-remove-overlay">&times;</button>
          </div>
          <div className="cover-focus-details">
            <p className="album-title">{album.title}</p>
            <p className="album-meta">{album.primary_type}</p>
            <p className="album-meta">{album.artist} ({album.release_year})</p>
          </div>
        </div>
      ))}
    </div>
  );
}