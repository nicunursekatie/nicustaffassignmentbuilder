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
- **Firebase Firestore database** for staff roster storage
- **Staff management page** - Add, edit, and delete staff members with extension numbers
- Room assignments
- Key role assignments (Charge Nurse, Resource Nurse, etc.)
- Special notes section
- Printable staffing sheet generation

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── NICUStaffingWizard.jsx   # Main wizard component
│   │   └── StaffManagement.jsx      # Staff CRUD management
│   ├── services/
│   │   └── staffService.js          # Firestore staff operations
│   ├── firebase.js                  # Firebase configuration
│   ├── App.jsx                      # App wrapper with routing
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Tailwind CSS imports
├── index.html                       # HTML entry point
├── package.json                     # Dependencies
├── vite.config.js                   # Vite configuration
├── tailwind.config.js               # Tailwind configuration
└── postcss.config.js                # PostCSS configuration
```

## Firebase Setup

1. The app uses Firebase Firestore to store staff data
2. On first load, if no staff exists, the app will automatically migrate the initial roster
3. Staff data includes:
   - Last Name (required)
   - First Name (optional)
   - Phone Extension
   - Work Extension Number
   - Role (default: RN)

## Navigation

- `/` - Staffing Wizard (main workflow)
- `/staff` - Staff Management (add/edit/delete staff members)

