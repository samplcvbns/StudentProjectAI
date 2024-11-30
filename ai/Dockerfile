# Use the latest Python version
FROM python:3.13.0

# Set working directory
WORKDIR /usr/src/ai

# Copy requirements file and install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Expose port 8000
EXPOSE 8000

# Start the Flask app
CMD ["python", "main.py"]
