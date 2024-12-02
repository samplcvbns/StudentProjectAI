from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/ai', methods=['GET'])
def ai():
    return jsonify({"message": "Hello from Service!"})

@app.before_request
def log_startup():
    if not hasattr(app, 'started'):
        app.started = True
        print("Server connected successfully and is ready to handle requests!")

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8000)
