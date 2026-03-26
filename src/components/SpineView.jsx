import React, { useState, useEffect, useRef } from 'react';

function getDominantColor(imgUrl, callback) {
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, img.width, img.height).data;
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 16) {
      r += data[i]; g += data[i+1]; b += data[i+2]; count++;
    }
    callback(`rgb(${Math.round(r/count)},${Math.round(g/count)},${Math.round(b/count)})`);
  };
  img.onerror = () => callback(null);
  img.src = imgUrl;
}

function luminance(rgb) {
  const match = rgb.match(/\d+/g);
  if (!match) return 128;
  const [r, g, b] = match.map(Number);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function SpineItem({ album, onClick, bgColor }) {
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
}

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
        {album.cover_url
          ? <img src={album.cover_url} alt="cover" className="spine-modal-cover" />
          : <div className="spine-modal-no-cover">No Cover</div>
        }
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

export default function SpineView({ collection, onRemove }) {
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [colors, setColors] = useState({});

  useEffect(() => {
    collection.forEach(album => {
      if (album.cover_url && !colors[album.mbid]) {
        getDominantColor(album.cover_url, (color) => {
          if (color) setColors(prev => ({ ...prev, [album.mbid]: color }));
        });
      }
    });
  }, [collection]);

  if (collection.length === 0) return <p className="description">Collection is empty.</p>;

  const selectedColor = selectedAlbum ? (colors[selectedAlbum.mbid] || '#415A77') : '#415A77';

  const SPINE_WIDTH = 19;

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

  const shelves = [];
  for (let i = 0; i < collection.length; i += itemsPerRow) {
    shelves.push(collection.slice(i, i + itemsPerRow));
  }

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
                  bgColor={colors[album.mbid] || '#415A77'}
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