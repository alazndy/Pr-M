# 🚀 Project Management Application

A professional-grade, feature-rich Project Management Application built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Firebase**. This application is designed to streamline project workflows, enhance team collaboration, and provide powerful automation capabilities.

## ✨ Key Features

### 🤖 Automation System

Create powerful workflows to automate repetitive tasks.

- **Triggers**: Time-based (schedules), Event-based (status changes), File-based (uploads).
- **Actions**: Send notifications, send emails, mirror files to Drive, update statuses.
- **Dashboard**: Real-time statistics, execution history, and success rates.

### 👥 Team & Collaboration

Robust tools for managing teams and permissions.

- **Member Management**: Invite users, assign roles (Owner, Admin, Member, Viewer).
- **Task Assignment**: Assign tasks to specific members with visual avatars.
- **Real-time Notifications**: Instant alerts for invitations and updates.

### 📋 Advanced Task Management

Comprehensive system for planning and tracking work.

- **Kanban Board**: Drag-and-drop interface with custom columns.
- **List View**: Detailed task lists with filtering and sorting.
- **Subtasks & Dependencies**: Break down work and track requirements.
- **Time Tracking**: (Coming Soon) Track hours spent on tasks.

### 📁 File Management

Integrated file handling with Google Drive support.

- **Drive Integration**: Upload, organize, and manage files directly.
- **File Preview**: Instant preview for PDFs, Images, Videos, and Google Docs.
- **Smart Organization**: Automatic folder creation for projects.

### 💰 Asset & Budget Tracking

Keep track of project resources and finances.

- **Asset Management**: Track 3D models, designs, and HMI files.
- **Budget Control**: Monitor expenses, categories, and project costs.
- **Equipment Tracking**: Manage hardware and software inventory.

### 🔐 Security & Settings

Enterprise-grade security features.

- **Authentication**: Secure login with Google and Email/Password.
- **Role-Based Access Control (RBAC)**: Granular permissions.
- **Two-Factor Authentication (2FA)**: (Coming Soon) Enhanced account security.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Backend**: [Firebase](https://firebase.google.com/) (Auth, Firestore, Storage)
- **State Management**: React Context & Hooks
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase Project
- Google Cloud Console Project (for Drive API)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/alazndy/Pr-M.git
   cd Pr-M
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory and add your credentials:

   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Google Drive API
   NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID=your_client_id
   NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY=your_api_key
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📱 Screenshots

_(Screenshots to be added)_

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
