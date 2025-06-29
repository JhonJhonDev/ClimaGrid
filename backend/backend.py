from flask import Flask, request, jsonify
from flask_cors import CORS
from heat import simheat
from energy import calculate_energy_usage
import xarray as xr
import numpy as np
import pandas as pd

app = Flask(__name__)
CORS(app)

@app.route('/api/evaluate', methods=['POST'])
def evaluate():
    try:
        data = request.get_json() 
        print("Received evaluation data:")
        grid_size = data.get('gridSize')
        grid = data.get('grid')
        longitude = int(data.get('longitude'))
        latitude = int(data.get('latitude'))
        year = str(data.get('yr'))
        evaluation = data.get('evaluation')
        flat = []
        for i in range(grid_size):
            temp = []
            for j in range(grid_size):
                temp.append(grid[i][j]["type"])
            flat.append(temp)
        url = "https://ds.nccs.nasa.gov/thredds/dodsC/AMES/NEX/GDDP-CMIP6/ACCESS-CM2/ssp245/r1i1p1f1/tasmax/tasmax_day_ACCESS-CM2_ssp245_r1i1p1f1_gn_" + str(year) +".nc"
        dstm = xr.open_dataset(url,engine='netcdf4' )
        tasmax_c = dstm['tasmax']-273.15
        value = tasmax_c.sel(lat=latitude, lon=longitude, method='nearest')
        airtemp = value.max(dim="time")
        airtemp = airtemp.item()
        
        flatsim = simheat(flat,airtemp)
        
        # Calculate energy usage heatmap and statistics
        energy_heatmap, energy_stats = calculate_energy_usage(flat)
        print(airtemp)
        
        return jsonify({
            "message": "True",
            "score": evaluation.get('score') if evaluation else None,
            "orgmap" : flat,
            "heatmap": flatsim[0],
            "heattemps":flatsim[1],
            "energy_heatmap": energy_heatmap,
            "energy_stats": energy_stats
        }), 200
        
    except Exception as e:
        print("Error processing evaluation:", str(e))
        return jsonify({"error": "Invalid request"}), 400

if __name__ == '__main__':
    app.run(debug=True)

