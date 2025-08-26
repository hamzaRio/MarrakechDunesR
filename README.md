# MarrakechDunes - Moroccan Adventure Booking Platform

A full-stack web application for booking authentic Moroccan desert adventures and experiences. Features a seamless customer booking journey, comprehensive admin dashboard, and bilingual support.

## Features

- **Customer Experience**: Browse activities, book experiences, receive WhatsApp confirmations
- **Admin Dashboard**: Manage bookings, activities, payments, and performance analytics
- **Bilingual Support**: English and French language support
- **WhatsApp Integration**: Automated notifications to admins and customers
- **Responsive Design**: Mobile-first approach with Moroccan-themed UI
- **Payment Management**: Cash payment tracking with deposit support
- **CI/CD Pipeline**: Automated testing, building, and deployment to test and production environments

## Tech Stack

- **Frontend**: React 18 + TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Node.js + Express, MongoDB/Mongoose
- **State Management**: TanStack Query
- **Build Tools**: Vite, ESBuild
- **Deployment**: Docker, Vercel, Render support
- **CI/CD**: GitHub Actions with automated testing and deployment

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
   - Admin panel: http://localhost:5000/admin/login

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `MONGODB_URI`: MongoDB connection string
- `SESSION_SECRET`: Secure session secret key
- `ADMIN_PASSWORD` / `SUPERADMIN_PASSWORD`: Admin user passwords
- `CLIENT_URL`: Frontend URL for CORS

## Admin Access

**For Development:**
- Default admin accounts are created automatically on first run
- Check the console output for initial credentials
- **⚠️ Always change default passwords in production!**

**For Production:**
- Set `ADMIN_PASSWORD` and `SUPERADMIN_PASSWORD` environment variables
- Use strong, unique passwords
- Enable two-factor authentication if available

## CI/CD Pipeline

This project includes a comprehensive CI/CD pipeline with:

### Environments
- **Test Environment**: Automatic deployment from `develop` branch
- **Production Environment**: Manual deployment from `main` branch

### Features
- Automated testing and type checking
- Security scanning with Trivy
- Performance testing with Lighthouse CI
- Docker image building and deployment
- Automatic rollback capabilities

### Setup
See [CI-CD-README.md](./CI-CD-README.md) for detailed setup instructions.

## Deployment

The project includes deployment configurations for:
- **Docker**: `Dockerfile` and `.dockerignore`
- **Vercel**: `vercel.json` (frontend)
- **Render**: `render.yaml` (backend)
- **GitHub Actions**: Automated CI/CD workflows

## Project Structure

```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared TypeScript types
├── attached_assets/ # Static assets (images)
├── .github/         # GitHub Actions workflows
├── deploy configs   # Docker, Vercel, Render configs
└── CI-CD-README.md  # CI/CD documentation
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking

## Security

- Environment-based configuration
- Rate limiting on API endpoints
- CSRF protection with secure sessions
- Input sanitization and validation
- Secure MongoDB connection handling
- Automated security scanning in CI/CD

## Contributing

1. Fork the repository
2. Create a feature branch from `develop`
3. Make your changes
4. Run tests: `npm test`
5. Create a Pull Request to `develop`
6. Ensure all CI checks pass
7. Get code review approval

## Recent Changes

- **Removed Arabic language support** - Simplified to English and French only
- **Added comprehensive CI/CD pipeline** - Automated testing, building, and deployment
- **Enhanced security** - Automated vulnerability scanning
- **Improved deployment process** - Separate test and production environments

## License

MIT License - see LICENSE file for details