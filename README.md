# NICU Staffing Wizard

A React-based web application for creating NICU staffing assignment sheets.

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

### Development

Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Building for Production

To create a production build:
```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

To preview the production build locally:
```bash
npm run preview
```

## Features

- Multi-step wizard for creating staffing sheets
- Staff roster management
- Room assignments
- Key role assignments (Charge Nurse, Resource Nurse, etc.)
- Special notes section
- Printable staffing sheet generation

## Project Structure

```
├── src/
│   ├── components/
│   │   └── NICUStaffingWizard.jsx  # Main component
│   ├── App.jsx                      # App wrapper
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Tailwind CSS imports
├── index.html                       # HTML entry point
├── package.json                     # Dependencies
├── vite.config.js                   # Vite configuration
├── tailwind.config.js               # Tailwind configuration
└── postcss.config.js                # PostCSS configuration
```

