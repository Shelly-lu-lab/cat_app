#!/bin/bash

# 设置环境变量
export DASHSCOPE_API_KEY="sk-4b1c8b1d172c4be09827cdf5f83442e5"

# 启动代理服务器
echo "启动代理服务器..."
node server.js &
PROXY_PID=$!

# 等待代理服务器启动
sleep 2

# 启动前端开发服务器
echo "启动前端开发服务器..."
npm run dev &
FRONTEND_PID=$!

# 等待用户中断
echo "开发环境已启动！"
echo "前端服务器: http://localhost:5173"
echo "代理服务器: http://localhost:3001"
echo "按 Ctrl+C 停止所有服务"

# 等待中断信号
trap "echo '正在停止服务...'; kill $PROXY_PID $FRONTEND_PID; exit" INT

# 等待所有后台进程
wait 