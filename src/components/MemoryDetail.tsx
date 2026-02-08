import type { MemoryNode } from '../types/memory';

interface MemoryDetailProps {
  memory: MemoryNode | null;
  onClose: () => void;
}

export function MemoryDetail({ memory, onClose }: MemoryDetailProps) {
  if (!memory) {
    return (
      <div className="memory-detail empty">
        <p>Select a memory node to view details</p>
      </div>
    );
  }

  return (
    <div className="memory-detail">
      <div className="memory-header">
        <h2>{memory.title}</h2>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
      
      <div className="memory-meta">
        {memory.date && (
          <span className="date">📅 {memory.date}</span>
        )}
        <span className="source">📁 {memory.source.split('/').pop()}</span>
      </div>
      
      {memory.tags && memory.tags.length > 0 && (
        <div className="memory-tags">
          {memory.tags.map(tag => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>
      )}
      
      <div className="memory-content">
        {memory.content.split('\n').map((line, i) => (
          <p key={i}>{line || <br />}</p>
        ))}
      </div>
    </div>
  );
}
