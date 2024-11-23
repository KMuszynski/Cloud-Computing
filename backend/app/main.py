from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
from app.database import db
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

# Enable CORS for all domains (or restrict to specific domains later)
CORS(app, origins="http://localhost:3000")  # Allow requests only from your React app

# Set up database URI to connect to the PostgreSQL container
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:password@db:5432/mydatabase'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

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
        return jsonify({"message": f"Welcome, {user.username}!"}), 200
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


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)  # Make sure the app is accessible outside of the container
