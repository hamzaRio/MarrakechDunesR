# MarrakechDunes - Moroccan Adventure Booking Platform

A full-stack web application for booking authentic Moroccan desert adventures and experiences. Features a seamless customer booking journey, comprehensive admin dashboard, and bilingual support.

## Features

- **Customer Experience**: Browse activities, book experiences, receive WhatsApp confirmations
- **Admin Dashboard**: Manage bookings, activities, payments, and performance analytics
- **Bilingual Support**: Arabic and French language support
- **WhatsApp Integration**: Automated notifications to admins and customers
- **Responsive Design**: Mobile-first approach with Moroccan-themed UI
- **Payment Management**: Cash payment tracking with deposit support

## Tech Stack

- **Frontend**: React 18 + TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Node.js + Express, MongoDB/Mongoose
- **State Management**: TanStack Query
- **Build Tools**: Vite, ESBuild
- **Deployment**: Docker, Vercel, Render support

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd marrakech-dunes
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run the application**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5000
   - Admin login: username: `nadia`, password: `Marrakech@2025` (development only)

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `MONGODB_URI`: MongoDB connection string
- `SESSION_SECRET`: Secure session secret key
- `ADMIN_PASSWORD` / `SUPERADMIN_PASSWORD`: Admin user passwords
- `CLIENT_URL`: Frontend URL for CORS

## Admin Access

**Development credentials:**
- Superadmin: `nadia` / `Marrakech@2025`
- Admin: `ahmed` / `Marrakech@2025`
- Admin: `yahia` / `Marrakech@2025`

**⚠️ Change these passwords in production using environment variables!**

## Deployment

The project includes deployment configurations for:
- **Docker**: `Dockerfile` and `.dockerignore`
- **Vercel**: `vercel.json` (frontend)
- **Render**: `render.yaml` (backend)

## Project Structure

```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared TypeScript types
├── attached_assets/ # Static assets (images)
└── deploy configs   # Docker, Vercel, Render configs
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

## Security

- Environment-based configuration
- Rate limiting on API endpoints
- CSRF protection with secure sessions
- Input sanitization and validation
- Secure MongoDB connection handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see LICENSE file for details