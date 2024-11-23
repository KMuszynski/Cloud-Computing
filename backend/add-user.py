import requests

# Define the base URL of the Flask application
base_url = "http://127.0.0.1:5001"

# Authenticate the user and return user_id
def login_user(email, password):
    url = f"{base_url}/login"
    data = {
        "email": email,
        "password": password
    }
    
    response = requests.post(url, json=data)
    if response.status_code == 200:
        # Extract user_id from the successful login response
        print(f"Login successful: {response.json()['message']}")
        return response.json()['user_id']  # Get the user_id from the response
    else:
        print(f"Login failed: {response.json()['error']}")
        return None

# Upload a file for the user
def upload_file(user_id):
    url = f"{base_url}/upload"
    headers = {
        "user_id": str(user_id)  # Use the user_id from login response
    }

    # Specify the file path for testing
    test_file_path = "/Users/krzysztofmuszynski/Desktop/Dokumenty/zdjęcia/1729513895326.jpg"
    
    try:
        # Open the file and upload it
        with open(test_file_path, "rb") as file:
            files = {"file": file}
            response = requests.post(url, headers=headers, files=files)
            print(f"File upload response: {response.json()}")
            
            if response.status_code == 201:
                print(f"File '{test_file_path}' uploaded successfully!")
            else:
                print(f"Failed to upload file: {response.json()}")
    except FileNotFoundError:
        print(f"File not found at {test_file_path}. Please check the path.")
    except Exception as e:
        print(f"An error occurred: {e}")

# Check if the file is added correctly
def check_uploaded_files(user_id):
    url = f"{base_url}/get_files"
    headers = {
        "user_id": str(user_id)  # Use the user_id from login response
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        files = response.json()
        if files:
            print("Files uploaded:")
            for file in files:
                print(f"Filename: {file['filename']}, Filepath: {file['filepath']}")
        else:
            print("No files found for this user.")
    else:
        print(f"Failed to retrieve files: {response.json()['error']}")

# Main script
if __name__ == "__main__":
    email = "KrzysztofJerzyMuszynski@gmail.com"
    password = "123456"
    
    # Step 1: Log in the user
    user_id = login_user(email, password)
    
    if user_id:
        # Step 2: Upload the file
        upload_file(user_id)
        
        # Step 3: Check if the file is uploaded
        check_uploaded_files(user_id)
