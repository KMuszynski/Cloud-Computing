import React from "react";

function Header({ onHome, onShowOptions, onUpload }) {
	return (
		<div className="flex justify-between items-center p-4 bg-gray-100">
			<div onClick={onHome} className="ml-4 mr-8 text-2xl cursor-pointer">
				🏠
			</div>
			<input
				type="text"
				className="flex-1 p-2 border rounded-md"
				placeholder="Search in Drive"
			/>
			<button
				onClick={onUpload}
				className="ml-4 text-2xl cursor-pointer hover:bg-gray-300 bg-gray-200 rounded-md p-2"
			>
				Upload files
			</button>
			<div onClick={onShowOptions} className="ml-4 text-2xl cursor-pointer">
				👤
			</div>
		</div>
	);
}

export default Header;
