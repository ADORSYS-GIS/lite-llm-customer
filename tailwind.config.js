/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: "#1173d4",
				"background-light": "#f6f7f8",
				"background-dark": "#101922",
			},
		},
	},
	plugins: [],
};
