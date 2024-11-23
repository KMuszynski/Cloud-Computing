import requests
import json

# Define the URL of the Flask application
url = "http://127.0.0.1:5001/add_user"

# Define the user data you want to insert
user_data = {
    "username": "Krzysztof",
    "email": "KrzysztofJerzyMuszynski@gmail.com",
    "password": "123456"
}

# Send a POST request to the Flask app with the user data as JSON
response = requests.post(url, json=user_data)

# Print the response from the server
print(response.json())
