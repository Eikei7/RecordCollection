import React, { useEffect, useMemo, useState } from 'react';
import SpineView from './SpineView';
import AlbumModal from './AlbumModal';
import CoverImage from './CoverImage';

const MOBILE_MEDIA_QUERY = '(max-width: 640px)';

function useAlbumsPerPage() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_MEDIA_QUERY).matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    const updateIsMobile = (event) => setIsMobile(event.matches);
    mediaQuery.addEventListener('change', updateIsMobile);
    return () => mediaQuery.removeEventListener('change', updateIsMobile);
  }, []);

  return isMobile ? 12 : 24;
}

export default function CollectionList({ collection, onRemove, viewMode }) {
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [pagination, setPagination] = useState({ key: '', page: 1 });
  const albumsPerPage = useAlbumsPerPage();
  const paginationKey = `${viewMode}:${albumsPerPage}:${collection.map(album => album.mbid).join(',')}`;
  const currentPage = pagination.key === paginationKey ? pagination.page : 1;
  const totalPages = Math.ceil(collection.length / albumsPerPage);
  const paginatedCollection = useMemo(() => {
    const firstAlbumIndex = (currentPage - 1) * albumsPerPage;
    return collection.slice(firstAlbumIndex, firstAlbumIndex + albumsPerPage);
  }, [albumsPerPage, collection, currentPage]);

  if (viewMode === 'spine') {
    return <SpineView collection={collection} onRemove={onRemove} />;
  }

  if (collection.length === 0) return <p className="description">Collection is empty.</p>;

  const listClass = viewMode === 'list' ? 'album-list-view' : 'album-grid-view';

  return (
    <>
      <div className={`collection-grid ${listClass}`}>
        {paginatedCollection.map(album => (
          <div
            key={album.mbid}
            className="album-card-cover-focus"
            onClick={() => setSelectedAlbum(album)}
            style={{ cursor: 'pointer' }}
          >
            <div className="cover-focus-wrapper">
              <CoverImage src={album.cover_url} mbid={album.mbid} className="cover-focus-image" />
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(album.mbid); }}
                className="btn-remove-overlay"
              >
                &times;
              </button>
            </div>
            <div className="cover-focus-details">
              <p className="album-title">{album.title}</p>
              <p className="album-meta">{album.primary_type}</p>
              <p className="album-meta">{album.artist} ({album.release_year})</p>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="collection-pagination" aria-label="Collection pages">
          <button
            className="btn"
            onClick={() => setPagination({ key: paginationKey, page: currentPage - 1 })}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="collection-pagination-status">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn"
            onClick={() => setPagination({ key: paginationKey, page: currentPage + 1 })}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </nav>
      )}

      {selectedAlbum && (
        <AlbumModal
          album={selectedAlbum}
          onClose={() => setSelectedAlbum(null)}
          onRemove={onRemove}
        />
      )}
    </>
  );
}