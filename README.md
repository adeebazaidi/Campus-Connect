# CampusConnect – Smart College Complaint Portal 🎓

A modern, full-stack MERN application that centralizes student, staff, and administrator complaint workflows. Features secure authentication, role-based dashboards, complaint tracking, comment threads, and media uploads backed by Cloudinary.

![CampusConnect](https://img.shields.io/badge/CampusConnect-v1.0-blue)
![React](https://img.shields.io/badge/React-19.2-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen)

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based authentication with role-based access control
- 👥 **Role-Based Dashboards** - Tailored experiences for Students, Staff, and Admins
- 📝 **Complaint Management** - Submit, track, and manage complaints with status updates
- 💬 **Real-time Comments** - Contextual comment threads for each complaint
- 📎 **File Attachments** - Upload and manage attachments via Cloudinary
- 🎨 **Modern UI/UX** - Beautiful, responsive design with smooth animations
- 📊 **Analytics Dashboard** - Admin dashboard with system-wide statistics
- 🔄 **CRUD Operations** - Complete Create, Read, Update, Delete functionality

## 🛠️ Tech Stack

### Frontend
- **React 19.2** - Modern React with Hooks
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express 5.1** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Multer** - File upload handling
- **Cloudinary** - Cloud-based media management
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
Campus-Connect/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # Context providers
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx        # Main app component
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express backend
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── index.js           # Server entry point
│   └── package.json
├── .env.example           # Environment variables template
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** instance (local or MongoDB Atlas)
- **Cloudinary** account (for file uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Campus-Connect
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # MongoDB Connection
   MONGO_URI=mongodb://localhost:27017/campusconnect
   # Or use MongoDB Atlas:
   # MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/campusconnect?retryWrites=true&w=majority
   
   # JWT Secret
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   
   # Server Port
   PORT=5000
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Frontend API URL
   VITE_API_BASE_URL=http://localhost:5000
   ```

4. **Start the development servers**

   **Option 1: Run both servers separately**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   
   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

   **Option 2: Run both from root**
   ```bash
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile

### Complaints
- `POST /api/complaints` - Create new complaint (with attachments)
- `GET /api/complaints/my` - Get user's complaints
- `GET /api/complaints/all` - Get all complaints (admin/staff)
- `GET /api/complaints/:id` - Get complaint details
- `PATCH /api/complaints/:id/status` - Update complaint status
- `PATCH /api/complaints/:id/assign` - Assign complaint to staff (admin)
- `DELETE /api/complaints/:id` - Delete complaint

### Comments
- `POST /api/comments/:complaintId` - Add comment to complaint
- `GET /api/comments/:complaintId` - Get comments for complaint

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/stats` - Get system statistics (admin only)

## 🎨 UI Features

- **Modern Design** - Gradient backgrounds, smooth animations, and glassmorphism effects
- **Responsive Layout** - Works seamlessly on desktop, tablet, and mobile
- **Interactive Components** - Hover effects, transitions, and loading states
- **Color-Coded Status** - Visual status indicators for complaints
- **User Avatars** - Profile pictures with initials
- **Real-time Updates** - Instant feedback on actions

## 👤 User Roles

### Student
- Submit complaints with attachments
- View own complaints and status
- Add comments to own complaints
- Track complaint progress

### Staff
- View assigned complaints
- Update complaint status
- Add comments to assigned complaints
- Manage complaint workflow

### Admin
- View all complaints
- Assign complaints to staff
- Update any complaint status
- View system statistics
- Manage users

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected routes and middleware
- Role-based access control
- Input validation and sanitization

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or Atlas connection string is correct
- Check firewall settings for Atlas connections

### Cloudinary Upload Issues
- Verify Cloudinary credentials in `.env`
- Check file size limits (default: 5MB)

### Port Conflicts
- Change `PORT` in `.env` if 5000 is occupied
- Update `VITE_API_BASE_URL` accordingly

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Support

For support, email support@campusconnect.com or create an issue in the repository.

---

**Built with ❤️ for better campus management**
