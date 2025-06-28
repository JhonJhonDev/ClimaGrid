from flask import Flask, request, jsonify
from flask_cors import CORS
from heat import simheat 
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
        evaluation = data.get('evaluation')
        flat = []
        for i in range(grid_size):
            temp = []
            for j in range(grid_size):
                temp.append(grid[i][j]["type"])
            flat.append(temp)
        flat = simheat(flat,airtemp = 20)
        print(flat[0])
        return jsonify({
            "message": "True",
            "score": evaluation.get('score') if evaluation else None,
            "heatmap": flat 
        }), 200
        
    except Exception as e:
        print("Error processing evaluation:", str(e))
        return jsonify({"error": "Invalid request"}), 400

if __name__ == '__main__':
    app.run(debug=True)

