# Use the latest Python version
FROM python:3.13.0

# Set working directory
WORKDIR /usr/src/ai

# Copy requirements and install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY ./app ./app

# Expose port
EXPOSE 8000

# Start the Flask app
CMD ["python", "app/main.py"]
