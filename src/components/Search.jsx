import React, { useState } from 'react';
import loadingGif from '../assets/loading.gif';

export default function Search({ onSearch, isLoading }) {
  const [query, setQuery] = useState('');
  const handleSubmit = (e) => { e.preventDefault(); onSearch(query); };
  return (
    <>
      <form onSubmit={handleSubmit} className="search-form">
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search artists or bands..." className="search-input" />
        <button type="submit" className="btn btn-primary" disabled={isLoading}>{isLoading ? 'Searching...' : 'Search'}</button>
      </form>
      {isLoading && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <img src={loadingGif} alt="Loading..." style={{ width: '64px', height: '64px' }} />
        </div>
      )}
    </>
  );
}