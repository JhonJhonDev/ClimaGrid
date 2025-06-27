import { useState, useCallback, useEffect } from 'react';
import './Builder.css';

const quotes = [
  "One person's 'vibrant industrial sector' is another's 'constant mysterious humming'.",
  "Is it a utopian paradise or just a really well-organized traffic jam? You decide.",
  "Let's build a city so great, even the pigeons will write good reviews.",
  "Remember, a city without a little chaos is just a suburb.",
  "Some cities are like a well-oiled machine. Others... have character."
];

const COLORS = [
  { name: 'l', color: '#d1d5db' },
  { name: 'd', color: '#4b5563' },
  { name: 'b', color: '#3b82f6' },
  { name: 'g', color: '#22c55e' },
];

interface GridCell {
  color: string;
  type: string;
}

const Builder: React.FC = () => {
  const [gridSize, setGridSize] = useState(32);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [grid, setGrid] = useState<GridCell[][]>(() =>
    Array(gridSize).fill(null).map(() =>
      Array(gridSize).fill(null).map(() => ({ color: '#1f2937', type: 'empty' }))
    )
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [longitude, setLongitude] = useState('');
      const [latitude, setLatitude] = useState('');
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  useEffect(() => {
    const newMetrics: Record<string, number> = {
      'Low Density Building': 0,
      'High Density Building': 0,
      'Water': 0,
      'Green Spaces': 0,
      'Empty Land': 0,
    };
    const totalCells = gridSize * gridSize;

    grid.forEach(row => {
      row.forEach(cell => {
        if (cell.type === 'empty') {
          newMetrics['Empty Land']++;
        } else if (newMetrics.hasOwnProperty(cell.type)) {
          newMetrics[cell.type]++;
        }
      });
    });

    for (const key in newMetrics) {
      newMetrics[key] = (newMetrics[key] / totalCells) * 100;
    }

    setMetrics(newMetrics);
  }, [grid, gridSize]);

  const updateGridSize = useCallback((newSize: number) => {
    setGridSize(newSize);
    setGrid(Array(newSize).fill(null).map(() =>
      Array(newSize).fill(null).map(() => ({ color: '#1f2937', type: 'empty' }))
    ));
  }, []);

  const paintCell = useCallback((row: number, col: number) => {
    setGrid(prev => {
      const newGrid = [...prev];
      newGrid[row] = [...newGrid[row]];
      newGrid[row][col] = { color: selectedColor.color, type: selectedColor.name };
      return newGrid;
    });
  }, [selectedColor]);

  const handleMouseDown = (row: number, col: number) => {
    setIsDrawing(true);
    paintCell(row, col);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isDrawing) {
      paintCell(row, col);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const evaluateDesign = async () => {
    setIsEvaluating(true);

    await new Promise(resolve => setTimeout(resolve, 3000));

    const payload = {
      gridSize,
      grid,
      timestamp: new Date().toISOString(),
      evaluation: {
        status: 'complete',
        score: Math.floor(Math.random() * 100) + 1,
        analysis: 'City design evaluated successfully'
      }
    };

    try {
      const response = await fetch('http://localhost:5000/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)  // stringify only once
      });

      if (!response.ok) {
        throw new Error('Failed to send evaluation');
      }

      const result = await response.json();
      console.log('Server responded with:', result);
    } catch (error) {
      console.error('Error sending to backend:', error);
    }
      };

  const clearGrid = () => {
    setGrid(Array(gridSize).fill(null).map(() =>
      Array(gridSize).fill(null).map(() => ({ color: '#1f2937', type: 'empty' }))
    ));
  };

  return (
    <div className="builder-container">
            <header className="builder-header">
        <div className="title-container">
          <h1 className="builder-title">City Builder</h1>
          <p className="builder-quote">{quote}</p>
        </div>
      </header>
      <div className="builder-workspace">
        <div className="grid-container">
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${gridSize}, 1fr)`,
            }}
            onMouseLeave={handleMouseUp}
          >
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="grid-cell"
                  style={{ backgroundColor: cell.color }}
                  onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                  onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                  onMouseUp={handleMouseUp}
                  title={cell.type}
                />
              ))
            )}
          </div>
          <div className="metrics-container">
            {Object.entries(metrics).map(([name, percentage]) => (
              <div key={name} className="metric-item">
                <span className="metric-label">{name}</span>
                <div className="metric-bar-container">
                  <div
                    className="metric-bar"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: COLORS.find(c => c.name === name)?.color || '#888',
                    }}
                  ></div>
                </div>
                <span className="metric-value">{percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
        <aside className="sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">Grid Size</h3>
            <label htmlFor="grid-size" className="label">
              {gridSize} × {gridSize}
            </label>
            <input
              type="range"
              id="grid-size"
              min="8"
              max="64"
              step="4"
              value={gridSize}
              onChange={(e) => updateGridSize(Number(e.target.value))}
              className="slider"
            />
          </div>
          <div className="sidebar-section">
            <h3 className="sidebar-title">Tools</h3>
            <div className="color-picker">
              {COLORS.map((colorOption) => (
                <button
                  key={colorOption.name}
                  className={`color-button ${selectedColor.name === colorOption.name ? 'active' : ''}`}
                  style={{ '--tool-color': colorOption.color }}
                  onClick={() => setSelectedColor(colorOption)}
                  title={colorOption.name}
                >
                  <span className="color-name">{colorOption.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="sidebar-section actions">
            <h3 className="sidebar-title">Actions</h3>
            <button
              onClick={evaluateDesign}
              className="action-button evaluate"
              disabled={isEvaluating}
            >
              {isEvaluating ? <span className="loading-spinner"></span> : 'Evaluate Design'}
            </button>
            <button onClick={clearGrid} className="action-button secondary">
              Clear Grid
            </button>
          </div>
          <div className="sidebar-section">
            <h3 className="sidebar-title">Coordinates</h3>
            <div className="coordinates-group">
              <input
                type="text"
                placeholder="Longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="coordinate-input"
              />
              <input
                type="text"
                placeholder="Latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="coordinate-input"
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Builder;
