
# AgroNond Frontend 🖥️

The React client application for the AgroNond platform.

## 🛠 Tech Stack

- **Framework**: React + Vite
- **Styling**: TailwindCSS
- **State Management**: React Context + TanStack Query
- **Routing**: React Router DOM
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📂 Directory Structure

```
src/
├── components/     # Application components
│   ├── ui/         # Generic UI (Buttons, Cards)
│   ├── layout/     # Layouts (Navbar, Sidebar)
│   ├── navigation/ # Role-based Navbars
│   └── auth/       # Auth guards
├── pages/          # Page components by feature
├── context/        # Global context (Auth)
├── lib/            # Utilities & API client
└── assets/         # Images and static files
```

## 🚀 Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Setup**
    Create `.env.local`:
    ```env
    # Optional: Override backend URL
    # VITE_API_URL=http://localhost:5000/api
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 📜 Available Scripts

- `npm run dev`: Start dev server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint
