import React, { useState, useEffect } from 'react';
import Search from './components/Search';
import CollectionList from './components/CollectionList';
import CollectionControls from './components/CollectionControls';
import ExportImportControls from './components/ExportImportControls';
import { ToastContainer, toast } from 'react-toastify';

const API_BASE_URL = 'https://musicbrainz.org/ws/2';

export default function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [collection, setCollection] = useState(() => {
    const saved = localStorage.getItem('my_record_collection');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('year_desc');
  const [filterArtist, setFilterArtist] = useState('');

  useEffect(() => {
    localStorage.setItem('my_record_collection', JSON.stringify(collection));
  }, [collection]);

  const getCoverArtUrl = async (mbid) => {
    try {
      const response = await fetch(`https://coverartarchive.org/release-group/${mbid}`);
      if (response.ok) {
        const data = await response.json();
        return data.images[0]?.thumbnails?.['250'] || data.images[0]?.image;
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  const handleSearch = async (query) => {
    if (!query) return;
    setIsLoading(true);
    setError(null);
    setSearchResults([]);

    try {
      const artistRes = await fetch(`${API_BASE_URL}/artist?query=${encodeURIComponent(query)}&fmt=json`);
      const artistData = await artistRes.json();

      if (artistData.artists?.length > 0) {
        const artistId = artistData.artists[0].id;
        const albumRes = await fetch(`${API_BASE_URL}/release-group?artist=${artistId}&inc=artist-credits&type=album&fmt=json`);
        const albumData = await albumRes.json();

        if (albumData['release-groups']) {
          const filtered = albumData['release-groups'].filter(g => 
            ['Album', 'EP', 'Single'].includes(g['primary-type'])
          );

          const formatted = await Promise.all(filtered.map(async (group) => {
            const coverUrl = await getCoverArtUrl(group.id);
            return {
              mbid: group.id,
              title: group.title,
              release_year: group['first-release-date'] ? new Date(group['first-release-date']).getFullYear() : 'N/A',
              artist: group['artist-credit'] ? group['artist-credit'][0].name : 'Unknown',
              cover_url: coverUrl,
              primary_type: group['primary-type'] || 'Album'
            };
          }));
          setSearchResults(formatted);
        }
      } else {
        setError(`No artist found for "${query}".`);
      }
    } catch (err) {
      setError('API Error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addToCollection = (album) => {
  if (!collection.find(a => a.mbid === album.mbid)) {
    setCollection([...collection, album]);
    toast.success(`"${album.title}" added to collection`);
  }
};

  const removeAlbum = (mbid) => {
  const album = collection.find(a => a.mbid === mbid);
  setCollection(collection.filter(a => a.mbid !== mbid));
  if (album) toast.error(`"${album.title}" removed from collection`);
};

  const clearSearchResults = () => {
  setSearchResults([]);
  setError(null);
};

  const displayedCollection = collection
    .filter(a => a.artist.toLowerCase().includes(filterArtist.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'year_desc') return b.release_year - a.release_year;
      if (sortBy === 'year_asc') return a.release_year - b.release_year;
      
      if (sortBy === 'title_asc') {
        return a.title.localeCompare(b.title);
      }
      
      if (sortBy === 'title_desc') {
        return b.title.localeCompare(a.title);
      }

      return 0;
    });

  return (
    <div className="container">
      <h1 className="header-title">My record collection</h1>
      
      <p className="description">Search and add your music - no account needed, everything saves inside your browser.</p>
      <p className="description-build">Powered by <a href="https://musicbrainz.org/doc/Development/XML_Web_Service/Version_2" target="_blank" rel="noopener noreferrer">MusicBrainz API</a>.</p>
      
      <section className="search-section">
        <Search onSearch={handleSearch} isLoading={isLoading} />
        {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}
        {(searchResults.length > 0 || error) && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button onClick={clearSearchResults} className="btn btn-remove">
              Clear results
            </button>
          </div>
        )}
        <div className="results-grid">
          {searchResults.map(album => (
            <div key={album.mbid} className="card">
              <div className="cover-wrapper">
                {album.cover_url ? (
                  <img src={album.cover_url} alt="cover" className="cover-image" />
                ) : (
                  <div className="no-cover">No Cover</div>
                )}
              </div>
              <div className="album-details">
                <p>{album.title}</p>
                <p>{album.artist} ({album.release_year})</p>
                <button 
                  className={collection.find(a => a.mbid === album.mbid) ? "btn-added" : "btn btn-add"}
                  onClick={() => addToCollection(album)}
                  disabled={collection.find(a => a.mbid === album.mbid)}
                >
                  {collection.find(a => a.mbid === album.mbid) ? "In Collection" : "Add"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
  <h2 className="section-title">
  My collection ({displayedCollection.length === collection.length 
    ? `${collection.length} ${collection.length === 1 ? 'album' : 'albums'}`
    : `${displayedCollection.length} of ${collection.length} albums`})
</h2>
  
  <CollectionControls 
    sortBy={sortBy} setSortBy={setSortBy}
    filterArtist={filterArtist} setFilterArtist={setFilterArtist}
    totalCount={collection.length} currentCount={displayedCollection.length}
    viewMode={viewMode} setViewMode={setViewMode}
  />
  <ExportImportControls collection={collection} setCollection={setCollection} />
  <CollectionList collection={displayedCollection} onRemove={removeAlbum} viewMode={viewMode} />
</section>
      
      <footer className="credits">Made by <a href="https://frontend-erik.se" target="_blank" rel="noopener noreferrer">Erik Karlsson</a></footer>
      <ToastContainer
      position="bottom-center"
      autoClose={2500}
      hideProgressBar={false}
      closeOnClick
      pauseOnHover
    />
    </div>
  );
}