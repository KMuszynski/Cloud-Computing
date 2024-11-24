import React, { useState } from "react";

function LoginScreen({ onLogin }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [repeatPassword, setRepeatPassword] = useState("");
	const [name, setName] = useState("");
	const [isRegistering, setIsRegistering] = useState(false);

	const handleLoginClick = (e) => {
		e.preventDefault();
		onLogin(); // Call the onLogin prop function to navigate to MainContent
	};

	return (
		<div className="flex flex-col items-center justify-center h-full bg-gray-100">
			<h2 className="text-3xl font-bold mb-6">
				{isRegistering ? "Register" : "Login"}
			</h2>
			<div className="flex w-2/4">
				<form className="bg-white p-6 rounded shadow w-full flex flex-col">
					{isRegistering && (
						<div className="mb-4">
							<label
								className="block text-sm font-semibold mb-2"
								htmlFor="name"
							>
								Name
							</label>
							<input
								type="text"
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
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
							className="w-full p-2 border rounded"
							placeholder="Enter your email"
						/>
					</div>
					<div className="mb-4">
						<label
							className="block text-sm font-semibold mb-2"
							htmlFor="password"
						>
							Password
						</label>
						<input
							type="password"
							id="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full p-2 border rounded"
							placeholder="Enter your password"
						/>
					</div>
					{isRegistering && (
						<div className="mb-4">
							<label
								className="block text-sm font-semibold mb-2"
								htmlFor="repeat-password"
							>
								Repeat Password
							</label>
							<input
								type="password"
								id="repeat-password"
								value={repeatPassword}
								onChange={(e) => setRepeatPassword(e.target.value)}
								className="w-full p-2 border rounded"
								placeholder="Repeat your password"
							/>
						</div>
					)}
					<button
						type="submit"
						className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
						onClick={handleLoginClick}
					>
						{isRegistering ? "Register" : "Log In"}
					</button>
				</form>
				<div className="flex items-center justify-center ml-4">
					<button
						className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
						onClick={() => setIsRegistering(!isRegistering)}
					>
						{isRegistering ? "Back to Login" : "Register"}
					</button>
				</div>
			</div>
		</div>
	);
}

export default LoginScreen;
