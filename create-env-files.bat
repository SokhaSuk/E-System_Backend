@echo off
echo Creating .env files for all services...
echo.

REM Auth Service
(
echo PORT=4001
echo MONGO_URI=mongodb+srv://sokhasuk2004_db_user:lxYGL3A4iHB9uRKR@E-System_Backend.zuwkqyn.mongodb.net/e_system_auth?retryWrites=true^&w=majority
echo JWT_SECRET=H8r!xP3v@Q2zL7fW#s9tB6mN1yU0cD5k
echo JWT_EXPIRES_IN=7d
echo ADMIN_SIGNUP_CODE=admin123
echo NODE_ENV=development
) > services\auth\.env
echo Created: services\auth\.env

REM User Service
(
echo PORT=4002
echo MONGO_URI=mongodb+srv://sokhasuk2004_db_user:lxYGL3A4iHB9uRKR@E-System_Backend.zuwkqyn.mongodb.net/e_system_user?retryWrites=true^&w=majority
echo NODE_ENV=development
) > services\user\.env
echo Created: services\user\.env

REM Course Service
(
echo PORT=4003
echo MONGO_URI=mongodb+srv://sokhasuk2004_db_user:lxYGL3A4iHB9uRKR@E-System_Backend.zuwkqyn.mongodb.net/e_system_course?retryWrites=true^&w=majority
echo USER_SERVICE_URL=http://localhost:4002
echo NODE_ENV=development
) > services\course\.env
echo Created: services\course\.env

REM Attendance Service
(
echo PORT=4004
echo MONGO_URI=mongodb+srv://sokhasuk2004_db_user:lxYGL3A4iHB9uRKR@E-System_Backend.zuwkqyn.mongodb.net/e_system_attendance?retryWrites=true^&w=majority
echo COURSE_SERVICE_URL=http://localhost:4003
echo USER_SERVICE_URL=http://localhost:4002
echo NODE_ENV=development
) > services\attendance\.env
echo Created: services\attendance\.env

REM Grade Service
(
echo PORT=4005
echo MONGO_URI=mongodb+srv://sokhasuk2004_db_user:lxYGL3A4iHB9uRKR@E-System_Backend.zuwkqyn.mongodb.net/e_system_grade?retryWrites=true^&w=majority
echo COURSE_SERVICE_URL=http://localhost:4003
echo USER_SERVICE_URL=http://localhost:4002
echo NODE_ENV=development
) > services\grade\.env
echo Created: services\grade\.env

REM Content Service
(
echo PORT=4006
echo MONGO_URI=mongodb+srv://sokhasuk2004_db_user:lxYGL3A4iHB9uRKR@E-System_Backend.zuwkqyn.mongodb.net/e_system_content?retryWrites=true^&w=majority
echo COURSE_SERVICE_URL=http://localhost:4003
echo USER_SERVICE_URL=http://localhost:4002
echo GEMINI_API_KEY=AIzaSyBgSJP4wdo20_TutsrdLqW_04-9MuKIPPI
echo NODE_ENV=development
) > services\content\.env
echo Created: services\content\.env

echo.
echo ========================================
echo All .env files created successfully!
echo ========================================
echo.
echo To view the files, use: dir /a services\auth
echo Or open them in VS Code
echo.
pause
