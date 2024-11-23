import os
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
from app.database import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_migrate import Migrate

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

# Directory to store uploaded files
BASE_UPLOAD_FOLDER = './files'
app.config['BASE_UPLOAD_FOLDER'] = BASE_UPLOAD_FOLDER

# Ensure the uploads directory exists
os.makedirs(BASE_UPLOAD_FOLDER, exist_ok=True)

class File(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    filepath = db.Column(db.String(255), nullable=False)  # Where the file is stored on the server
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Foreign key to associate with a user

    # Relationship to access the owning user
    user = db.relationship('User', back_populates='files')

# Update User model to include relationship
User.files = db.relationship('File', back_populates='user', cascade='all, delete-orphan')

# Helper function to generate unique filename
def get_unique_filename(user_id, filename):
    # Create the user's directory if it doesn't exist
    user_folder = os.path.join(BASE_UPLOAD_FOLDER, str(user_id))
    os.makedirs(user_folder, exist_ok=True)
    
    # Get the file extension
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

    return jsonify({"message": f"File {unique_filename} uploaded successfully for user {user.username}!"}), 201

@app.route('/delete_file/<int:file_id>', methods=['DELETE'])
def delete_file(file_id):
    # Assuming you have some form of user authentication and can retrieve the current user's ID
    user_id = request.headers.get('user_id')  # Replace with your actual authentication logic

    # Fetch the file record from the database
    file = File.query.get(file_id)

    if not file:
        return jsonify({"error": "File not found"}), 404

    # Check if the file belongs to the authenticated user
    if file.user_id != int(user_id):
        return jsonify({"error": "Unauthorized"}), 403

    # Attempt to delete the file from the filesystem
    try:
        if os.path.exists(file.filepath):
            os.remove(file.filepath)  # Delete the file from the filesystem
        else:
            return jsonify({"error": "File not found on server"}), 404
    except Exception as e:
        return jsonify({"error": f"Error deleting file: {str(e)}"}), 500

    # Delete the file record from the database
    db.session.delete(file)
    db.session.commit()

    return jsonify({"message": f"File {file.filename} deleted successfully!"}), 200

@app.route('/get_files', methods=['GET'])
def get_files():
    # Retrieve the user_id from the request headers
    user_id = request.headers.get('user_id')
    
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        user_id = int(user_id)  # Ensure that the user_id is an integer
    except ValueError:
        return jsonify({"error": "Invalid user ID format"}), 400

    # Fetch the user's files from the database
    files = File.query.filter_by(user_id=user_id).all()

    # Prepare the response data with filenames and filepaths
    files_data = [{"id": file.id, "filename": file.filename, "filepath": file.filepath} for file in files]

    return jsonify(files_data), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)  # Make sure the app is accessible outside of the container
