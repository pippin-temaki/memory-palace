import { useState } from 'react';
import { MemoryGraph } from './components/MemoryGraph';
import { MemoryDetail } from './components/MemoryDetail';
import type { MemoryNode } from './types/memory';
import { sampleMemories, sampleLinks } from './data/sampleMemories';
import './App.css';

function App() {
  const [selectedMemory, setSelectedMemory] = useState<MemoryNode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter nodes based on search
  const filteredNodes = searchTerm
    ? sampleMemories.filter(m => 
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.tags?.some(t => t.includes(searchTerm.toLowerCase()))
      )
    : sampleMemories;

  // Filter links to only include visible nodes
  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredLinks = sampleLinks.filter(
    l => filteredNodeIds.has(l.source) && filteredNodeIds.has(l.target)
  );

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏛️ Memory Palace</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search memories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={() => setSearchTerm('')}
            >
              ×
            </button>
          )}
        </div>
        <div className="stats">
          {filteredNodes.length} memories
          {searchTerm && ` (filtered from ${sampleMemories.length})`}
        </div>
      </header>

      <main className="app-main">
        <div className="graph-container">
          <MemoryGraph
            nodes={filteredNodes}
            links={filteredLinks}
            onNodeClick={setSelectedMemory}
            selectedNodeId={selectedMemory?.id}
          />
        </div>

        <aside className={`sidebar ${selectedMemory ? 'open' : ''}`}>
          <MemoryDetail
            memory={selectedMemory}
            onClose={() => setSelectedMemory(null)}
          />
        </aside>
      </main>

      <footer className="app-footer">
        <span>Pippin's Memory Palace v0.1</span>
        <span>•</span>
        <span>Click & drag nodes • Scroll to zoom</span>
      </footer>
    </div>
  );
}

export default App;
