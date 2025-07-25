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

type TooltipContent = {
  row: number;
  col: number;
  position: string;
  type: string;
  value: string;
  color: string;
  baseValue?: string;
  yearlyValue?: string;
  demandPerM2?: string;
  neighborInfo?: string;
  hasSurcharge?: boolean;
};

export default function ResultsPage() {
  const { state } = useLocation();
  const heatmap = state?.heatmap;
  const heatstats = state?.heat_stats;
  const energy_heatmap = state?.energy_heatmap;
  const energy_stats = state?.energy_stats;
  const pollution_heatmap = state?.pollution_heatmap;
  const pollution_stats = state?.pollution_stats;
  const heattemps = state?.heattemps;
  const gridSize = heatmap?.length || 32;

  // Tooltip state
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: TooltipContent | null;
    type: 'original' | 'temperature' | 'energy' | 'pollution';
  }>({ visible: false, x: 0, y: 0, content: null, type: 'original' });

  const orgmap = state?.orgmap;
  const difmap = state?.diffusionresult;

  const [grid, setGrid] = useState<GridCell[][]>(() =>
    Array(gridSize).fill(null).map(() =>
      Array(gridSize).fill(null).map(() => ({ color: '#1f2937', type: 'empty' }))
     )
  );

  const [difGrid, setDifGrid] = useState<GridCell[][]>(() =>
    Array(128).fill(null).map(() =>
      Array(128).fill(null).map(() => ({ color: '#1f2937', type: 'empty' }))
     )
  );

  const [orgGrid, setOrgGrid] = useState<GridCell[][]>(() =>
    Array(gridSize).fill(null).map(() =>
    Array(gridSize).fill(null).map(() => ({ color: '#1f2937', type: 'empty' }))
    )
  );

  const [energyGrid, setEnergyGrid] = useState<GridCell[][]>(() =>
    Array(gridSize).fill(null).map(() =>
    Array(gridSize).fill(null).map(() => ({ color: '#1f2937', type: 'empty' }))
    )
  );

  const [pollutionGrid, setPollutionGrid] = useState<GridCell[][]>(() =>
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
    if (pollution_heatmap) {
      const newPollutionGrid = pollution_heatmap.map((row: number[][]) =>
        row.map((rgb: number[]) => {
          const hex = `#${rgb.map(v => v.toString(16).padStart(2, '0')).join('')}`;
          return {
            color: hex,
            type: 'pollution'
          };
        })
      );
      setPollutionGrid(newPollutionGrid);
    }

    if (energy_heatmap) {
      const newEnergyGrid = energy_heatmap.map((row: number[][]) =>
        row.map((rgb: number[]) => {
          const hex = `#${rgb.map(v => v.toString(16).padStart(2, '0')).join('')}`;
          return {
            color: hex,
            type: 'energy'
          };
        })
      );
      setEnergyGrid(newEnergyGrid);
    }
    if (difmap) {
      const newDifGrid = difmap.map((row: number[][]) =>
        row.map((rgb: number[]) => {
          const hex = `#${rgb.map(v => v.toString(16).padStart(2, '0')).join('')}`;
          return {
            color: hex,
            type: 'dif'
          };
        })
      );
      setDifGrid(newDifGrid);
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
  }, [heatmap, energy_heatmap, orgmap, pollution_heatmap, difmap]);

  // Tooltip handlers
  const handleCellHover = (event: React.MouseEvent, cellIndex: number, mapType: 'original' | 'temperature' | 'energy' | 'pollution') => {
    const rect = event.currentTarget.getBoundingClientRect();
    const row = Math.floor(cellIndex / gridSize);
    const col = cellIndex % gridSize;

    let content: TooltipContent = {
      row,
      col,
      position: `(${row}, ${col})`,
      type: '',
      value: '',
      color: ''
    };

    if (mapType === 'original' && orgGrid[row] && orgGrid[row][col]) {
      const cell = orgGrid[row][col];
      const typeNames: Record<string, string> = {
        'l': 'Low Density Building',
        'd': 'High Density Building', 
        'b': 'Water',
        'g': 'Green Space',
        'empty': 'Empty Land'
      };
      content.type = typeNames[cell.type] || 'Unknown';
      content.color = cell.color;
    } else if (mapType === 'temperature' && grid[row] && grid[row][col]) {
      const cell = grid[row][col];
      content.type = 'Temperature';
      content.color = cell.color;
      if (heattemps) {
        // Assuming heattemps = [maxTemp, minTemp]
        const normalizedTemp = heatstats[row][col];
        content.value = `${normalizedTemp.toFixed(1)}°C`;
      }
    } else if (mapType === 'energy' && energyGrid[row] && energyGrid[row][col]) {
      const cell = energyGrid[row][col];
      content.type = 'Energy Usage';
      content.color = cell.color;

      if (orgGrid[row] && orgGrid[row][col]) {
        const originalType = orgGrid[row][col].type;
        const cellArea = 100;
        const energyDemandPerM2PerYear: Record<string, number> = {
          'l': 60.0,   // Low-rise housing
          'd': 160.0,  // High-rise/commercial
          'b': 0.0,    // Water
          'g': 0.0,    // Green spaces
          'empty': 0.0 // Empty land
        };

        let baseEnergyPerDay = (energyDemandPerM2PerYear[originalType] || 0) * cellArea / 365.0;

        let highDensityNeighbors = 0;
        let totalNeighbors = 0;

        for (let ny = Math.max(row - 2, 0); ny < Math.min(row + 3, gridSize); ny++) {
          for (let nx = Math.max(col - 2, 0); nx < Math.min(col + 3, gridSize); nx++) {
            if (nx === col && ny === row) continue; // Skip center cell
            totalNeighbors++;
            if (orgGrid[ny] && orgGrid[ny][nx] && orgGrid[ny][nx].type === 'd') {
              highDensityNeighbors++;
            }
          }
        }

        let actualEnergyPerDay = baseEnergyPerDay;
        let hasSurcharge = false;
        if (totalNeighbors > 0 && highDensityNeighbors >= totalNeighbors / 2) {
          actualEnergyPerDay = baseEnergyPerDay * 1.04;
          hasSurcharge = true;
        }

        content.value = `${actualEnergyPerDay.toFixed(1)} kWh/day${hasSurcharge ? ' (+4%)' : ''}`;
        content.baseValue = `${baseEnergyPerDay.toFixed(1)} kWh/day base`;
        content.yearlyValue = `${(actualEnergyPerDay * 365).toFixed(0)} kWh/year`;
        content.demandPerM2 = `${energyDemandPerM2PerYear[originalType] || 0} kWh·m⁻²·yr⁻¹`;
        content.neighborInfo = `${highDensityNeighbors}/${totalNeighbors} high-density neighbors`;
        content.hasSurcharge = hasSurcharge;
      }
    } else if (mapType === 'pollution' && pollutionGrid[row] && pollutionGrid[row][col]) {
      const cell = pollutionGrid[row][col];
      content.type = 'Pollution';
      content.color = cell.color;
      if (pollution_stats) {
        content.value = `${pollution_stats[row][col].toFixed(1)}kg`;
      }
    }

    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      content,
      type: mapType
    });
  };

  const handleCellLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center', padding: '2rem', position: 'relative' }}>
      
      {/* Energy Statistics Dashboard */}
      {energy_stats && (
        <div style={{ 
          backgroundColor: '#1a1a1a', 
          padding: '1.5rem', 
          borderRadius: '10px', 
          width: '100%', 
          maxWidth: '800px',
          border: '1px solid #333'
        }}>
          <h2 style={{ color: '#ffd700', marginBottom: '1rem', textAlign: 'center' }}>Energy Usage Analysis</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem' 
          }}>
            <div style={{ backgroundColor: '#2a2a2a', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6b6b', margin: '0 0 0.5rem 0' }}>Total Energy Usage</h4>
              <p style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>{energy_stats.total_energy_usage.toFixed(1)} kWh/day</p>
            </div>
            <div style={{ backgroundColor: '#2a2a2a', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#4ecdc4', margin: '0 0 0.5rem 0' }}>Low Density Energy</h4>
              <p style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>{energy_stats.low_density_energy.toFixed(1)} kWh/day</p>
              <p style={{ color: '#aaa', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>({energy_stats.low_density_count} buildings)</p>
            </div>
            <div style={{ backgroundColor: '#2a2a2a', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ffa726', margin: '0 0 0.5rem 0' }}>High Density Energy</h4>
              <p style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>{energy_stats.high_density_energy.toFixed(1)} kWh/day</p>
              <p style={{ color: '#aaa', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>({energy_stats.high_density_count} buildings)</p>
            </div>
            <div style={{ backgroundColor: '#2a2a2a', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ab47bc', margin: '0 0 0.5rem 0' }}>Efficiency Ratio</h4>
              <p style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>{energy_stats.energy_efficiency_ratio.toFixed(2)}</p>
              <p style={{ color: '#aaa', fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>Low/High density ratio</p>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'row', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div>
          <h2 style={{ color: '#ccc', textAlign: 'center' }}>Original Map</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              aspectRatio: '1 / 1',
              width: '100%',
              maxWidth: '400px',
              gap: '0px',
              border: '2px solid #333',
              borderRadius: '8px'
            }}
          >
            {orgGrid.flat().map((cell, idx) => (
              <div
                key={idx}
                style={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  backgroundColor: cell.color,
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => handleCellHover(e, idx, 'original')}
                onMouseLeave={handleCellLeave}
              />
            ))}
          </div>
        </div>
        
        <div>
          <h2 style={{ color: '#ccc', textAlign: 'center' }}>Temperature Heatmap</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              aspectRatio: '1 / 1',
              width: '100%',
              maxWidth: '400px',
              gap: '0px',
              border: '2px solid #333',
              borderRadius: '8px'
            }}
          >
            {grid.flat().map((cell, idx) => (
              <div
                key={idx}
                style={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  backgroundColor: cell.color,
                  boxSizing: 'border-box',
                  cursor: 'pointer'
              }}
                onMouseEnter={(e) => handleCellHover(e, idx, 'temperature')}
                onMouseLeave={handleCellLeave}
            />
            ))}
          </div>
        </div>
        <div>
          <h2 style={{ color: '#ccc', textAlign: 'center' }}>Pollution Heatmap</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              aspectRatio: '1 / 1',
              width: '100%',
              maxWidth: '400px',
              gap: '0px',
              border: '2px solid #333',
              borderRadius: '8px'
            }}
          >
            {pollutionGrid.flat().map((cell, idx) => (
              <div
                key={idx}
                style={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  backgroundColor: cell.color,
                  boxSizing: 'border-box',
                  cursor: 'pointer'
              }}
                onMouseEnter={(e) => handleCellHover(e, idx, 'pollution')}
                onMouseLeave={handleCellLeave}
            />
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ color: '#ccc', textAlign: 'center' }}>Your projected aerial view</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${128}, 1fr)`,
              aspectRatio: '1 / 1',
              width: '100%',
              maxWidth: '400px',
              gap: '0px',
              border: '2px solid #333',
              borderRadius: '8px'
            }}
          >
            {difGrid.flat().map((cell, idx) => (
              <div
                key={idx}
                style={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  backgroundColor: cell.color,
                  boxSizing: 'border-box',
                  cursor: 'pointer'
              }}
              />
            ))}
          </div>
        </div>
        
        {energy_heatmap && (
          <div>
            <h2 style={{ color: '#ffd700', textAlign: 'center' }}>Energy Usage Heatmap</h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                aspectRatio: '1 / 1',
                width: '100%',
                maxWidth: '400px',
                gap: '0px',
                border: '2px solid #ffd700',
                borderRadius: '8px'
              }}
            >
              {energyGrid.flat().map((cell, idx) => (
                <div
                  key={idx}
                  style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    backgroundColor: cell.color,
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => handleCellHover(e, idx, 'energy')}
                  onMouseLeave={handleCellLeave}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {tooltip.visible && tooltip.content && (
        <div
          style={{
            position: 'fixed',
            top: tooltip.y,
            left: tooltip.x,
            backgroundColor: '#222',
            color: '#fff',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            pointerEvents: 'none',
            transform: 'translate(-50%, -100%)',
            whiteSpace: 'nowrap',
            boxShadow: '0 0 10px rgba(0,0,0,0.7)',
            maxWidth: '300px',
            fontSize: '0.85rem',
            zIndex: 9999,
            userSelect: 'none'
          }}
        >
          <div><strong>Position:</strong> {tooltip.content.position}</div>
          <div><strong>Type:</strong> {tooltip.content.type}</div>
          {tooltip.content.value && <div><strong>Value:</strong> {tooltip.content.value}</div>}
          {tooltip.content.baseValue && <div><strong>Base Value:</strong> {tooltip.content.baseValue}</div>}
          {tooltip.content.yearlyValue && <div><strong>Yearly Value:</strong> {tooltip.content.yearlyValue}</div>}
          {tooltip.content.demandPerM2 && <div><strong>Demand:</strong> {tooltip.content.demandPerM2}</div>}
          {tooltip.content.neighborInfo && <div><strong>Neighbors:</strong> {tooltip.content.neighborInfo}</div>}
          {tooltip.content.hasSurcharge && <div style={{ color: '#ff6b6b' }}>+4% surcharge applied</div>}
        </div>
      )}
    </div>
  );
}

