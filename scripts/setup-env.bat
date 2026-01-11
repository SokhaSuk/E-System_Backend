@echo off
echo Creating .env files for all services...
echo.

cd services\auth
if not exist .env (
    copy .env.example .env
    echo Created services\auth\.env
) else (
    echo services\auth\.env already exists
)

cd ..\user
if not exist .env (
    copy .env.example .env
    echo Created services\user\.env
) else (
    echo services\user\.env already exists
)

cd ..\course
if not exist .env (
    copy .env.example .env
    echo Created services\course\.env
) else (
    echo services\course\.env already exists
)

cd ..\attendance
if not exist .env (
    copy .env.example .env
    echo Created services\attendance\.env
) else (
    echo services\attendance\.env already exists
)

cd ..\grade
if not exist .env (
    copy .env.example .env
    echo Created services\grade\.env
) else (
    echo services\grade\.env already exists
)

cd ..\content
if not exist .env (
    copy .env.example .env
    echo Created services\content\.env
) else (
    echo services\content\.env already exists
)

cd ..\..
echo.
echo Done! Now edit each .env file and replace:
echo   - ^<username^> with your MongoDB Atlas username
echo   - ^<password^> with your MongoDB Atlas password
echo   - ^<cluster-url^> with your cluster URL
echo.
echo Example: mongodb+srv://myuser:mypass@cluster0.abc.mongodb.net/e_system_auth
echo.
pause
