# TaskFlow - Full-Stack Kanban Task Board

A responsive, lightweight task management board built with React, Node.js, Express, and SQLite. Designed with a custom 3D-aesthetic UI and robust API architecture.

## 🚀 Live Demo & Repository
- **Live Website:** https://taskflow-assignment-three.vercel.app/
- **GitHub Repository:** https://github.com/Anaveer/taskflow-assignment

## 🛠️ Tech Stack
- **Frontend:** React (Vite), Axios, Custom CSS (No external component libraries)
- **Backend:** Node.js, Express.js
- **Database:** SQLite3
- **Testing:** Jest, Supertest
- **Deployment:** Vercel (Frontend), Render (Backend)

## ✨ Core Features Implemented
1. **Full CRUD Operations:** Users can create, view, edit, and delete tasks.
2. **Task Movement (Dropdown):** Prioritized a robust, bug-free dropdown approach for moving tasks across columns ("To Do", "In Progress", "Done") to ensure perfect mobile accessibility and functional reliability.
3. **Data Persistence:** All changes are instantly saved to a real backend SQLite database.
4. **Filtering & Search:** Users can filter tasks by Priority (High, Medium, Low) and search by Task Title simultaneously.
5. **Form Validation:** Both frontend and backend validate that empty tasks cannot be created.

## 🧠 Assumptions, Trade-offs & Deployment Notes
- **Column Management:** Assuming the standard 3 columns are sufficient for the scope. They are auto-seeded on the first boot.
- **Drag-and-Drop vs Dropdown:** Opted for a dropdown inside the modal instead of drag-and-drop. This ensures better accessibility and a 100% bug-free experience given the strict time constraint.
- **Render.com Deployment Quirk (Important):** Due to AWS EC2 expiration, the backend is deployed on Render's Free Tier. Render spins down inactive instances and uses an *ephemeral disk*. This means the SQLite database will reset to its initial state (with seeded columns) upon cold starts after periods of inactivity. However, the logic and database schema are fully functional and persist data properly during active browsing sessions.

## 📈 What I'd Improve with More Time
- Implement native HTML5 drag-and-drop for task cards on desktop views.
- Add user authentication and multiple distinct boards.
- Migrate the database from SQLite to a managed PostgreSQL instance (e.g., AWS RDS or Supabase) to bypass Render's ephemeral storage limitations.

## 💻 Local Setup Instructions

**Prerequisites:** Node.js installed on your machine.

