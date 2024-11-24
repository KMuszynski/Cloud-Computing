import React, { useState } from 'react';
import axios from 'axios';

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // New state for toggling between login and registration

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    try {
      // Make an API request to the backend to authenticate the user
      const response = await axios.post('http://localhost:5001/login', { email, password });

      // If successful, save user_id to localStorage
      const userId = response.data.user_id;  // Assuming backend response has user_id
      localStorage.setItem('user_id', userId);
      //localStorage.setItem('user_id', response.user_id);

      // Call onLogin (you can save token or session here if needed)
      onLogin();

      // Clear error message if login is successful
      setErrorMessage('');
      console.log('Login successful', response.data.message); // You can also display the success message
    } catch (error) {
      // Handle errors (like incorrect email/password)
      if (error.response) {
        setErrorMessage(error.response.data.error || 'Something went wrong');
      } else {
        setErrorMessage('Error connecting to the server');
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== repeatPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      // Make an API request to the backend to register the user
      const response = await axios.post('http://localhost:5001/add_user', { username: name, email, password });

      // Clear error message and show success message
      setErrorMessage('');
      console.log('Registration successful', response.data.message); // You can also display the success message

      // Switch back to login view
      setIsRegistering(false);
    } catch (error) {
      // Handle errors (like email already in use)
      if (error.response) {
        setErrorMessage(error.response.data.error || 'Something went wrong');
      } else {
        setErrorMessage('Error connecting to the server');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-100">
      <h2 className="text-3xl font-bold mb-6">{isRegistering ? 'Register' : 'Login'}</h2>
      <div className="flex w-2/4">
        <form
          onSubmit={isRegistering ? handleRegister : handleLogin}
          className="bg-white p-6 rounded shadow w-full flex flex-col"
        >
          {isRegistering && (
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-2 border rounded"
                placeholder="Enter your name"
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border rounded"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 border rounded"
              placeholder="Enter your password"
            />
          </div>
          {isRegistering && (
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" htmlFor="repeat-password">
                Repeat Password
              </label>
              <input
                type="password"
                id="repeat-password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                required
                className="w-full p-2 border rounded"
                placeholder="Repeat your password"
              />
            </div>
          )}
          {errorMessage && (
            <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            {isRegistering ? 'Register' : 'Log In'}
          </button>
        </form>
        <div className="flex items-center justify-center ml-4">
          <button
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
            onClick={() => setIsRegistering(!isRegistering)} // Toggle between login and register
          >
            {isRegistering ? 'Back to Login' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
