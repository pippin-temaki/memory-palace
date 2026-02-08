// Memory types for the Memory Palace

export interface MemoryNode {
  id: string;
  title: string;
  content: string;
  date?: string;
  source: string; // file path
  tags?: string[];
  connections?: string[]; // IDs of related memories
  embedding?: number[]; // for clustering
  x?: number;
  y?: number;
}

export interface MemoryCluster {
  id: string;
  label: string;
  memories: string[]; // IDs
  color: string;
}

export interface MemoryGraph {
  nodes: MemoryNode[];
  clusters: MemoryCluster[];
  links: { source: string; target: string; strength: number }[];
}
