#!/usr/bin/env npx tsx
/**
 * Build script to generate memories.json from markdown files
 * 
 * Usage: npx tsx scripts/buildMemories.ts [memoryDir]
 * 
 * Reads:
 *   - MEMORY.md (long-term memories)
 *   - memory/*.md (daily logs)
 * 
 * Outputs: public/memories.json
 */

import * as fs from 'fs';
import * as path from 'path';

// Types (duplicated here to avoid import issues)
interface MemoryNode {
  id: string;
  title: string;
  content: string;
  date?: string;
  source: string;
  tags?: string[];
}

// Parser (simplified version)
function parseMemoryFile(content: string, sourcePath: string): MemoryNode[] {
  const nodes: MemoryNode[] = [];
  const lines = content.split('\n');
  
  let currentTitle = '';
  let currentContent: string[] = [];
  let currentDate: string | undefined;
  
  const dateMatch = sourcePath.match(/(\d{4}-\d{2}-\d{2})\.md$/);
  if (dateMatch) {
    currentDate = dateMatch[1];
  }
  
  for (const line of lines) {
    const h1Match = line.match(/^# (.+)$/);
    const h2Match = line.match(/^## (.+)$/);
    
    if (h1Match) {
      if (currentTitle && currentContent.length > 0) {
        nodes.push(createNode(currentTitle, currentContent.join('\n'), sourcePath, currentDate));
      }
      currentTitle = h1Match[1];
      currentContent = [];
      if (/^\d{4}-\d{2}-\d{2}$/.test(currentTitle)) {
        currentDate = currentTitle;
      }
    } else if (h2Match) {
      if (currentTitle && currentContent.length > 0) {
        nodes.push(createNode(currentTitle, currentContent.join('\n'), sourcePath, currentDate));
      }
      currentTitle = h2Match[1];
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  
  if (currentTitle && currentContent.length > 0) {
    nodes.push(createNode(currentTitle, currentContent.join('\n'), sourcePath, currentDate));
  }
  
  if (nodes.length === 0 && content.trim()) {
    const title = path.basename(sourcePath, '.md');
    nodes.push(createNode(title, content, sourcePath, currentDate));
  }
  
  return nodes;
}

function createNode(title: string, content: string, source: string, date?: string): MemoryNode {
  const trimmedContent = content.trim();
  return {
    id: generateId(title, source),
    title,
    content: trimmedContent,
    date,
    source: path.basename(source),
    tags: extractTags(trimmedContent),
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
  const hashtagMatches = content.match(/#[a-zA-Z][a-zA-Z0-9_-]*/g);
  if (hashtagMatches) {
    tags.push(...hashtagMatches.map(t => t.slice(1).toLowerCase()));
  }
  const keywords = ['important', 'todo', 'decision', 'lesson', 'project', 'person', 'idea', 'miguel', 'gandalf'];
  for (const keyword of keywords) {
    if (content.toLowerCase().includes(keyword)) {
      tags.push(keyword);
    }
  }
  return [...new Set(tags)];
}

function findConnections(nodes: MemoryNode[]): { source: string; target: string; strength: number }[] {
  const links: { source: string; target: string; strength: number }[] = [];
  
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const nodeA = nodes[i];
      const nodeB = nodes[j];
      let strength = 0;
      
      const sharedTags = nodeA.tags?.filter(t => nodeB.tags?.includes(t)) || [];
      strength += sharedTags.length * 0.3;
      
      if (nodeA.date && nodeA.date === nodeB.date) {
        strength += 0.2;
      }
      
      const wordsA = nodeA.title.toLowerCase().split(/\s+/);
      const wordsB = nodeB.title.toLowerCase().split(/\s+/);
      const sharedWords = wordsA.filter(w => w.length > 3 && wordsB.includes(w));
      strength += sharedWords.length * 0.15;
      
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

// Main
async function main() {
  const memoryDir = process.argv[2] || '/Users/openclaw/clawd-agents/pippin';
  const outputPath = path.join(process.cwd(), 'public', 'memories.json');
  
  console.log(`📂 Reading memories from: ${memoryDir}`);
  
  const files: { path: string; content: string }[] = [];
  
  // Read MEMORY.md
  const memoryMdPath = path.join(memoryDir, 'MEMORY.md');
  if (fs.existsSync(memoryMdPath)) {
    files.push({
      path: 'MEMORY.md',
      content: fs.readFileSync(memoryMdPath, 'utf-8'),
    });
    console.log('  ✓ MEMORY.md');
  }
  
  // Read memory/*.md
  const memorySubdir = path.join(memoryDir, 'memory');
  if (fs.existsSync(memorySubdir)) {
    const mdFiles = fs.readdirSync(memorySubdir).filter(f => f.endsWith('.md'));
    for (const file of mdFiles) {
      const filePath = path.join(memorySubdir, file);
      files.push({
        path: `memory/${file}`,
        content: fs.readFileSync(filePath, 'utf-8'),
      });
      console.log(`  ✓ memory/${file}`);
    }
  }
  
  // Parse all files
  const allNodes: MemoryNode[] = [];
  for (const file of files) {
    const nodes = parseMemoryFile(file.content, file.path);
    allNodes.push(...nodes);
  }
  
  console.log(`\n🧠 Found ${allNodes.length} memory nodes`);
  
  // Find connections
  const links = findConnections(allNodes);
  console.log(`🔗 Found ${links.length} connections`);
  
  // Write output
  const output = {
    nodes: allNodes,
    links,
    lastUpdated: new Date().toISOString(),
    source: memoryDir,
  };
  
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  
  console.log(`\n✅ Written to: ${outputPath}`);
}

main().catch(console.error);
