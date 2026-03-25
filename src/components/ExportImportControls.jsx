import React from 'react';

export default function ExportImportControls({ collection, setCollection }) {
  const exportData = () => {
    const today = new Date().toISOString().split('T')[0];
    
    const dataStr = JSON.stringify(collection, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    
    link.download = `my-record-collection-${today}.json`;
    
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (window.confirm(`Do you want to replace your collection with ${imported.length} albums?`)) {
          setCollection(imported);
        }
      } catch (err) { 
        alert('Invalid file format. Please upload a valid JSON collection.'); 
      }
      e.target.value = null;
    };
    reader.readAsText(file);
  };

  return (
    <div className="export-import-controls-bar">
      <button onClick={exportData} className="btn btn-export">
        Export collection
      </button>

      <label className="btn btn-import">
        Import collection
        <input 
          type="file" 
          accept=".json" 
          onChange={importData} 
          style={{ display: 'none' }} 
        />
      </label>
    </div>
  );
}