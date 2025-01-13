@echo off

setlocal enabledelayedexpansion

:remove_if_directory_exists
if exist "%~1" (
    rmdir /s /q "%~1"
)

REM Load environment variables
for /f "usebackq delims=" %%x in ("../.env") do (
    set "%%x"
)

set "OAUTH_REPOSITORY=https://oauth2:%GH_ACCESS_TOKEN%@github.com/dusaprotocol/charting_library/"

git clone -q --depth 1 "%OAUTH_REPOSITORY%" tv

if %errorlevel% == 0 (
    echo Clone succeeded
) else (
    echo Clone failed
)

call :remove_if_directory_exists "src/charting_library"

robocopy /E /MOVE "tv\charting_library" "../src/charting_library" /NFL /NDL /NJH /NJS /nc /ns /np

call :remove_if_directory_exists "tv"

exit /b

:remove_if_directory_exists
if exist "%~1" (
    rmdir /s /q "%~1"
)
