import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './Builder.css';

type GridCell = {
  color: string;
  type: string;
};

export default function ResultsPage() {
  const { state } = useLocation();
  const heatmap = state?.heatmap;
  const gridSize = heatmap?.length || 32;

  const [grid, setGrid] = useState<GridCell[][]>(() =>
    Array(gridSize).fill(null).map(() =>
      Array(gridSize).fill(null).map(() => ({ color: '#1f2937', type: 'empty' }))
    )
  );

  useEffect(() => {
    if (!heatmap) return;
    const newGrid = heatmap.map((row: number[][], i: number) =>
      row.map((rgb: number[], j: number) => {
        const hex = `#${rgb.map(v => v.toString(16).padStart(2, '0')).join('')}`;
        return {
          color: hex,
          type: 'heat' 
        };
      })
    );
    setGrid(newGrid);
  }, [heatmap]);

  return (
    <div>
      <h1>Results Page</h1>
      <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: `repeat(${gridSize}, 20px)` }}>
        {grid.flat().map((cell, idx) => (
          <div
            key={idx}
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: cell.color,
              border: '1px solid #444'
            }}
          />
        ))}
      </div>
    </div>
  );
}

