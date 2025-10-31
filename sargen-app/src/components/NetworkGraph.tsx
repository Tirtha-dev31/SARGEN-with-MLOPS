import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';

interface NetworkGraphProps {
  caseId: string;
}

export default function NetworkGraph({ caseId }: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Fetch network data
    fetch(`http://localhost:8001/api/network/${caseId}`)
      .then(res => res.json())
      .then(data => {
        if (!containerRef.current) return;

        // Create cytoscape elements
        const elements = [
          ...data.nodes.map((node: any) => ({
            data: { id: node.id, label: node.label }
          })),
          ...data.edges.map((edge: any, idx: number) => ({
            data: {
              id: `edge-${idx}`,
              source: edge.from,
              target: edge.to,
              label: `$${edge.amount.toLocaleString()}`
            }
          }))
        ];

        // Initialize cytoscape
        cyRef.current = cytoscape({
          container: containerRef.current,
          elements,
          style: [
            {
              selector: 'node',
              style: {
                'background-color': '#3b82f6',
                'label': 'data(label)',
                'color': '#fff',
                'text-valign': 'center',
                'text-halign': 'center',
                'font-size': '10px',
                'width': '40px',
                'height': '40px'
              }
            },
            {
              selector: 'edge',
              style: {
                'width': 2,
                'line-color': '#60a5fa',
                'target-arrow-color': '#60a5fa',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier',
                'label': 'data(label)',
                'font-size': '8px',
                'color': '#a0aec0',
                'text-rotation': 'autorotate'
              }
            }
          ],
          layout: {
            name: 'circle'
          }
        });
      })
      .catch(err => console.error('Error loading network data:', err));

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [caseId]);

  return (
    <div ref={containerRef} className="w-full h-96 bg-dark-bg rounded-lg" />
  );
}
