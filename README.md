# Shreya's Portfolio

A personal developer portfolio showcasing my projects, technical skills, and work. Built with React and Vite, with a backend-powered contact form.

🌐 **Live Website:** https://shreya-portfolio-eight-alpha.vercel.app

## Overview

This portfolio presents my projects and provides a way for visitors and recruiters to contact me. It combines a responsive React frontend with an Express backend and a PostgreSQL database.

## Features

- Responsive portfolio website
- Project showcase and individual case-study pages
- React-based frontend built with Vite
- Contact form with server-side validation
- PostgreSQL database integration using Supabase
- Email notifications for contact-form submissions using Resend
- API rate limiting and CORS configuration
- Production deployment on Vercel and Render

## Tech Stack

**Frontend**
- React
- Vite
- JavaScript
- CSS

**Backend**
- Node.js
- Express.js
- PostgreSQL
- `pg`
- `express-rate-limit`
- `resend`

**Database and Services**
- Supabase — PostgreSQL database
- Vercel — frontend hosting
- Render — backend hosting
- Resend — email notifications

## Project Structure

```text
portfolio-react/
├── public/
│   └── assets/
├── src/
│   ├── components/
│   ├── App.jsx
│   └── main.jsx
├── backend/
│   ├── server.js
│   ├── package.json
│   └── supabase-ca.crt
├── index.html
├── package.json
├── vercel.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/vishreyko1215/shreya-portfolio.git
cd shreya-portfolio
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Run the frontend

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually `http://localhost:5173`.

## Backend Setup

The contact form uses a separate Express backend.

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

Create a `.env` file inside the `backend/` directory with the following variables:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173

DB_HOST=your_database_host
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password

RESEND_API_KEY=your_resend_api_key
```

Use your own database connection details and Resend API key. Never commit `.env` files or secret credentials to GitHub.

The backend also requires the Supabase CA certificate at `backend/supabase-ca.crt` for local database connections. In production, the certificate is configured as a Render secret file.

### 3. Start the backend

From the `backend/` directory, run:

```bash
npm start
```

The backend defaults to `http://localhost:5000`.

### API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend and database connectivity |
| POST | `/api/contact` | Validate and save contact messages |

Contact messages are stored in the Supabase PostgreSQL database. Resend is used to send email notifications when a visitor submits the form.

## Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Supabase
- **Email notifications:** Resend

The frontend and backend are deployed separately. Production environment variables and database credentials are configured through the hosting service dashboards.

## Future Improvements

- Add more project case studies
- Continue improving accessibility and responsive design
- Expand the portfolio with new projects and experiments

## Author

**Shreya**

- Portfolio: https://shreya-portfolio-eight-alpha.vercel.app
- GitHub: https://github.com/vishreyko1215

---

Built with React, Vite, and a lot of learning along the way.
