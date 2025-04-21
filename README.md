# Cursor Interpreter SPA

A simple Single Page Application built with modern web technologies following KISS, DRY, and YAGNI principles.

## Project Overview

This project is a modern React Single Page Application with a clean, minimalist structure. It provides a starting point for web application development with a basic layout structure including header, content area, and footer.

## Technologies Used

- **React**: Frontend library for building user interfaces
- **Vite**: Fast, modern build tool and development server
- **React Router**: Client-side routing for single page applications
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **ESLint**: Code linting and style enforcement

## Directory Structure

```
cursorinterpreter-spa/
├── public/               # Static files
├── src/                  # Source code
│   ├── components/       # Reusable UI components
│   │   ├── Header.jsx    # Application header
│   │   ├── Footer.jsx    # Application footer
│   │   └── Layout.jsx    # Main layout component (with Outlet)
│   ├── pages/            # Page components
│   │   └── Home.jsx      # Homepage component
│   ├── App.jsx           # Root component with router setup
│   ├── main.jsx          # Application entry point
│   └── index.css         # Global styles with Tailwind directives
├── index.html            # HTML entry point
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
├── vite.config.js        # Vite configuration
├── eslint.config.js      # ESLint configuration
└── package.json          # Project dependencies and scripts
```

## Design Decisions

1. **JavaScript Only**: Chose JavaScript over TypeScript for simplicity
2. **Component Structure**: Separated layout components from page content
3. **React Router**: Used for client-side navigation between pages
4. **Tailwind CSS**: Used for styling with utility classes
5. **Flexible Layout**: Created with responsive design in mind

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## Getting Started

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start development server
4. Open http://localhost:5173 in your browser
