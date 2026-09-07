# Threadwise

A comprehensive full-stack task and thread management application designed to keep your projects organized and your team in sync.

## Features

- **Thread Management**: Organize discussions and tasks into distinct threads.
- **Smart Task Dashboard**: Automatically categorizes threads into Needs Action (Overdue, Due Today, Upcoming).
- **Task Tracking**: Create, assign, and track tasks with priorities (Low, Medium, High) and due dates.
- **People & Associations**: Link team members to threads and dynamically assign them to specific follow-up tasks.
- **Context & Notes**: Add rich context notes within the timeline of any thread.
- **Notifications System**: Stay updated with a dedicated notifications center for assigned tasks and updates.
- **Responsive Design**: Beautiful, premium UI that works seamlessly across desktop and mobile devices.

## Project Structure

The project is structured as a monorepo containing both the frontend and backend code:

- `/Threadwise` - The Frontend React application (built with Vite)
- `/backend` - The Backend Node.js / Express API

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn
- A configured database (e.g., PostgreSQL/MySQL as required by the backend)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   Create a `.env` file in the `backend/` directory with the following variables:
   ```env
   PORT=5000
   JWT_SECRET=your_jwt_secret_here
   DATABASE_URL=postgresql://user:password@localhost:5432/your_database
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd Threadwise
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the `Threadwise/` directory:
   ```env
   VITE_API_URL=http://localhost:3000
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Tech Stack

- **Frontend**: React, Vite, CSS Modules
- **Backend**: Node.js, Express
- **Routing**: React Router DOM
- **HTTP Client**: Axios

