import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { MemoryNode } from '../types/memory';

interface MemoryGraphProps {
  nodes: MemoryNode[];
  links: { source: string; target: string; strength: number }[];
  onNodeClick: (node: MemoryNode) => void;
  selectedNodeId?: string;
}

export function MemoryGraph({ nodes, links, onNodeClick, selectedNodeId }: MemoryGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current?.parentElement) {
        setDimensions({
          width: svgRef.current.parentElement.clientWidth,
          height: svgRef.current.parentElement.clientHeight,
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;

    // Color scale based on date (newer = warmer colors)
    const dates = nodes.map(n => n.date).filter(Boolean).sort();
    const colorScale = d3.scaleOrdinal<string>()
      .domain(dates as string[])
      .range(d3.schemeSpectral[Math.min(dates.length, 11)] || d3.schemeCategory10);

    // Create simulation
    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(links)
        .id((d: any) => d.id)
        .distance(100)
        .strength((d: any) => d.strength * 0.5))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    // Create container with zoom
    const g = svg.append('g');
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    
    svg.call(zoom);

    // Draw links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#4a5568')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', (d) => Math.max(1, d.strength * 3));

    // Draw nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, MemoryNode>()
        .on('start', (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    // Node circles
    node.append('circle')
      .attr('r', (d) => 8 + (d.content.length / 500))
      .attr('fill', (d) => d.date ? colorScale(d.date) : '#718096')
      .attr('stroke', (d) => d.id === selectedNodeId ? '#f6e05e' : '#2d3748')
      .attr('stroke-width', (d) => d.id === selectedNodeId ? 3 : 1.5)
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeClick(d);
      });

    // Node labels
    node.append('text')
      .text((d) => d.title.slice(0, 20) + (d.title.length > 20 ? '...' : ''))
      .attr('x', 12)
      .attr('y', 4)
      .attr('font-size', '11px')
      .attr('fill', '#e2e8f0')
      .attr('pointer-events', 'none');

    // Tooltip
    node.append('title')
      .text((d) => `${d.title}\n${d.date || 'No date'}\n${d.tags?.join(', ') || 'No tags'}`);

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, dimensions, selectedNodeId, onNodeClick]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      style={{ background: '#1a202c' }}
    />
  );
}
