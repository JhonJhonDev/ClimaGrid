import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

const typeconverter: Record<string, string> = {
  'Low Density Building': 'l',
  'High Density Building': 'd',
  'Water': 'b',
  'Green Spaces': 'g',
  'Empty Land': 'e',
};

const CODE_TO_TYPE: Record<string, string> = {
  l: 'Low Density Building',
  d: 'High Density Building',
  b: 'Water',
  g: 'Green Spaces',
  e: 'Empty Land',
};

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
  const [year, setyear] = useState('');
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [quote, setQuote] = useState('');
  const navigate = useNavigate();

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
            const fullType = CODE_TO_TYPE[cell.type] || 'Empty Land';
            newMetrics[fullType]++;
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
    const lon = parseFloat(longitude);
    const lat = parseFloat(latitude);
    const yr = parseInt(year, 10);

    if (isNaN(lon) || lon < -180 || lon > 180) {
      alert('Please enter a valid longitude between -180 and 180');
      setIsEvaluating(false);
      return;
    }

    if (isNaN(lat) || lat < -90 || lat > 90) {
      alert('Please enter a valid latitude between -90 and 90');
      setIsEvaluating(false);
      return;
    }

    if (isNaN(yr) || yr < 2016 || yr > 2100) {
        alert('Please enter a valid year.');
        setIsEvaluating(false);
        return;
    }
    const payload = {
      gridSize,
      grid,
      yr,
      longitude,
      latitude,
      timestamp: new Date().toISOString(),
      evaluation: {
        status: 'complete',
        score: Math.floor(Math.random() * 100) + 1,
        analysis: 'City design evaluated successfully'
      }
    };

    try {
      const response = await fetch('https://34.21.29.39/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)  // stringify only once
      });

      if (!response.ok) {
        setIsEvaluating(false);
        throw new Error('Failed to send evaluation');
      }

      const result = await response.json();
      console.log('Server responded with:', result);
      setIsEvaluating(false);
      navigate('/results', { state: result }); 
    } catch (error) {
      console.error('Error sending to backend:', error);
      setIsEvaluating(false);
    }
    return;
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
                        backgroundColor: COLORS.find(c => c.name === typeconverter[name])?.color || '#888',
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
                  style={{ '--tool-color': colorOption.color } as React.CSSProperties & Record<string, string>}
                  onClick={() => setSelectedColor(colorOption)}
                  title={colorOption.name}
                >
                  <span className="color-name">{colorOption.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="sidebar-section">
            <h3 className="sidebar-title">Information</h3>
            <div className="coordinates-group">
              <input
                type="text"
                placeholder="Longitude: -180 to 180"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="coordinate-input"
              />
              <input
                type="text"
                placeholder="Latitude: -90 to 90"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="coordinate-input"
              />
              <input
                type="text"
                placeholder="Year: 2016 to 2100"
                value={year}
                onChange={(e) => setyear(e.target.value)}
                className="coordinate-input"
              />
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
        </aside>
      </div>
    </div>
  );
}

export default Builder;
