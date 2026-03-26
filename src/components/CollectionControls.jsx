import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import shelfIcon from '../assets/shelf.png';
import shelfIconWhite from '../assets/shelf-white.png';

export default function CollectionControls({ 
  sortBy, setSortBy, filterArtist, setFilterArtist, totalCount, currentCount, viewMode, setViewMode 
}) {
  const bandNames = ["Metallica", "The Beatles", "Fleetwood Mac", "Daft Punk", "Queen", "Jimi Hendrix", "ABBA", "Radiohead", "Nirvana", "David Bowie"];
  
  const randomPlaceholder = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * bandNames.length);
    return `e.g. ${bandNames[randomIndex]}`;
  }, []);

  return (
    <div className="collection-controls-bar">
      <div className="control-group">
        <label className="control-label">Sort by:</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="control-select">
          <option value="year_desc">Release year (Newest first)</option>
          <option value="year_asc">Release year (Oldest first)</option>
          <option value="title_asc">Title (A-Z)</option>
          <option value="title_desc">Title (Z-A)</option>
        </select>
      </div>

      <div className="control-group">
        <label className="control-label">Filter Artist/Band:</label>
        <input 
          type="text" placeholder={randomPlaceholder} 
          value={filterArtist} onChange={(e) => setFilterArtist(e.target.value)} 
          className="control-input" 
        />
      </div>

      <div className="view-mode-controls">
        <label className="control-label">View:</label>
        <button onClick={() => setViewMode('grid')} className={`btn-view-mode ${viewMode === 'grid' ? 'active' : ''}`}>
          <FontAwesomeIcon icon="th-large" style={{ width: '21px', height: '21px' }} />
        </button>
        <button onClick={() => setViewMode('list')} className={`btn-view-mode ${viewMode === 'list' ? 'active' : ''}`}>
          <FontAwesomeIcon icon="list" style={{ width: '21px', height: '21px' }} />
        </button>
        <button onClick={() => setViewMode('spine')} className={`btn-view-mode ${viewMode === 'spine' ? 'active' : ''}`}>
          <img 
            src={viewMode === 'spine' ? shelfIconWhite : shelfIcon} 
            alt="Spine view" 
            style={{ width: '27px', height: '27px' }} 
          />
        </button>
      </div>

      <p className="status-text">Showing {currentCount} of {totalCount} albums</p>
    </div>
  );
}