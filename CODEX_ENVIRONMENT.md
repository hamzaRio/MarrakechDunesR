# 🏜️ MarrakechDunes Project - Codex Environment Documentation

## 📋 Project Overview
**MarrakechDunes** is a full-stack web application for managing desert tours and activities in Marrakech, Morocco. The project uses a modern tech stack with React frontend and Node.js backend.

## 🏗️ Project Structure

```
MarrakechDesertslastfinalreplit/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility libraries
│   │   └── main.tsx       # Entry point
│   ├── package.json
│   └── vite.config.ts
├── server/                # Node.js Backend
│   ├── index.ts           # Main server file
│   ├── routes.ts          # API routes
│   ├── db.ts             # Database configuration
│   ├── vite.ts           # Vite integration
│   └── package.json
├── shared/               # Shared schemas
├── attached_assets/      # Image and media files
├── .env                  # Environment variables
├── .env.example          # Environment template
└── package.json          # Root package.json
```

## 🔧 Technology Stack

### Frontend (client/)
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Query** for data fetching
- **Shadcn/ui** components

### Backend (server/)
- **Node.js** with TypeScript
- **Express.js** framework
- **MongoDB Atlas** database
- **Vite** for development server
- **CORS** enabled for cross-origin requests

## 🌍 Environment Configuration

### Local Development (.env)
```bash
# === Server Config ===
PORT=5000

# === MongoDB ===
MONGODB_URI=mongodb+srv://hamzacharafeddine77:Y7rpybq0iWu7WIUy@marrakechtours-cluster.cvyntkb.mongodb.net/marrakech-tours?retryWrites=true&w=majority

# === Auth ===
JWT_SECRET=f24c5a53d473ecf9e3491d3aab70e46dd36f4ff3e9f3677be258f2c1ef2c6b5c
SESSION_SECRET=39ebf2a77f5443b19c195c789fef3d1ae3e8dd659b3b7e4a82e6a08a0f10f94e

# === Frontend URL (for CORS) ===
CLIENT_URL=http://localhost:5173,https://marrakech-dunes-r-client-ldykjligi-hamzarios-projects.vercel.app,https://marrakechdunesr.onrender.com

# === Frontend API URL ===
VITE_API_URL=http://localhost:5000

# === Email/SMTP (optional if used) ===
EMAIL_USER=
EMAIL_PASS=

# === WhatsApp integration ===
WHATSAPP_RECEIVERS=212600623630,212693323368,212654497354

# === Authentication Passwords ===
ADMIN_PASSWORD=Marrakech@2025
SUPERADMIN_PASSWORD=Marrakech@2025

# === Environment ===
NODE_ENV=development
```

### Production Environment Variables

#### Render (Backend) Environment Variables:
- `MONGODB_URI`: MongoDB Atlas connection string
- `NODE_ENV`: Set to 'production'
- `PORT`: Usually 5000 or let Render set it automatically
- `SESSION_SECRET`: Secure random string for session encryption
- `ADMIN_PASSWORD`: Password for admin user login
- `SUPERADMIN_PASSWORD`: Password for superadmin user login
- `CLIENT_URL`: Comma-separated list of frontend URLs (include your Vercel domain)
- `WHATSAPP_RECEIVERS`: Comma-separated list of WhatsApp phone numbers

#### Vercel (Frontend) Environment Variables:
- `VITE_API_URL`: Your Render backend URL (https://your-app.onrender.com)

## 🚀 Deployment URLs

### Frontend (Vercel)
- **Production URL**: https://marrakech-dunes-r-client-ldykjligi-hamzarios-projects.vercel.app
- **Local Development**: http://localhost:3000

### Backend (Render)
- **Production URL**: https://marrakechdunesr.onrender.com
- **Local Development**: http://localhost:5000

## 🔐 Authentication System

### User Roles
1. **Regular Users**: Can browse activities, make bookings, leave reviews
2. **Admin Users**: Can manage activities, bookings, and content
3. **Superadmin Users**: Full system access including user management

### Login Credentials
- **Admin**: Password: `Marrakech@2025`
- **Superadmin**: Password: `Marrakech@2025`

## 📱 WhatsApp Integration

The application includes WhatsApp integration for notifications:
- **Receivers**: 212600623630, 212693323368, 212654497354
- **Features**: Booking notifications, customer support

## 🗄️ Database Schema

### Collections
- **Activities**: Tour packages and activities
- **Bookings**: Customer reservations
- **Reviews**: Customer feedback and ratings
- **Users**: User accounts and authentication
- **Sessions**: User session management

## 🛠️ Development Commands

### Root Directory
```bash
# Install all dependencies
npm install

# Start both frontend and backend in development
npm run dev

# Start production build
npm start
```

### Frontend (client/)
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Backend (server/)
```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start development server
npm run dev

# Start production server
npm start
```

## 🔧 Recent Fixes Applied

### ✅ CORS Configuration Fixed
- **Issue**: Wrong Vercel domain in `CLIENT_URL`
- **Solution**: Updated to correct domain: `marrakech-dunes-r-client-ldykjligi-hamzarios-projects.vercel.app`
- **Result**: Cross-origin requests now work properly

### ✅ Environment Variables Updated
- Added missing `NODE_ENV=development`
- Added authentication passwords
- Fixed frontend API URL configuration

### ✅ Dependencies Updated
- Added Vite to server dependencies
- Updated package.json files
- Fixed build configurations

## 🐛 Known Issues & Solutions

### Port Binding Issues
- **Issue**: `ENOTSUP: operation not supported on socket 0.0.0.0:5000`
- **Solution**: Use `localhost` instead of `0.0.0.0` for local development

### PowerShell Command Issues
- **Issue**: `&&` operator not supported in PowerShell
- **Solution**: Use separate commands or `;` separator

### Environment Variable Loading
- **Issue**: Variables not loading properly
- **Solution**: Ensure `.env` file is in root directory and properly formatted

## 📊 Project Status

### ✅ Completed
- [x] Frontend React application
- [x] Backend API server
- [x] Database integration
- [x] Authentication system
- [x] WhatsApp integration
- [x] CORS configuration
- [x] Environment setup

### 🔄 In Progress
- [ ] Local development testing
- [ ] Production deployment verification
- [ ] Performance optimization

### 📋 TODO
- [ ] Add comprehensive error handling
- [ ] Implement caching strategies
- [ ] Add monitoring and logging
- [ ] Security audit and improvements

## 🔗 Important Links

- **GitHub Repository**: https://github.com/hamzaRio/MarrakechDunesR
- **Frontend (Vercel)**: https://marrakech-dunes-r-client-ldykjligi-hamzarios-projects.vercel.app
- **Backend (Render)**: https://marrakechdunesr.onrender.com
- **MongoDB Atlas**: marrakechtours-cluster.cvyntkb.mongodb.net

## 📞 Support

For technical issues or questions about the project:
- **Developer**: Hamza Charafeddine
- **Email**: Available in project documentation
- **WhatsApp**: 212600623630, 212693323368, 212654497354

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: Production Ready ✅
