@echo off
REM 快捷入口：从项目根目录打开游戏首页
setlocal
pushd "%~dp0"
set "GAME_PATH=%CD%\index.html"
start "" "%GAME_PATH%"
popd
endlocal
