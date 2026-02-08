import type { MemoryNode } from '../types/memory';

export interface MemoryData {
  nodes: MemoryNode[];
  links: { source: string; target: string; strength: number }[];
  lastUpdated: string;
}

/**
 * Load memories from pre-generated JSON file
 * Use scripts/buildMemories.ts to generate the JSON from markdown files
 */
export async function loadMemoriesFromJson(url: string = '/memories.json'): Promise<MemoryData> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load memories: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('Could not load memories.json, using sample data');
    return {
      nodes: [],
      links: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}
