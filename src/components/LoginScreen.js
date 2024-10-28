// src/components/LoginScreen.js
import React from 'react';

function LoginScreen({ onLogin }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-3xl font-bold mb-20">Cloud Drive</h1>
      <h2 className="text-2xl  mb-6">Log in or Register</h2>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onLogin}
          className="flex items-center justify-center h-24 w-32 border rounded-md cursor-pointer hover:bg-gray-300 bg-gray-200"
        >
          Log in
        </button>
        <button className="flex items-center justify-center h-24 w-32 border rounded-md cursor-pointer hover:bg-gray-300 bg-gray-200">
          Register
        </button>
      </div>
    </div>
  );
}

export default LoginScreen;
