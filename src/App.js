import React, { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import LoginScreen from "./components/LoginScreen";
import Options from "./components/Options";
import Upload from "./components/Upload";
import { supabase } from "./utils/supabase.js"; // Import Supabase

function App() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [showSidebar, setShowSidebar] = useState(true);
	const [showOptions, setShowOptions] = useState(false);
	const [selectedItem, setSelectedItem] = useState("All files");
	const [showUpload, setShowUpload] = useState(false);

	// Check for active session on app load
	useEffect(() => {
		const checkSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (session) {
				setIsLoggedIn(true);
			}
		};
		checkSession();
	}, []);

	const handleHome = () => {
		setShowSidebar((prev) => !prev);
	};

	const handleShowOptions = () => {
		setShowOptions((prev) => !prev);
	};

	const handleSelectItem = (item) => {
		setSelectedItem(item);
		setShowUpload(false);
	};

	const handleUpload = () => {
		setShowUpload(true);
	};

	return (
		<div className="h-screen flex flex-col">
			{isLoggedIn ? (
				<>
					<Header
						onHome={handleHome}
						onShowOptions={handleShowOptions}
						onUpload={handleUpload}
					/>
					<div className="flex flex-1">
						{showSidebar && (
							<Sidebar
								selectedItem={selectedItem}
								onSelectItem={handleSelectItem}
							/>
						)}
						{showUpload ? (
							<Upload />
						) : (
							<MainContent
								selectedItem={selectedItem}
								className={`flex-1 ${showOptions ? "w-3/4" : "w-full"}`}
							/>
						)}
						{showOptions && <Options onLogout={() => setIsLoggedIn(false)} />}
					</div>
				</>
			) : (
				<LoginScreen onLogin={() => setIsLoggedIn(true)} />
			)}
		</div>
	);
}

export default App;
