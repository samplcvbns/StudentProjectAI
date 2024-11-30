from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/ai', methods=['GET'])
def ai():
    return jsonify({"message": "Hello from Service!"})

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8000)
