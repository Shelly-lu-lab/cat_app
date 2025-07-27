#!/bin/bash

# AI云养猫项目快速启动脚本
echo "🚀 启动AI云养猫开发服务器..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在ai-cat-app目录中运行此脚本"
    exit 1
fi

# 检查端口是否被占用
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口5173已被占用，尝试使用其他端口..."
    npm run dev -- --port 5174
else
    echo "✅ 端口5173可用，启动服务器..."
    # 使用watch模式，文件变化时自动重启
    npm run dev -- --watch
fi 