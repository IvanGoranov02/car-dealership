# Car Dealership Application

A modern React application for managing a car dealership, built with TypeScript and Material-UI. This application allows users to register, login, create, edit, and delete car listings.

## Features

- User authentication (login, registration, logout)
- Car listing management (create, read, update, delete)
- Responsive design for desktop and mobile devices
- Form validation with Formik and Yup
- Error handling and user notifications
- Infinite scroll for car listings
- Image upload and management
- Protected routes for authenticated users

## Tech Stack

- React 18
- TypeScript
- Material-UI (MUI) for UI components
- React Router for navigation
- Formik & Yup for form handling and validation
- Axios for API calls
- React Toastify for notifications
- Vite for build tooling and development server

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/car-dealership.git
   cd car-dealership
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── assets/        # Static assets (images, icons)
├── components/    # Reusable UI components
│   ├── Header.tsx         # Application header
│   ├── Layout.tsx         # Layout wrapper
│   ├── ListingForm.tsx    # Form for creating/editing listings
│   └── ProtectedRoute.tsx # Route protection for authenticated users
├── context/       # React context providers
│   └── AuthContext.tsx    # Authentication context
├── hooks/         # Custom React hooks
├── pages/         # Page components
│   ├── CreateListingPage.tsx  # Page for creating new listings
│   ├── EditListingPage.tsx    # Page for editing listings
│   ├── ListingsPage.tsx       # Main listings page
│   ├── LoginPage.tsx          # Login page
│   └── RegisterPage.tsx       # Registration page
├── services/      # API services
│   └── api.ts               # API client and service methods
├── types/         # TypeScript type definitions
│   └── index.ts             # Type definitions for the application
└── utils/         # Utility functions
```

## API Integration

The application integrates with a RESTful API for all data operations. The API endpoints include:

- Authentication: `/user/login`, `/user/register`, `/user/logout`
- Listings: `/listing/list`, `/listing/create`, `/listing/{id}`, `/listing/{id}/edit`
- File uploads: `/file/upload`

## Deployment

To build the application for production:

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory.

## Testing

To run tests:

```bash
npm test
# or
yarn test
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
