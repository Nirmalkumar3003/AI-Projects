# Interactive Expense Tracker

A modern, highly polished, and fully responsive personal finance application built with React, TypeScript, Tailwind CSS, and Recharts. Track your incomes and expenses, customize category budget limits, visualize cash flows, and stay on top of your financial habits with secure offline storage.

## Features

- **Double-Entry Recording**: Add incomes and expenses with unique descriptions, custom date ranges, and private notes.
- **Dynamic Category Budget Limits**: Set custom monthly targets for each spending category. See your progress with dynamic colored progress bars and automatic budget warnings.
- **Advanced Visual Charts**:
  - **Category Breakdown**: A modern doughnut-style chart rendering percentage outlays per category.
  - **Daily Cash Flow**: A grouped bar chart tracking income vs. expense transactions over the last 7 active days.
- **Search & Intelligent Filtering**: Search through descriptions or notes, filter by exact spending category or cash flow type, and sort records by date or amount instantly.
- **Customized Theme Configuration**: Switch between polished light and glassmorphism-accented dark modes with elegant negative space and transition animations.
- **Secure Local Storage**: Zero server requirements for basic tracking. All data is securely persisted inside your client-side browser cache (`localStorage`).
- **Demo Mode**: Quickly load initial data models or wipe transaction history instantly with header configuration controls.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS with custom font family pairings (Inter & JetBrains Mono)
- **Visualization**: Recharts
- **Icons**: Lucide React
- **Runtime Server**: Express + Node.js (Vite Middleware)

## Running the Project

### Installation

Install workspace dependencies:
```bash
npm install
```

### Run Development Environment

Boot the Node.js server along with Vite middleware:
```bash
npm run dev
```
The application will be accessible at [http://localhost:3000](http://localhost:3000).

### Build for Production

Compile static assets and bundle the backend entrypoint:
```bash
npm run build
```

Start the compiled web app:
```bash
npm run start
```
