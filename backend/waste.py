import numpy as np
import matplotlib.pyplot as plt
from copy import deepcopy
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas

def wastemaker(grid, temp,baseline_temp=15,normaltrashperson=1.2,temp_coeff=0.015):
    trasharea = {'d':500, 'l':50, 'g':0, 'b':0, 'empty':0} 
    row, column = len(grid), len(grid[0])
    waste = [[0.0]*column for _ in range(row)]
    
    for i in range(row):
        for j in range(column):
            p = trasharea[grid[i][j]]
            adjustedperperson = normaltrashperson * (1 + temp_coeff*(temp[i][j] - baseline_temp))
            waste[i][j] = p * adjustedperperson
    return waste

def ca_step(grid, waste, coeffs):
    row, column = len(grid), len(grid[0])
    delta = [[0.0]*column for _ in range(row)] #calcs delta given length of grid
    neumannNeighbors = [(-1,0),(1,0),(0,-1),(0,1)] #only adjacent squares
    
    for i in range(row):
        for j in range(column):
            initialwaste = waste[i][j]
            for di, dj in neumannNeighbors:
                ni, nj = i+di, j+dj #checks for corners (1 right, 1 up)
                if not (0 <= ni < row and 0 <= nj < column): continue # check for edge cases 
                neigh_type = grid[ni][nj]
                
                if grid[i][j]=='d' and neigh_type=='l': #rule 1 trash overflow from high densiy areas pollutes low density housing
                    diff = initialwaste - waste[ni][nj]
                    if diff>0:
                        flow = diff * coeffs['overflow']
                        delta[i][j]   -= flow
                        delta[ni][nj] += flow
                
                if grid[i][j] in ('d','l') and neigh_type=='b': #rule 2 housing to pollute waterways by chemical and trash runoff + seeping into waterways and groundwater
                    flow = initialwaste * coeffs['housingrunoff']
                    delta[i][j]   -= flow
                    delta[ni][nj] += flow
                
                if grid[i][j] in ('d','l') and neigh_type=='g': #rule 3 housing to pollute nearby greenspace due to litter, landfills, etc.
                    flow = initialwaste * coeffs['litter']
                    delta[i][j]   -= flow
                    delta[ni][nj] += flow
                
                if grid[i][j]=='g' and neigh_type=='b': # rule 4 runoff to bring green space pollution into waterways
                    flow = initialwaste * coeffs['greenspacerunoff']
                    delta[i][j]   -= flow
                    delta[ni][nj] += flow
                
                if grid[i][j]=='b' and neigh_type in ('g','l','d'): #rule 5 water to return waste to greenspace and housing through water pollution (waste untreated by treatment plants) and by buildups of trash in river banks.
                    flow = initialwaste * coeffs['watertrashbuildup']
                    delta[i][j]   -= flow
                    delta[ni][nj] += flow

                if grid[i][j]=='b' and neigh_type=='b': # rule 6 water diffusion as trash evenly spreads across a distance in the water
                    flow = initialwaste * coeffs['waterdiffusion']
                    delta[i][j]   -= flow
                    delta[ni][nj] += flow

    new_waste = [[waste[i][j] + delta[i][j] for j in range(column)]
                 for i in range(row)] # updates list
    return new_waste

def run_ca_final(grid, temp, steps=10):
    coeffs = {
        'overflow': 0.1,
        'housingrunoff': 0.05,
        'litter': 0.05,
        'greenspacerunoff': 0.10,
        'watertrashbuildup': 0.01, 'waterdiffusion': 0.05
    }
    w = wastemaker(grid, temp)
    for _ in range(steps):
        w = ca_step(grid, w, coeffs)
      
    w = np.array(w)
  
    fig, ax = plt.subplots()
    height, width = w.shape
    fig = plt.figure(figsize=(width / 100, height / 100), dpi=100)
    ax = fig.add_axes([0, 0, 1, 1]) 
    ax.imshow(w, cmap='YlOrBr', interpolation='nearest')
    ax.axis('off') 
    canvas = FigureCanvas(fig)
    canvas.draw()
    image = np.frombuffer(canvas.tostring_argb(), dtype=np.uint8).reshape((height, width, 4))
    rgb_pixels = [[[int(pixel[1]), int(pixel[2]), int(pixel[3])] for pixel in row] for row in image]
    plt.close(fig)
    return (rgb_pixels,w)

land = [
        ['d','l','g','b'],
        ['l','d','g','b'],
        ['g','g','l','d'],
        ['b','b','d','l']
    ]
temperature = [
        [10,12,15,16],
        [20,18,15,14],
        [15,15,17,19],
        [13,14,16,20]
    ]
#result = run_ca_final(land, temperature)
#print(result[0])
#plt.imshow(result[0])
#plt.axis('off')
#plt.title("roweconstructed rowGB Image")
#plt.show()

