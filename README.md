# Ticket Management Portal

A modern web portal for comprehensive technical service ticket management built with React, Tailwind CSS, and Supabase.

## Features

- Role-based authentication (Cliente, Técnico, Admin)
- Interactive Kanban board for technicians
- Comprehensive ticket management
- File attachments and voice notes
- Real-time collaboration
- Analytics dashboards
- Responsive design with fuchsia pink theme

## Tech Stack

- **Frontend**: React 18+ with Vite
- **Styling**: Tailwind CSS v3.4
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Routing**: React Router v6+
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Configure your Supabase credentials in `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Development

Start the development server:
```bash
npm run dev
```

### Build

Build for production:
```bash
npm run build
```

### Preview

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React Context providers
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── services/       # API services and Supabase client
├── utils/          # Utility functions and constants
└── main.jsx        # Application entry point
```

## Environment Variables

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## License

This project is private and proprietary.