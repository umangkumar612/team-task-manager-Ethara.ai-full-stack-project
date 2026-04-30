# 🚀 Team Task Manager (Internet Computer + Motoko)

## 📌 Overview

Team Task Manager is a decentralized full-stack web application built on the Internet Computer using Motoko for backend and React (TypeScript) for frontend.

The app allows users to create projects, assign tasks, and track progress with role-based access (Admin / Member). Instead of traditional backend servers and databases, this project uses canisters (smart contracts) and Internet Identity for authentication.

---

## ✨ Features

* 🔐 Authentication using Internet Identity (secure login)
* 📁 Project creation & management
* 👥 Team management with role-based access (Admin / Member)
* ✅ Task creation and assignment
* 🔄 Task status tracking (To Do, In Progress, Completed)
* 📊 Dashboard:

  * Total tasks
  * Completed tasks
  * Pending tasks
  * Overdue tasks
* ⚡ Decentralized backend (Motoko canister)
* 📱 Responsive UI (React + Tailwind)

---

## 🛠️ Tech Stack

### Frontend

* React.js (TypeScript)
* Tailwind CSS
* Vite

### Backend

* Motoko (Canister-based backend)

### Platform

* Internet Computer (ICP)

### Authentication

* Internet Identity (Passkey-based)

### Storage

* On-chain canister storage (no MongoDB)

---

## 📂 Project Structure

```bash
team-task-manager/
│
├── src/
│   ├── backend/                # Motoko backend (canister logic)
│   │   ├── main.mo             # Entry point
│   │   ├── project.mo          # Project logic
│   │   ├── task.mo             # Task logic
│   │   ├── profile-api.mo      # User APIs
│   │   ├── project-api.mo      # Project APIs
│   │   ├── task-api.mo         # Task APIs
│   │   ├── types/              # Data models
│   │   └── system-idl/         # DID interface files
│   │
│   ├── frontend/               # React frontend
│   │   ├── src/
│   │   │   ├── components/     # UI components
│   │   │   ├── pages/          # Pages (Dashboard, Login, Projects)
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── routes/         # Routing
│   │   │   └── App.tsx         # Main app
│   │   ├── public/             # Static assets
│   │   └── index.html
│
├── declarations/               # Auto-generated canister bindings
├── dfx.json                    # IC config
├── mops.toml                   # Motoko dependencies
├── package.json
└── README.md
```

---

## ⚙️ Setup & Installation

### 1. Install DFX (Internet Computer SDK)

```bash
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
```

---

### 2. Clone Repository

```bash
git clone https://github.com/your-username/team-task-manager.git
cd team-task-manager
```

---

### 3. Install Dependencies

```bash
pnpm install
```

---

### 4. Start Local Internet Computer

```bash
dfx start --background
```

---

### 5. Deploy Canisters

```bash
dfx deploy
```

---

### 6. Run Frontend

```bash
pnpm dev
```

---

### 7. Open Application

```
http://localhost:5173
```

---

## 🔑 Authentication & Authorization

* Uses Internet Identity (no passwords, secure login)
* Role-based access:

  * **Admin**

    * Manage projects
    * Assign tasks
    * Manage members
  * **Member**

    * View tasks
    * Update task status

---

## 🧠 How It Works

* Backend is deployed as a **Motoko canister**
* Frontend communicates using **generated actor bindings**
* No REST APIs — direct method calls to canister
* Data is stored **on-chain inside canister memory**

---

## 🌐 Deployment

Deploy to Internet Computer mainnet:

```bash
dfx deploy --network ic
```

🔗 Live URL: https://verbal-silver-fai-draft.caffeine.xyz/

---

## 🎥 Demo

📹 Demo Video: 

---

## 📌 Future Improvements

* 🔔 Real-time notifications
* 📎 File attachments
* 📈 Advanced analytics dashboard
* 👨‍👩‍👧 Team activity tracking

---

## 👨‍💻 Author

**Umang Kumar**
Final Year CSE Student
Full Stack Developer

---

## 📄 License

This project is developed for academic and assignment purposes.
