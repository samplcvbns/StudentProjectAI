import logging
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
from flask import Flask, request, jsonify, session
import os

# Configure logging
logging.basicConfig(level=logging.INFO)

# Constants
MODEL_NAME = "meta-llama/Llama-2-7b-chat-hf"  # Replace with your preferred model
MAX_CONTEXT_LENGTH = 4096  # Token limit for conversation context

# Initialize Chatbot Model
def initialize_chatbot():
    """Initialize a state-of-the-art conversational model."""
    try:
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        model = AutoModelForCausalLM.from_pretrained(MODEL_NAME, device_map="auto", load_in_8bit=True)
        chatbot_pipeline = pipeline("text-generation", model=model, tokenizer=tokenizer, device=0)
        return chatbot_pipeline
    except Exception as e:
        logging.error(f"Failed to initialize chatbot model: {e}")
        raise

# Chatbot Class
class Chatbot:
    def __init__(self):
        self.chatbot = initialize_chatbot()
        self.history = []

    def get_response(self, user_message):
        """Generate a response based on user input."""
        try:
            # Maintain context for conversation
            self.history.append(f"User: {user_message}")
            if len(self.history) > MAX_CONTEXT_LENGTH:
                self.history.pop(0)  # Trim the context if it exceeds the limit
            
            context = "\n".join(self.history)
            prompt = f"{context}\nAssistant:"
            response = self.chatbot(prompt, max_length=500, do_sample=True, top_k=50, top_p=0.9)[0]["generated_text"]
            
            # Extract assistant's response
            assistant_response = response[len(context):].strip()
            self.history.append(f"Assistant: {assistant_response}")
            return {"response": assistant_response}
        except Exception as e:
            logging.error(f"Error generating response: {e}")
            return {"error": str(e)}

# Flask App
app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "supersecretkey")

# Initialize Chatbot Instance
chatbot_instance = Chatbot()

@app.route("/chat", methods=["POST"])
def chat():
    """Chatbot interaction route."""
    user_message = request.json.get("message")
    if not user_message:
        return jsonify({"error": "No input provided."}), 400

    try:
        response = chatbot_instance.get_response(user_message)
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001)
