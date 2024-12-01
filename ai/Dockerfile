# Use the officia       l Python 3.13 image
FROM python:3.13.0

# Set the working directory inside the container
WORKDIR /usr/src/ai

# Copy the requirements.txt file to the container
COPY requirements.txt .

# Install the dependencies listed in the requirements.txt file
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application source code to the container
COPY ./app ./app

# Expose port 8000 for the Flask app
EXPOSE 8000

# Run Flask app directly, no need to use `flask run` since we call `app.run()` in `main.py`
CMD ["python", "app/main.py"]
