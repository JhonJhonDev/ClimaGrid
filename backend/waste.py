import numpy as np
import matplotlib.pyplot as plt
from copy import deepcopy
def wastemaker(grid, temp,
               baseline_temp=15,
               normaltrashperson=1.2,
               temp_coeff=0.015):
    trasharea = {'d':500, 'l':50, 'g':0, 'b':0} #dict for amt of trash per area type
    R, C = len(grid), len(grid[0])
    waste = [[0.0]*C for _ in range(R)]
    
    for i in range(R):
        for j in range(C):
            p = trasharea[grid[i][j]]
            # adjust per-person waste by temperature delta
            per_person = normaltrashperson * (
                1 + temp_coeff*(temp[i][j] - baseline_temp)
            )
            waste[i][j] = p * per_person
    return waste

def ca_step(grid, waste, coeffs):
    R, C = len(grid), len(grid[0])
    delta = [[0.0]*C for _ in range(R)]
    nbrs = [(-1,0),(1,0),(0,-1),(0,1)]
    
    for i in range(R):
        for j in range(C):
            w0 = waste[i][j]
            for di, dj in nbrs:
                ni, nj = i+di, j+dj
                if not (0 <= ni < R and 0 <= nj < C): continue
                neigh_type = grid[ni][nj]
                
                if grid[i][j]=='d' and neigh_type=='l':
                    diff = w0 - waste[ni][nj]
                    if diff>0:
                        flow = diff * coeffs['h_overflow']
                        delta[i][j]   -= flow
                        delta[ni][nj] += flow
                
                if grid[i][j] in ('d','l') and neigh_type=='b':
                    flow = w0 * coeffs['h_to_water']
                    delta[i][j]   -= flow
                    delta[ni][nj] += flow
                
                if grid[i][j] in ('d','l') and neigh_type=='g':
                    flow = w0 * coeffs['h_to_green']
                    delta[i][j]   -= flow
                    delta[ni][nj] += flow
                
                if grid[i][j]=='g' and neigh_type=='b':
                    flow = w0 * coeffs['g_to_water']
                    delta[i][j]   -= flow
                    delta[ni][nj] += flow
                
                if grid[i][j]=='b' and neigh_type in ('g','l','d'):
                    flow = w0 * coeffs['w_to_land']
                    delta[i][j]   -= flow
                    delta[ni][nj] += flow

    new_waste = [[waste[i][j] + delta[i][j] for j in range(C)]
                 for i in range(R)]
    return new_waste

def run_ca_final(grid, temp, steps=10):
    # default flow coefficients
    coeffs = {
        'h_overflow': 0.1,
        'h_to_water': 0.05,
        'h_to_green': 0.05,
        'g_to_water': 0.10,
        'w_to_land': 0.01
    }
    w = wastemaker(grid, temp)
    for _ in range(steps):
        w = ca_step(grid, w, coeffs)
    return w

if __name__=='__main__':
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
    final_waste = run_ca_final(land, temperature, steps=10)
    for row in final_waste:
        print(["{:.2f}".format(x) for x in row])
waste_arr = np.array(final_waste)


cmap = plt.get_cmap('YlOrBr')

fig, ax = plt.subplots(figsize=(6, 4))
ax.axis('off')
cax = ax.imshow(waste_arr,
                cmap=cmap,
                interpolation='nearest')


# labels


# colorssssss

plt.tight_layout()
plt.show()
