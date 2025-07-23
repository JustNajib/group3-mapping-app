@echo off
echo Starting backend server...

REM Start the backend server 
node backend\server.js

echo Opening frontend in default browser...

REM Open the HTML file in the default browser
start "" "frontend\index.html"

echo Done.
