# E-System Backend (Node.js + Express + TypeScript)

## Quick start

1. Copy env and install deps
```
cp .env.example .env
npm install
```

2. Run in dev
```
npm run dev
```

3. Build and run
```
npm run build
npm start
```

## API

- POST /api/auth/register { fullName, email, password, role? }
- POST /api/auth/login { email, password }
- GET /api/admin/users (admin only)
- GET /api/teacher/classes (teacher/admin)
- GET /api/student/courses (student/admin)

Send Authorization: Bearer <token> for protected endpoints.

### Admin signup
- Set `ADMIN_SIGNUP_CODE` in your `.env`
- While registering with role `admin`, include `adminCode` matching that value


