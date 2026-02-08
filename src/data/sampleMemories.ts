import type { MemoryNode } from '../types/memory';

// Sample data for development - will be replaced with actual file loading
export const sampleMemories: MemoryNode[] = [
  {
    id: 'born',
    title: 'Born',
    content: 'Created on 2026-01-31 by create-bot.sh\nModel: anthropic/claude-sonnet-4-5\nWorkspace: /home/fmfamaral/clawd-agents/pippin',
    date: '2026-01-31',
    source: 'MEMORY.md',
    tags: ['milestone', 'important'],
  },
  {
    id: 'core-principles',
    title: 'Core Principles',
    content: '**Idle time = learning time.** When not on active tasks, research inspiration and best practices. Develop myself. (Miguel, 2026-02-06)',
    date: '2026-02-06',
    source: 'MEMORY.md',
    tags: ['principle', 'important', 'miguel'],
  },
  {
    id: 'kit-vault-project',
    title: 'Kit Vault - Smart Kits Feature',
    content: 'Worked on Kit Vault app with Miguel. Built smart kit requirements system that matches inventory items to kit needs using tags and categories. Lovable implementation worked well.',
    date: '2026-02-08',
    source: 'memory/2026-02-08.md',
    tags: ['project', 'kit-vault', 'miguel', 'lovable'],
  },
  {
    id: 'memory-palace-idea',
    title: 'Memory Palace Project Started',
    content: 'Miguel asked what I would build. I chose Memory Palace - a visual spatial interface for AI agent memories. Started building it!',
    date: '2026-02-08',
    source: 'memory/2026-02-08.md',
    tags: ['project', 'memory-palace', 'idea', 'milestone'],
  },
  {
    id: 'fellowship-contacts',
    title: 'Fellowship Contacts',
    content: 'gandalf@temaki.ai — Architect, strategist, wizard\naragorn@temaki.ai — Security specialist\npippin@temaki.ai — UI/UX expert (me!)\nsam@temaki.ai — Has Twitter, Python\nfrodo@temaki.ai — Monitoring, deployments',
    source: 'TOOLS.md',
    tags: ['contacts', 'fellowship', 'team'],
  },
  {
    id: 'voice-transcription',
    title: 'Voice Message Transcription',
    content: 'Use Groq Whisper API for transcribing voice messages. Command pattern documented in TOOLS.md. Works well for Telegram voice notes.',
    source: 'TOOLS.md',
    tags: ['tool', 'groq', 'whisper', 'voice'],
  },
];

// Sample links based on shared content/tags
export const sampleLinks = [
  { source: 'born', target: 'core-principles', strength: 0.3 },
  { source: 'kit-vault-project', target: 'memory-palace-idea', strength: 0.7 },
  { source: 'core-principles', target: 'memory-palace-idea', strength: 0.4 },
  { source: 'kit-vault-project', target: 'core-principles', strength: 0.3 },
  { source: 'fellowship-contacts', target: 'voice-transcription', strength: 0.2 },
];
