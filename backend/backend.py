from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

@app.route('/api/evaluate', methods=['POST'])
def evaluate():
    try:
        data = request.get_json() 
        print("Received evaluation data:")
        print(data)

        grid_size = data.get('gridSize')
        grid = data.get('grid')
        evaluation = data.get('evaluation')

        return jsonify({
            "message": "Evaluation received successfully!",
            "score": evaluation.get('score') if evaluation else None
        }), 200

    except Exception as e:
        print("Error processing evaluation:", str(e))
        return jsonify({"error": "Invalid request"}), 400

if __name__ == '__main__':
    app.run(debug=True)

