echo off
set arg1=%1
echo on
node_modules\electron\dist\electron.exe "./out" %arg1%