import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import CoverImage from './CoverImage';

function luminance(rgb) {
  const match = rgb.match(/\d+/g);
  if (!match) return 128;
  const [r, g, b] = match.map(Number);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// memo prevents re-render when sibling album colors load
const SpineItem = memo(function SpineItem({ album, onClick, bgColor }) {
  const textColor = luminance(bgColor) > 140 ? '#111' : '#f3f3f2';

  return (
    <div
      className="spine-item"
      style={{ backgroundColor: bgColor, color: textColor }}
      onClick={() => onClick(album)}
    >
      <span className="spine-text">{album.artist} — {album.title}</span>
    </div>
  );
});

function SpineModal({ album, onClose, onRemove, bgColor }) {
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="spine-modal-backdrop" onClick={handleBackdrop}>
      <div className="spine-modal">
        <button className="spine-modal-close" onClick={onClose} aria-label="Close">&times;</button>
        <CoverImage
          src={album.cover_url}
          mbid={album.mbid}
          className="spine-modal-cover"
          noCoverClassName="spine-modal-no-cover"
        />
        <div className="spine-modal-details" style={{ borderTop: `4px solid ${bgColor}` }}>
          <p className="spine-modal-title">{album.title}</p>
          <p className="spine-modal-meta">{album.artist}</p>
          <p className="spine-modal-meta">{album.primary_type} · {album.release_year}</p>
          <button
            className="btn btn-remove"
            onClick={() => { onRemove(album.mbid); onClose(); }}
          >
            Remove from collection
          </button>
        </div>
      </div>
    </div>
  );
}

const SPINE_WIDTH = 19;

export default function SpineView({ collection, onRemove }) {
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [itemsPerRow, setItemsPerRow] = useState(20);
  const containerRef = useRef(null);

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setItemsPerRow(Math.max(1, Math.floor(width / SPINE_WIDTH)));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Memoize shelf layout so it only recalculates when collection or width changes
  const shelves = useMemo(() => {
    const result = [];
    for (let i = 0; i < collection.length; i += itemsPerRow) {
      result.push(collection.slice(i, i + itemsPerRow));
    }
    return result;
  }, [collection, itemsPerRow]);

  // Early return must come after all hooks
  if (collection.length === 0) return <p className="description">No albums match your filter.</p>;

  const selectedColor = '#415A77';

  return (
    <>
      <div className="spine-shelves" ref={containerRef}>
        {shelves.map((shelf, index) => (
          <div key={index} className="spine-shelf">
            <div className="spine-shelf-surface">
              {shelf.map(album => (
                <SpineItem
                  key={album.mbid}
                  album={album}
                  bgColor="#415A77"
                  onClick={setSelectedAlbum}
                />
              ))}
            </div>
            <div className="spine-shelf-plank" />
          </div>
        ))}
      </div>

      {selectedAlbum && (
        <SpineModal
          album={selectedAlbum}
          bgColor={selectedColor}
          onClose={() => setSelectedAlbum(null)}
          onRemove={onRemove}
        />
      )}
    </>
  );
}