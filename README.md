# 🚀 Team Task Manager (Internet Computer + Motoko)

## 📌 Overview

Team Task Manager is a decentralized full-stack web application built on the Internet Computer using Motoko. It allows users to manage projects, assign tasks, and track progress with role-based access control (Admin/Member).

Unlike traditional apps, this project uses Internet Identity for authentication and canister storage instead of JWT and databases like MongoDB.

---

## ✨ Features

* 🔐 Authentication using Internet Identity (secure, passwordless)
* 📁 Project creation & management
* 👥 Team management with roles (Admin / Member)
* ✅ Task creation and assignment
* 🔄 Task status tracking (To Do, In Progress, Completed)
* 📊 Dashboard showing:

  * Total tasks
  * Completed tasks
  * Pending tasks
  * Overdue tasks
* ⚡ Decentralized backend using canisters
* 📱 Responsive UI

---

## 🛠️ Tech Stack

### Frontend

* React.js / Vanilla JS
* HTML, CSS
* Tailwind CSS (optional)

### Backend

* Motoko (Smart contract language)

### Platform

* Internet Computer (ICP)

### Authentication

* Internet Identity (Passkey-based login)

### Storage

* Canister storage (on-chain data)

---

## 🔑 Authentication & Authorization

* Internet Identity is used for secure login (no passwords)
* Role-based access control:

  * **Admin**

    * Create/Delete projects
    * Assign tasks
    * Manage team members
  * **Member**

    * View assigned tasks
    * Update task status

---

## 📂 Project Structure


Go to file
t
T
ui content loaded
.old/src/backend/dist
backend.most
src
backend
dist
backend.did
backend.most
backend.wasm
lib
project.mo
task.mo
mixins
profile-api.mo
project-api.mo
task-api.mo
system-idl
aaaaa-aa.did
types
common.mo
profile.mo
project.mo
task.mo
caffeine.toml
main.mo
frontend
dist
assets
fonts
Figtree.woff2
JetBrainsMono.woff2
SpaceGrotesk.woff2
images
placeholder.svg
index-CL6HPNGg.css
index-xTG7Id-6.js
env.json
favicon.ico
index.html
public
assets
fonts
images
favicon.ico
src
components
ui
accordion.tsx
alert-dialog.tsx
alert.tsx
aspect-ratio.tsx
avatar.tsx
badge.tsx
breadcrumb.tsx
button.tsx
calendar.tsx
card.tsx
carousel.tsx
chart.tsx
checkbox.tsx
collapsible.tsx
command.tsx
context-menu.tsx
dialog.tsx
drawer.tsx
dropdown-menu.tsx
form.tsx
hover-card.tsx
input-otp.tsx
input.tsx
label.tsx
menubar.tsx
navigation-menu.tsx
pagination.tsx
popover.tsx
progress.tsx
radio-group.tsx
resizable.tsx
scroll-area.tsx
select.tsx
separator.tsx
sheet.tsx
sidebar.tsx
skeleton.tsx
slider.tsx
sonner.tsx
switch.tsx
table.tsx
tabs.tsx
textarea.tsx
toggle-group.tsx
toggle.tsx
tooltip.tsx
ConfirmDialog.tsx
Header.tsx
Layout.tsx
ProfileSetupModal.tsx
Sidebar.tsx
StatusBadge.tsx
Toast.tsx
declarations
backend.did.d.ts
backend.did.js
hooks
use-auth.ts
use-backend.ts
use-mobile.tsx
lib
utils.ts
mocks
backend.ts
pages
DashboardPage.tsx
LoginPage.tsx
ProjectDetailPage.tsx
ProjectsPage.tsx
TasksPage.tsx
routes
__root.tsx
dashboard.tsx
index.tsx
login.tsx
projects.$projectId.tasks.tsx
projects.$projectId.tsx
projects.tsx
types
index.ts
App.tsx
backend.d.ts
backend.ts
index.css
main.tsx
biome.json
caffeine.toml
components.json
env.json
index.html
package.json
postcss.config.js
tailwind.config.js
tsconfig.json
vite.config.js
AGENTS.md
DESIGN.md
caffeine.toml
mops.lock
mops.toml
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
project.json
tsconfig.json
```

---

## ⚙️ Installation & Setup

### 1. Install Dependencies

* Install Node.js
* Install DFX SDK (Internet Computer)

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

### 3. Start Local Internet Computer

```bash
dfx start --background
```

---

### 4. Deploy Canisters

```bash
dfx deploy
```

---

### 5. Run Frontend

```bash
npm start
```

---

## 🌐 Deployment

* Deployed using Internet Computer mainnet via DFX

```bash
dfx deploy --network ic
```

🔗 Live URL: *Add your deployed link here*

---

## 📦 Core Functional Modules

### Authentication

* Internet Identity login integration

### Projects

* Create and manage projects
* Assign members

### Tasks

* Create, assign, and update tasks
* Track task status

### Dashboard

* Task statistics and progress tracking

---

## 🎥 Demo

📹 Demo Video: *Add your video link here*

---

## 📌 Future Improvements

* Real-time notifications
* File attachments
* Activity logs
* Advanced analytics dashboard

---

## 👨‍💻 Author

**Umang Kumar**
Final Year CSE Student
Full Stack Developer

---

## 📄 License

This project is for educational and assignment purposes.
