# Tic Tac Toe - Neon Glassmorphism

A highly polished, modern, glassmorphic & neon-styled Tic Tac Toe game web application built with **React**, **Vite**, **TypeScript**, and **Tailwind CSS**.

## Features

- **Modern Glassmorphic UI**: Vibrant gradient background, subtle blur, neon glow, and sleek typography.
- **Two Game Modes**:
  - **Player vs Player**: Local 1v1 play.
  - **Player vs AI**: Play against an AI robot with three difficulty levels: **Easy**, **Medium**, and **Impossible** (powered by the optimal Minimax algorithm).
- **Responsive Elements**: Fluid layout looking fantastic on both mobile devices and large desktop monitors.
- **Web Audio API Sound Synth**: Sound effects for placing a mark, winning a match, or a draw, generated directly from the browser's dynamic audio synthesizer (no bulky static assets to load).
- **Dark/Light Mode Toggle**: High-fidelity dark (default) and light themes with beautiful shadows.
- **Leaderboard Score Tracking**: Automatically tracked, persistent score counting for X Wins, O Wins, and Draws saved to `localStorage`.

---

## How to Run locally in VS Code

After exporting this project, follow these simple steps to run it locally on your computer:

### Prerequisites

Ensure you have **Node.js** installed on your system. You can check by running:
```bash
node -v
```
*(If not installed, download the LTS version from [nodejs.org](https://nodejs.org/))*

### Step-by-Step Guide

1. **Extract and Open the Project**:
   - Extract the exported ZIP file to a folder.
   - Open **Visual Studio Code** (VS Code).
   - Go to `File` -> `Open Folder...` and select the extracted folder.

2. **Open the Terminal**:
   - In VS Code, open the integrated terminal by pressing ``Ctrl + ` `` (or ``Cmd + ` `` on macOS), or by selecting `Terminal` -> `New Terminal` from the top menu.

3. **Install Dependencies**:
   - Run the following command to download and install all required packages:
     ```bash
     npm install
     ```

4. **Start the Development Server**:
   - Run the local Vite server:
     ```bash
     npm run dev
     ```

5. **Open in Your Browser**:
   - Click the link printed in your terminal (usually `http://localhost:3000` or `http://localhost:5173`) to launch the application.

### Build for Production

To compile and optimize the applet for production deployment, run:
```bash
npm run build
```
This will produce optimized static assets inside the `/dist` directory, ready to be hosted on any web server (such as Vercel, Netlify, or GitHub Pages).
