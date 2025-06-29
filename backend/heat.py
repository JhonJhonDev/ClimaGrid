import numpy as np
import matplotlib.pyplot as plt
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas

test = [
   ['d','d','d','d','d','g','g','b','d','d'],
   ['d','d','d','d','d','g','g','b','d','d'],
    ['d','d','d','d','d','g','b','b','b','b'],
    ['d','d','d','d','d','b','b','b','b','b'],
    ['d','d','g','g','d','b','b','b','b','l'],
   ['d','d','g','b','d','d','d','d','l','l'],
    ['g','d','d','b','d','b','b','l','l','l'],
    ['d','d','d','b','d','b','l','l','d','d'],
   ['d','d','d','b','d','l','l','d','d','d'],
    ['d','d','d','b','d','l','l','d','d','d']
]

trans = {'l': 1, 'd': 1.5, 'b': -1.5, 'g': -1}

def simheat(grid, airtemp, steps=75, alpha=0.01, beta = 0.01, hot = True): 
    height = len(grid)
    width = len(grid[0])
    
    trans = {'l': 1.0, 'd': 1.5, 'b': -1.5, 'g': -1.0}
    
    output = np.full((height, width), airtemp, dtype=float)
    for y in range(height):
        for x in range(width):
            output[y, x] += trans.get(grid[y][x], 0)

    for _ in range(steps):
        new_output = np.copy(output)
        for y in range(height):
            for x in range(width):
                center = output[y, x]
                neighbors = []
                if y > 0: neighbors.append(output[y - 1, x])
                if y < height - 1: neighbors.append(output[y + 1, x])
                if x > 0: neighbors.append(output[y, x - 1])
                if x < width - 1: neighbors.append(output[y, x + 1])
                
                laplacian = sum(neighbors) - len(neighbors) * center

                new_output[y, x] = center + alpha * laplacian - beta * (center - airtemp)
        output = new_output
    tempoutput = output
    maxtemp = output.max()
    mintemp = output.min()
    difarray = np.full((height, width), airtemp, dtype=float)
    output = output - difarray
    output = output * 125 + 125
    fig, ax = plt.subplots()
    height, width = output.shape
    fig = plt.figure(figsize=(width / 100, height / 100), dpi=100)
    ax = fig.add_axes([0, 0, 1, 1]) 
    
    # add here
    if hot:
        ax.imshow(output, cmap='inferno', interpolation='nearest', vmin=0, vmax=255)
    else:
        ax.imshow(output, cmap='Blues_r', interpolation='nearest', vmin=0, vmax=255)
    ax.axis('off') 
    canvas = FigureCanvas(fig)
    canvas.draw()
    image = np.frombuffer(canvas.tostring_argb(), dtype=np.uint8).reshape((height, width, 4))
    # Convert to JSON serializable format
    rgb_pixels = [[[int(pixel[1]), int(pixel[2]), int(pixel[3])] for pixel in row] for row in image]
    plt.close(fig)
    return (rgb_pixels,(float(maxtemp),float(mintemp)),tempoutput)
#result = simheat(test, airtemp=5,hot = False)
#print( result[1])
#plt.imshow(result)
#plt.axis('off')
#plt.title("Reconstructed RGB Image")
#plt.show()
