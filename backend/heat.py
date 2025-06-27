import numpy as np
import matplotlib.pyplot as plt

test = [
    ['b','b','b','d','d','g','g','b','b','b'],
    ['b','b','b','d','g','g','g','b','b','b'],
    ['b','b','b','g','g','g','b','b','b','b'],
    ['l','b','b','g','g','b','b','b','b','b'],
    ['d','d','g','g','b','b','b','b','b','l'],
    ['d','g','g','b','b','b','b','b','l','l'],
    ['g','g','b','b','b','b','b','l','l','l'],
    ['g','b','b','b','b','b','l','l','l','b'],
    ['b','b','b','b','b','l','l','l','l','b'],
    ['b','b','b','b','l','l','l','b','b','b']
]

trans = {'l': 1, 'd': 1.5, 'b': -1.5, 'g': -1}

def simheat(grid, airtemp, steps=200, alpha=0.01, beta = 0.01): 
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

    return output
result = simheat(test, airtemp=5)

plt.imshow(result, cmap='hot', interpolation='nearest')
plt.colorbar(label='Temperature')
plt.title('Simulated Heat Map')
plt.show()

