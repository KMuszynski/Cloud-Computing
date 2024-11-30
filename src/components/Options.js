import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabase.js";

function Options({ onLogout }) {
	const [email, setEmail] = useState("");

	// Fetch the session to get the user's email
	useEffect(() => {
		const fetchUserDetails = async () => {
			const {
				data: { session },
				error,
			} = await supabase.auth.getSession();
			if (error) {
				console.error("Error fetching session:", error.message);
			} else if (session) {
				setEmail(session.user.email || "Unknown User");
			}
		};

		fetchUserDetails();
	}, []);

	// Handle Logout
	const handleLogout = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error("Error logging out:", error.message);
			alert("Logout failed. Please try again.");
		} else {
			onLogout();
		}
	};

	return (
		<div className="flex flex-col items-left p-6 bg-gray-100 h-full w-1/6">
			<h1 className="text-3xl font-semibold mb-8">{email}</h1>
			<h2 className="text-2xl mb-6">Options</h2>
			<div className="grid grid-cols-1 gap-4 w-full">
				<button
					onClick={handleLogout}
					className="mt-2 h-12 w-full border rounded-md cursor-pointer hover:bg-gray-300 bg-gray-200"
				>
					Log Off
				</button>
			</div>
		</div>
	);
}

export default Options;
