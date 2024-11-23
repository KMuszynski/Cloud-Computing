# Use the official Python image from the DockerHub
FROM python:3.9-slim

# Set the working directory to /app
WORKDIR /app

# Copy the requirements.txt file into the container
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app into the container
COPY . .

# Expose port 5000 for the Flask app
EXPOSE 5000

# Set the entrypoint for the app to run Flask
CMD ["flask", "run", "--host=0.0.0.0"]

