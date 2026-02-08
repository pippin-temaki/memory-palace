import type { MemoryNode } from '../types/memory';

/**
 * Parse a markdown memory file into memory nodes
 * Handles both daily logs (with ## sections) and single-topic files
 */
export function parseMemoryFile(content: string, sourcePath: string): MemoryNode[] {
  const nodes: MemoryNode[] = [];
  const lines = content.split('\n');
  
  let currentTitle = '';
  let currentContent: string[] = [];
  let currentDate: string | undefined;
  
  // Extract date from filename if it's a daily log (YYYY-MM-DD.md)
  const dateMatch = sourcePath.match(/(\d{4}-\d{2}-\d{2})\.md$/);
  if (dateMatch) {
    currentDate = dateMatch[1];
  }
  
  for (const line of lines) {
    // Check for heading
    const h1Match = line.match(/^# (.+)$/);
    const h2Match = line.match(/^## (.+)$/);
    
    if (h1Match) {
      // Save previous section if exists
      if (currentTitle && currentContent.length > 0) {
        nodes.push(createNode(currentTitle, currentContent.join('\n'), sourcePath, currentDate));
      }
      currentTitle = h1Match[1];
      currentContent = [];
      
      // Check if title is a date
      if (/^\d{4}-\d{2}-\d{2}$/.test(currentTitle)) {
        currentDate = currentTitle;
      }
    } else if (h2Match) {
      // Save previous section if exists
      if (currentTitle && currentContent.length > 0) {
        nodes.push(createNode(currentTitle, currentContent.join('\n'), sourcePath, currentDate));
      }
      currentTitle = h2Match[1];
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  
  // Don't forget the last section
  if (currentTitle && currentContent.length > 0) {
    nodes.push(createNode(currentTitle, currentContent.join('\n'), sourcePath, currentDate));
  }
  
  // If no sections found, treat entire file as one memory
  if (nodes.length === 0 && content.trim()) {
    const title = sourcePath.split('/').pop()?.replace('.md', '') || 'Untitled';
    nodes.push(createNode(title, content, sourcePath, currentDate));
  }
  
  return nodes;
}

function createNode(
  title: string, 
  content: string, 
  source: string, 
  date?: string
): MemoryNode {
  const trimmedContent = content.trim();
  const tags = extractTags(trimmedContent);
  
  return {
    id: generateId(title, source),
    title,
    content: trimmedContent,
    date,
    source,
    tags,
  };
}

function generateId(title: string, source: string): string {
  const base = `${source}-${title}`.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return base.slice(0, 50);
}

function extractTags(content: string): string[] {
  const tags: string[] = [];
  
  // Look for hashtags
  const hashtagMatches = content.match(/#[a-zA-Z][a-zA-Z0-9_-]*/g);
  if (hashtagMatches) {
    tags.push(...hashtagMatches.map(t => t.slice(1).toLowerCase()));
  }
  
  // Look for keywords (could be expanded)
  const keywords = ['important', 'todo', 'decision', 'lesson', 'project', 'person', 'idea'];
  for (const keyword of keywords) {
    if (content.toLowerCase().includes(keyword)) {
      tags.push(keyword);
    }
  }
  
  return [...new Set(tags)];
}

/**
 * Find connections between memories based on shared keywords/tags
 */
export function findConnections(nodes: MemoryNode[]): { source: string; target: string; strength: number }[] {
  const links: { source: string; target: string; strength: number }[] = [];
  
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const nodeA = nodes[i];
      const nodeB = nodes[j];
      
      // Calculate connection strength based on shared tags and content similarity
      let strength = 0;
      
      // Shared tags
      const sharedTags = nodeA.tags?.filter(t => nodeB.tags?.includes(t)) || [];
      strength += sharedTags.length * 0.3;
      
      // Same date (same day's memories are related)
      if (nodeA.date && nodeA.date === nodeB.date) {
        strength += 0.2;
      }
      
      // Shared words in title
      const wordsA = nodeA.title.toLowerCase().split(/\s+/);
      const wordsB = nodeB.title.toLowerCase().split(/\s+/);
      const sharedWords = wordsA.filter(w => w.length > 3 && wordsB.includes(w));
      strength += sharedWords.length * 0.15;
      
      // Only create link if strength is significant
      if (strength >= 0.2) {
        links.push({
          source: nodeA.id,
          target: nodeB.id,
          strength: Math.min(strength, 1),
        });
      }
    }
  }
  
  return links;
}
