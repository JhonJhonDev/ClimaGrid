import numpy as np
import matplotlib.pyplot as plt
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas

def calculate_energy_usage(grid, cool_roofs=None):
    """
    Calculate energy usage for each cell in the grid.
    High density buildings use more energy than low density buildings.
    Water and green spaces consume no energy.
    
    Args:
        grid: 2D array with building types ('l', 'd', 'b', 'g')
        cool_roofs: Optional 2D array of booleans indicating cool-roof retrofits
    
    Returns:
        tuple: (energy_heatmap_rgb, net_energy_stats)
    """
    height = len(grid)
    width = len(grid[0])
    
    # Assume each cell has a default area of 100 m² (for simplicity)
    cell_area = 100

    # Initial energy demand per square meter per year
    initial_energy_demand = {
        'l': 60.0,   # Low-rise housing demand
        'd': 160.0,  # High-rise/commercial demand
        'b': 0.0,    # Water: no energy consumption
        'g': 0.0,    # Green spaces: no energy consumption
        'e': 0.0     # Empty land: no energy consumption
    }

    # Base energy consumption values (kWh per year per cell)
    base_energy_values = {k: v * cell_area / 365.0 for k, v in initial_energy_demand.items()}  # converted to daily kWh
    
    # Create energy usage matrix
    energy_matrix = np.zeros((height, width), dtype=float)
    
    for y in range(height):
        for x in range(width):
            cell_type = grid[y][x]
            energy_matrix[y, x] = base_energy_values.get(cell_type, 0.0)

    # Apply neighborhood effects for high-density areas and green space cooling
    # Scan a two-cell (≈100m) neighborhood around each cell
    for y in range(height):
        for x in range(width):
            # Define neighborhood bounds (2-cell radius)
            ymin = max(y - 2, 0)
            ymax = min(y + 3, height)  # +3 because range is exclusive
            xmin = max(x - 2, 0)
            xmax = min(x + 3, width)
            
            # Count high-density buildings, green spaces, and water in neighborhood
            high_density_neighbors = 0
            green_space_neighbors = 0
            water_neighbors = 0
            total_neighbors = 0
            
            for ny in range(ymin, ymax):
                for nx in range(xmin, xmax):
                    # Skip the center cell itself
                    if nx == x and ny == y:
                        continue
                    total_neighbors += 1
                    if grid[ny][nx] == 'd':
                        high_density_neighbors += 1
                    elif grid[ny][nx] == 'g':  # Green spaces/parks
                        green_space_neighbors += 1
                    elif grid[ny][nx] == 'b':  # Water bodies
                        water_neighbors += 1

            if total_neighbors > 0:
                # Apply 4% surcharge if at least half are high-density
                if high_density_neighbors >= total_neighbors / 2:
                    energy_matrix[y, x] *= 1.04
                
                # Green/water cooling effects with separate thresholds
                green_multiplier = 1.0
                water_multiplier = 1.0
                
                # If g-cells ≥ 20%, multiply kWh by 0.97
                green_space_percentage = green_space_neighbors / total_neighbors
                if green_space_percentage >= 0.20:
                    green_multiplier = 0.97
                
                # If b-cells ≥ 10%, multiply by 0.92
                water_percentage = water_neighbors / total_neighbors
                if water_percentage >= 0.10:
                    water_multiplier = 0.92
                
                # Apply combined effect, but cap total credit at ~0.88
                combined_multiplier = green_multiplier * water_multiplier
                if combined_multiplier < 0.88:
                    combined_multiplier = 0.88
                
                energy_matrix[y, x] *= combined_multiplier
    
    # Apply cool-roof retrofits (15% energy reduction for HVAC)
    if cool_roofs is not None:
        for y in range(height):
            for x in range(width):
                if cool_roofs[y][x] and grid[y][x] in ['l', 'd']:  # Only buildings can have cool roofs
                    energy_matrix[y, x] *= 0.85  # 15% reduction from cool-roof retrofit
    
    # Cap combined green-and-water savings at 12% below baseline to prevent negative loads
    for y in range(height):
        for x in range(width):
            cell_type = grid[y][x]
            if cell_type in ['l', 'd']:  # Only apply to buildings
                baseline_energy = base_energy_values[cell_type]
                min_allowed_energy = baseline_energy * 0.88  # 12% below baseline
                if energy_matrix[y, x] < min_allowed_energy:
                    energy_matrix[y, x] = min_allowed_energy

    # Calculate statistics
    total_energy = np.sum(energy_matrix)
    low_density_energy = np.sum(energy_matrix[np.array([[grid[y][x] == 'l' for x in range(width)] for y in range(height)])])
    high_density_energy = np.sum(energy_matrix[np.array([[grid[y][x] == 'd' for x in range(width)] for y in range(height)])])
    
    # Count building types
    low_density_count = sum(row.count('l') for row in grid)
    high_density_count = sum(row.count('d') for row in grid)
    
    energy_stats = {
        'total_energy_usage': float(total_energy),
        'low_density_energy': float(low_density_energy),
        'high_density_energy': float(high_density_energy),
        'low_density_count': low_density_count,
        'high_density_count': high_density_count,
        'avg_energy_per_low_density': float(low_density_energy / max(low_density_count, 1)),
        'avg_energy_per_high_density': float(high_density_energy / max(high_density_count, 1)),
        'energy_efficiency_ratio': float(low_density_energy / max(high_density_energy, 1))
    }
    
    # Generate energy heatmap visualization
    energy_heatmap_rgb = generate_energy_heatmap(energy_matrix, grid)
    
    return energy_heatmap_rgb, energy_stats

def apply_energy_diffusion(energy_matrix, grid, steps=50, alpha=0.02, beta=0.01):
    """
    Apply energy diffusion to create smooth gradual transitions following heat.py pattern.
    High energy areas diffuse to neighbors, while green spaces and water actively cool nearby areas.
    
    Args:
        energy_matrix: 2D numpy array with initial energy values
        grid: 2D array with building types for boundary conditions
        steps: Number of diffusion iterations
        alpha: Diffusion rate (how much energy spreads to neighbors)
        beta: Decay rate (energy loss to baseline)
    
    Returns:
        numpy array: Smoothed energy distribution
    """
    height, width = energy_matrix.shape
    baseline_energy = np.mean(energy_matrix[energy_matrix > 0]) if np.any(energy_matrix > 0) else 0
    
    # Create working copy
    output = np.copy(energy_matrix)
    
    # Apply diffusion iterations (following heat.py pattern)
    for _ in range(steps):
        new_output = np.copy(output)
        
        for y in range(height):
            for x in range(width):
                center = output[y, x]
                cell_type = grid[y][x]
                neighbors = []
                neighbor_types = []
                
                # Get neighboring cells and their types
                if y > 0: 
                    neighbors.append(output[y - 1, x])
                    neighbor_types.append(grid[y - 1][x])
                if y < height - 1: 
                    neighbors.append(output[y + 1, x])
                    neighbor_types.append(grid[y + 1][x])
                if x > 0: 
                    neighbors.append(output[y, x - 1])
                    neighbor_types.append(grid[y][x - 1])
                if x < width - 1: 
                    neighbors.append(output[y, x + 1])
                    neighbor_types.append(grid[y][x + 1])
                
                if neighbors:
                    # Calculate Laplacian (diffusion term)
                    laplacian = sum(neighbors) - len(neighbors) * center
                    
                    # Apply diffusion equation (same as heat.py)
                    new_output[y, x] = center + alpha * laplacian - beta * (center - baseline_energy)
                    
                    # Green spaces and water have strong cooling effect on neighbors
                    if cell_type == 'g':  # Green space - cooling source
                        new_output[y, x] = -baseline_energy * 0.3  # Strong cooling effect
                    elif cell_type == 'b':  # Water - even stronger cooling
                        new_output[y, x] = -baseline_energy * 0.5  # Very strong cooling effect
                    elif cell_type in ['l', 'd']:  # Buildings get cooled by nearby green/water
                        green_neighbors = neighbor_types.count('g')
                        water_neighbors = neighbor_types.count('b')
                        total_neighbors = len(neighbor_types)
                        
                        if total_neighbors > 0:
                            # Additional cooling from nearby green spaces and water
                            green_cooling = (green_neighbors / total_neighbors) * 0.15 * baseline_energy
                            water_cooling = (water_neighbors / total_neighbors) * 0.25 * baseline_energy
                            
                            new_output[y, x] -= (green_cooling + water_cooling)
                    
                    # Ensure reasonable bounds
                    if cell_type in ['l', 'd'] and new_output[y, x] < 0:
                        new_output[y, x] = baseline_energy * 0.1  # Minimum energy for buildings
        
        output = new_output
    
    return output

def generate_energy_heatmap(energy_matrix, grid=None):
    """
    Generate RGB heatmap visualization for energy usage with smooth diffusion.
    Uses viridis/magma-like perceptual color mapping with Gaussian-like smoothing.
    
    Args:
        energy_matrix: 2D numpy array with energy values
        grid: Optional 2D array with cell types for special coloring
    
    Returns:
        list: RGB pixel values for heatmap
    """
    height, width = energy_matrix.shape
    
    # Apply smooth diffusion to energy matrix (following heat.py approach)
    if grid is not None:
        smoothed_energy = apply_energy_diffusion(energy_matrix, grid)
    else:
        smoothed_energy = energy_matrix
    
    # Normalize for visualization (0-255 range, following heat.py pattern)
    max_energy = smoothed_energy.max()
    min_energy = smoothed_energy.min()
    
    if max_energy > min_energy:
        # Normalize and scale to 0-255 (similar to heat.py)
        normalized_energy = ((smoothed_energy - min_energy) / (max_energy - min_energy)) * 255
    else:
        normalized_energy = np.full_like(smoothed_energy, 127)  # Mid-range if all same
    
    # Create matplotlib figure for smooth perceptual heatmap
    fig = plt.figure(figsize=(width / 100, height / 100), dpi=100)
    ax = fig.add_axes([0, 0, 1, 1])
    
    # Use magma colormap for smooth perceptual energy visualization
    # darkest = 0 kWh (parks, lakes), brightest = max(cell_kWh)
    im = ax.imshow(normalized_energy, cmap='magma', interpolation='nearest', vmin=0, vmax=255)
    ax.axis('off')
    
    # Convert to RGB pixels (following heat.py pattern)
    canvas = FigureCanvas(fig)
    canvas.draw()
    
    # Extract RGB data
    image_array = np.frombuffer(canvas.tostring_argb(), dtype=np.uint8)
    image_array = image_array.reshape((height, width, 4))
    
    # Convert ARGB to RGB and ensure JSON serializable
    rgb_pixels = [[[int(pixel[1]), int(pixel[2]), int(pixel[3])] for pixel in row] for row in image_array]
    
    plt.close(fig)
    return rgb_pixels

def simulate_energy_distribution(grid, steps=50):
    """
    Simulate energy distribution across the grid considering neighboring effects.
    High energy areas influence nearby areas through infrastructure load.
    
    Args:
        grid: 2D array with building types
        steps: Number of simulation steps
    
    Returns:
        tuple: (distributed_energy_heatmap, distribution_stats)
    """
    height = len(grid)
    width = len(grid[0])
    
    # Base energy values
    energy_values = {
        'l': 15.0,
        'd': 45.0,
        'b': 0.0,
        'g': 0.0,
        'e': 0.0
    }
    
    # Initialize energy distribution matrix
    energy_dist = np.zeros((height, width), dtype=float)
    
    for y in range(height):
        for x in range(width):
            cell_type = grid[y][x]
            energy_dist[y, x] = energy_values.get(cell_type, 0.0)
    
    # Simulate energy distribution over time
    alpha = 0.05  # Distribution rate
    
    for _ in range(steps):
        new_energy_dist = np.copy(energy_dist)
        
        for y in range(height):
            for x in range(width):
                center = energy_dist[y, x]
                neighbors = []
                
                # Get neighboring cells
                if y > 0: neighbors.append(energy_dist[y - 1, x])
                if y < height - 1: neighbors.append(energy_dist[y + 1, x])
                if x > 0: neighbors.append(energy_dist[y, x - 1])
                if x < width - 1: neighbors.append(energy_dist[y, x + 1])
                
                if neighbors:
                    # Energy spreads to neighbors (infrastructure load effect)
                    avg_neighbor = sum(neighbors) / len(neighbors)
                    new_energy_dist[y, x] = center + alpha * (avg_neighbor - center) * 0.1
        
        energy_dist = new_energy_dist
    
    # Generate heatmap for distributed energy
    distributed_heatmap = generate_energy_heatmap(energy_dist)
    
    # Calculate distribution statistics
    distribution_stats = {
        'max_energy_load': float(energy_dist.max()),
        'avg_energy_load': float(energy_dist.mean()),
        'energy_variance': float(energy_dist.var()),
        'grid_efficiency': float(1.0 / (energy_dist.var() + 1.0))  # Lower variance = better efficiency
    }
    
    return distributed_heatmap, distribution_stats

# Test function
if __name__ == "__main__":
    # Test with sample grid
    test_grid = [
        ['d','d','l','l','g'],
        ['d','d','l','g','g'],
        ['l','l','b','b','g'],
        ['l','g','b','b','l'],
        ['g','g','g','l','l']
    ]
    
    heatmap, stats = calculate_energy_usage(test_grid)
    print("Energy Statistics:")
    for key, value in stats.items():
        print(f"  {key}: {value}")
