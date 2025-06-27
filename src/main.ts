import './style.css';

const grid = document.getElementById('grid')!;
const colorPicker = document.getElementById('color-picker')!;
const exportBtn = document.getElementById('export-btn')!;
const gridSizeSlider = document.getElementById('grid-size') as HTMLInputElement;
const gridSizeValue1 = document.getElementById('grid-size-value')!;
const gridSizeValue2 = document.getElementById('grid-size-value-2')!;

let isDrawing = false;
let currentColor = '#A9A9A9'; 
let gridSize = parseInt(gridSizeSlider.value);

const colors = [
  { name: 'Light Gray', color: '#A9A9A9' },
  { name: 'Dark Gray', color: '#505050' },
  { name: 'Blue', color: '#007BFF' },
  { name: 'Green', color: '#28A745' },
];

function createColorPicker() {
  colorPicker.innerHTML = '';
  colors.forEach(({ name, color }, index) => {
    const btn = document.createElement('div');
    btn.classList.add('color-btn');
    btn.style.backgroundColor = color;
    if (index === 0) btn.classList.add('selected');

    btn.title = name;

    btn.addEventListener('click', () => {
      currentColor = color;
      document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });

    colorPicker.appendChild(btn);
  });
}

function createGrid(size: number) {
  grid.innerHTML = ''; // clear old grid
  grid.style.gridTemplateColumns = `repeat(${size}, 20px)`;
  grid.style.gridTemplateRows = `repeat(${size}, 20px)`;

  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');

    cell.addEventListener('mousedown', () => {
      isDrawing = true;
      cell.style.backgroundColor = currentColor;
    });

    cell.addEventListener('mouseover', () => {
      if (isDrawing) {
        cell.style.backgroundColor = currentColor;
      }
    });

    cell.addEventListener('mouseup', () => {
      isDrawing = false;
    });

    grid.appendChild(cell);
  }
}

function rgbToHex(rgb: string) {
  const result = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(rgb);
  if (!result) return rgb;
  const r = parseInt(result[1]).toString(16).padStart(2, '0');
  const g = parseInt(result[2]).toString(16).padStart(2, '0');
  const b = parseInt(result[3]).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`.toUpperCase();
}

function exportGrid() {
  const cells = Array.from(grid.children) as HTMLElement[];
  const gridColors: string[][] = [];

  for (let row = 0; row < gridSize; row++) {
    const rowColors: string[] = [];
    for (let col = 0; col < gridSize; col++) {
      const cell = cells[row * gridSize + col];
      const color = cell.style.backgroundColor
        ? rgbToHex(cell.style.backgroundColor)
        : '#FFFFFF';
      rowColors.push(color);
    }
    gridColors.push(rowColors);
  }

  const json = JSON.stringify(gridColors);
  console.log('Exported grid JSON:', json);

  // open JSON in new window
  const newWindow = window.open();
  if (newWindow) {
    newWindow.document.write('<pre>' + json + '</pre>');
  }
}

gridSizeSlider.addEventListener('input', () => {
  gridSize = parseInt(gridSizeSlider.value);
  gridSizeValue1.textContent = gridSize.toString();
  gridSizeValue2.textContent = gridSize.toString();
  createGrid(gridSize);
});

exportBtn.addEventListener('click', exportGrid);

document.addEventListener('mouseup', () => {
  isDrawing = false;
});

createColorPicker();
createGrid(gridSize);

