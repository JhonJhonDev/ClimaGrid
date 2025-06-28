import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

type GridCell = {
  color: string;
  type: string;
};

const COLORS = [
  { name: 'l', color: '#d1d5db' },
  { name: 'd', color: '#4b5563' },
  { name: 'b', color: '#3b82f6' },
  { name: 'g', color: '#22c55e' },
];

const colorFromType = (type: string) => {
  const match = COLORS.find(c => c.name === type);
  return match ? match.color : '#1f2937'; 
};

export default function ResultsPage() {
  const { state } = useLocation();
  const heatmap = state?.heatmap;
  const gridSize = heatmap?.length || 32;
  const cellSize = 20; 

  const orgmap = state?.orgmap;
  const [grid, setGrid] = useState<GridCell[][]>(() =>
    Array(gridSize).fill(null).map(() =>
      Array(gridSize).fill(null).map(() => ({ color: '#1f2937', type: 'empty' }))
     )
  );

  const [orgGrid, setOrgGrid] = useState<GridCell[][]>(() =>
    Array(gridSize).fill(null).map(() =>
    Array(gridSize).fill(null).map(() => ({ color: '#1f2937', type: 'empty' }))
    )
  );

  useEffect(() => {
    if (heatmap) {
      const newGrid = heatmap.map((row: number[][]) =>
        row.map((rgb: number[]) => {
          const hex = `#${rgb.map(v => v.toString(16).padStart(2, '0')).join('')}`;
          return {
            color: hex,
            type: 'heat'
          };
        })
      );
      setGrid(newGrid);
    }

    if (orgmap) {
      const newOrgGrid = orgmap.map((row: string[]) =>
        row.map((char: string) => ({
          color: colorFromType(char),
          type: char
        }))
      );
      setOrgGrid(newOrgGrid);
    }
  }, [heatmap, orgmap]);

  return (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>

    <div>
      <h2 style={{ color: '#ccc' }}>Original Map</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          aspectRatio: '1 / 1',
          width: '100%',
          maxWidth: '90vmin',
          gap: '0px'
        }}
      >
        {orgGrid.flat().map((cell, idx) => (
          <div
            key={idx}
            style={{
              width: '100%',
              aspectRatio: '1 / 1',
              backgroundColor: cell.color,
              boxSizing: 'border-box'
            }}
          />
        ))}
      </div>
    </div>
    <div>
      <h2 style={{ color: '#ccc' }}>Heatmap</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          aspectRatio: '1 / 1',
          width: '100%',
          maxWidth: '90vmin',
          gap: '0px'
        }}
      >
        {grid.flat().map((cell, idx) => (
          <div
            key={idx}
            style={{
              width: '100%',
              aspectRatio: '1 / 1',
              backgroundColor: cell.color,
              boxSizing: 'border-box'
          }}
        />
      ))}
    </div>
    </div>
  </div>
  );
}

