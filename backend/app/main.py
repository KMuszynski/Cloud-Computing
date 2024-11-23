import os
from flask import Flask, request, jsonify, send_from_directory, send_file, make_response
from werkzeug.utils import secure_filename
from flask_cors import CORS
from app.database import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_migrate import Migrate
import mimetypes
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:password@db:5432/mydatabase'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Enable CORS for all domains (or restrict to specific domains later)
CORS(app, origins="http://localhost:3000")  # Allow requests only from your React app

# Set up database URI to connect to the PostgreSQL container
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:password@db:5432/mydatabase'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
migrate = Migrate(app, db)

# Define the User model (table structure)
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=False, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    hashed_password = db.Column(db.String(200), nullable=False)

    def __repr__(self):
        return f'<User {self.username}>'

# Create the tables in the database
with app.app_context():
    db.create_all()

class Log(db.Model):
    __tablename__ = 'logs'

    id = db.Column(db.Integer, primary_key=True)
    action = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    file_id = db.Column(db.Integer, db.ForeignKey('files.id'), nullable=True)  
    file_version = db.Column(db.Integer, nullable=True)  # If needed
    file_size = db.Column(db.Integer, nullable=True)  # Add this column for file size

    user = db.relationship('User', backref=db.backref('logs', lazy=True))
    file = db.relationship('File', backref=db.backref('logs', lazy=True), uselist=False)

    def __repr__(self):
        return f'<Log {self.id} - Action: {self.action}, User: {self.user_id}, Timestamp: {self.timestamp}>'



class File(db.Model):
    __tablename__ = 'files'  # Ensure the correct table name is referenced

    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    filepath = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    user = db.relationship('User', back_populates='files')

# Define the relationship in User model as well
User.files = db.relationship('File', back_populates='user', cascade='all, delete-orphan')


# Helper function to generate unique filename
def get_unique_filename(user_id, filename):
    user_folder = os.path.join(BASE_UPLOAD_FOLDER, str(user_id))  # Directory for each user
    os.makedirs(user_folder, exist_ok=True)
    
    file_extension = os.path.splitext(filename)[1]
    base_name = os.path.splitext(filename)[0]
    
    new_filename = filename
    file_path = os.path.join(user_folder, new_filename)
    
    # Check if the file already exists and increment the filename if necessary
    counter = 1
    while os.path.exists(file_path):
        new_filename = f"{base_name} ({counter}){file_extension}"
        file_path = os.path.join(user_folder, new_filename)
        counter += 1

    return new_filename, file_path

def log_file_action(action, user_id, file_id=None, file_version=None, file_size=None):
    log = Log(
        action=action,
        user_id=user_id,
        file_id=file_id,
        file_version=file_version,
        file_size=file_size  # This is now valid since file_size is in the model
    )
    db.session.add(log)
    db.session.commit()



# Route to log in a user (Authentication)
@app.route('/login', methods=['POST'])
def login():
    # Get the data from the request
    data = request.get_json()

    # Extract the email and password
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    # Query the user from the database based on the email
    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.hashed_password, password):
        # Successful login
        return jsonify({
            "message": f"Welcome, {user.username}!",
            "user_id": user.id  # Include the user_id in the response
        }), 200
    else:
        # Invalid credentials
        return jsonify({"error": "Invalid email or password"}), 401


# Route to add a new user to the database
@app.route('/add_user', methods=['POST'])
def add_user():
    # Get the data from the request
    data = request.get_json()

    # Extract the user info
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    # Check if a user with the same email already exists
    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify({"error": "Email already in use"}), 400

    # Hash the password before storing it
    hashed_password = generate_password_hash(password)

    # Create a new user and add it to the database
    new_user = User(username=username, email=email, hashed_password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    # Return a success message
    return jsonify({"message": f"User {username} added successfully!"}), 201

BASE_UPLOAD_FOLDER = '/app/files'  # Directory inside the Docker container

# Ensure the uploads directory exists (this path exists in the container, not the host machine)
os.makedirs(BASE_UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Secure the filename
    filename = secure_filename(file.filename)

    # Get the user ID from the request headers
    user_id = request.headers.get('user_id')

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        # Generate unique filename and file path
        unique_filename, absolute_filepath = get_unique_filename(user_id, filename)

        # Save the file to the user's directory
        file.save(absolute_filepath)
    except Exception as e:
        return jsonify({"error": f"Error saving file: {str(e)}"}), 500

    # Fetch the user from the database
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Create a new file record in the database
    new_file = File(filename=unique_filename, filepath=absolute_filepath, user_id=user_id)
    db.session.add(new_file)
    db.session.commit()

    # Log the upload action
    log_file_action(action='file_uploaded', user_id=user.id, file_id=new_file.id, file_size=len(file.read()))

    return jsonify({"message": f"File {unique_filename} uploaded successfully for user {user.username}!"}), 201

@app.route('/delete_file/<int:file_id>', methods=['DELETE'])
def delete_file(file_id):
    user_id = request.headers.get('user_id')  # Get the user ID from the headers

    if not user_id:
        print("Error: User ID is missing in request headers")
        return jsonify({"error": "User ID is missing"}), 400

    try:
        # Fetch the file record from the database
        file = File.query.get(file_id)

        if not file:
            print(f"Error: File with ID {file_id} not found.")
            return jsonify({"error": "File not found"}), 404

        # Check if the file belongs to the authenticated user
        if file.user_id != int(user_id):
            print(f"Error: Unauthorized access attempt by user {user_id} for file {file_id}")
            return jsonify({"error": "Unauthorized"}), 403

        # Log the delete action before deleting the file
        log_file_action(action='file_deleted', user_id=int(user_id), file_id=file.id)

        # Attempt to delete the file from the filesystem
        if os.path.exists(file.filepath):
            os.remove(file.filepath)  # Delete the file from the filesystem
            print(f"Success: File {file.filename} deleted from filesystem.")
        else:
            print(f"Error: File {file.filename} not found on server.")
            return jsonify({"error": "File not found on server"}), 404

        # Delete the file record from the database
        db.session.delete(file)
        db.session.commit()
        print(f"Success: File record for {file.filename} deleted from database.")

        return jsonify({"message": f"File {file.filename} deleted successfully!"}), 200

    except Exception as e:
        # Log the exception details for debugging
        print(f"Error in delete_file: {str(e)}")
        return jsonify({"error": f"Error deleting file: {str(e)}"}), 500





@app.route('/get_logs', methods=['GET'])
def get_logs():
    # Admin check (this could be improved by having proper roles/permissions)
    user_id = request.headers.get('user_id')

    # If you want to keep the admin check commented out:
    # if not user_id or int(user_id) != 1:  # Assuming user ID 1 is an admin
    #     return jsonify({"error": "Unauthorized access to logs"}), 403

    # Fetching logs along with user information (assuming User is related to Log by user_id)
    logs = Log.query.join(User, Log.user_id == User.id).all()

    # Format the logs data with user information
    logs_data = [{
        "id": log.id,
        "action": log.action,
        "timestamp": log.timestamp,
        "user_id": log.user_id,
        "file_id": log.file_id,
        "file_version": log.file_version,
        "username": log.user.username,  # Assuming 'User' model has a 'username' field
        "email": log.user.email        # Assuming 'User' model has an 'email' field
    } for log in logs]

    return jsonify(logs_data), 200


@app.route('/get_files', methods=['GET'])
def get_files():
    user_id = request.headers.get('user_id')
    
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        user_id = int(user_id)  # Ensure that the user_id is an integer
    except ValueError:
        return jsonify({"error": "Invalid user ID format"}), 400

    # Fetch the user's files from the database
    files = File.query.filter_by(user_id=user_id).all()

    files_data = [{"id": file.id, "filename": file.filename, "filepath": file.filepath} for file in files]

    return jsonify(files_data), 200


@app.route('/download_file/<int:file_id>', methods=['GET'])
def download_file(file_id):
    # Retrieve the user_id from the request headers
    user_id = request.headers.get('user_id')

    # Fetch the file record from the database
    file = File.query.get(file_id)

    if not file:
        return jsonify({"error": "File not found"}), 404

    # Ensure the file exists in the filesystem
    if not os.path.exists(file.filepath):
        return jsonify({"error": "File does not exist on the server"}), 404

    # Use mimetypes to set the MIME type based on the file extension
    mime_type, _ = mimetypes.guess_type(file.filename)
    mime_type = mime_type or 'application/octet-stream'  # Default to binary if MIME type can't be guessed

    # Secure the filename to prevent any issues with special characters
    secure_name = secure_filename(file.filename)

    # Prepare the response and set the correct download name from the database
    response = send_file(
        file.filepath,
        as_attachment=True,
        download_name=secure_name,  # Correctly set filename here
        mimetype=mime_type
    )

    # Log the download action
    log_file_action(action='file_downloaded', user_id=int(user_id), file_id=file.id)

    # Add custom header with the filename for the frontend to use
    response.headers['X-File-Name'] = secure_name

    # Disable caching for file download
    response.cache_control.no_store = True
    response.cache_control.max_age = 0
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'

    return response


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)  # Make sure the app is accessible outside of the container
