echo off
set arg1=%1
echo on

%~dp0node_modules\electron\dist\electron.exe "%~dp0out" %arg1%