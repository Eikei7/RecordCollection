import { useState, useEffect } from 'react';

const API_BASE_URL = 'https://musicbrainz.org/ws/2';
const LASTFM_API_URL = 'https://ws.audioscrobbler.com/2.0/';
const LASTFM_API_KEY = import.meta.env.VITE_LASTFM_API_KEY;

export default function AlbumModal({ album, onClose, onRemove }) {
  const [details, setDetails] = useState(null);
  const [lastfm, setLastfm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const [mbRes, lfmRes] = await Promise.all([
          fetch(`${API_BASE_URL}/release-group/${album.mbid}?inc=genres+ratings+artist-credits&fmt=json`),
          fetch(`${LASTFM_API_URL}?method=album.getinfo&artist=${encodeURIComponent(album.artist)}&album=${encodeURIComponent(album.title)}&api_key=${LASTFM_API_KEY}&format=json`)
        ]);
        const mbData = await mbRes.json();
        const lfmData = await lfmRes.json();
        setDetails(mbData);
        setLastfm(lfmData.album || null);
      } catch (e) {
        setDetails(null);
        setLastfm(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [album.mbid]);

  const genres = details?.genres?.map(g => g.name) || [];
  const rating = details?.rating?.value ? Math.round(details.rating.value * 10) / 10 : null;
  const ratingCount = details?.rating?.['votes-count'] || 0;

  const formatCount = (num) => {
  const n = parseInt(num);
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
};

  const listeners = lastfm?.listeners ? formatCount(lastfm.listeners) : null;
  const playcount = lastfm?.playcount ? formatCount(lastfm.playcount) : null;

  return (
    <div className="album-modal-backdrop" onClick={handleBackdrop}>
      <div className="album-modal">
        <button className="spine-modal-close" onClick={onClose} aria-label="Close">&times;</button>

        <div className="album-modal-top">
          <div className="album-modal-cover-wrap">
            {album.cover_url
              ? <img src={album.cover_url} alt="cover" className="album-modal-cover" />
              : <div className="album-modal-no-cover">No Cover</div>
            }
          </div>
          <div className="album-modal-header">
            <p className="album-modal-title">{album.title}</p>
            <p className="album-modal-artist">{album.artist}</p>
            <p className="album-modal-meta">{album.primary_type} · {album.release_year}</p>
            {rating && (
              <p className="album-modal-rating">
                ★ {rating} <span className="album-modal-rating-count">({ratingCount} votes)</span>
              </p>
            )}
          </div>
        </div>

        <div className="album-modal-body">
          {isLoading ? (
            <p className="album-modal-loading">Loading details...</p>
          ) : (
            <>
              {(listeners || playcount) && (
                <div className="album-modal-section">
                  <p className="album-modal-section-label">Last.fm</p>
                  <div className="album-modal-stats">
                    {listeners && (
                      <div className="album-modal-stat">
                        <span className="album-modal-stat-value">{listeners}</span>
                        <span className="album-modal-stat-label">listeners</span>
                      </div>
                    )}
                    {playcount && (
                      <div className="album-modal-stat">
                        <span className="album-modal-stat-value">{playcount}</span>
                        <span className="album-modal-stat-label">plays</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {genres.length > 0 && (
                <div className="album-modal-section">
                  <p className="album-modal-section-label">Genres</p>
                  <div className="album-modal-tags">
                    {genres.map(g => <span key={g} className="album-modal-tag album-modal-tag-genre">{g}</span>)}
                  </div>
                </div>
              )}

              {!listeners && !playcount && !genres.length && (
                <p className="album-modal-loading">No additional details available.</p>
              )}
            </>
          )}
        </div>

        <div className="album-modal-footer"><a
  
    href={`https://musicbrainz.org/release-group/${album.mbid}`}
    target="_blank"
    rel="noopener noreferrer"
    className="btn btn-mb-link"
  >
    MusicBrainz {'\u2197'}
  </a>
  {lastfm?.url && (<a
    
      href={lastfm.url}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-mb-link"
    >
      Last.fm {'\u2197'}
    </a>
  )}
  <button
    className="btn btn-remove"
    onClick={() => { onRemove(album.mbid); onClose(); }}
  >
    Remove
  </button>
</div>
      </div>
    </div>
  );
}