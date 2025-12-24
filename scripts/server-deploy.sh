#!/bin/bash
set -e

# 部署配置
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/qm-photo-admin}"
BACKUP_DIR="/tmp/frontend-backup-$(date +%Y%m%d-%H%M%S)"
NGINX_USER="${NGINX_USER:-www-data}"

echo "🚀 开始部署前端项目..."

# 备份当前版本
if [ -d "$DEPLOY_PATH" ]; then
  echo "📦 备份当前版本到: $BACKUP_DIR"
  mkdir -p "$BACKUP_DIR"
  cp -r "$DEPLOY_PATH"/* "$BACKUP_DIR/" 2>/dev/null || true
fi

# 创建部署目录
echo "📂 创建部署目录..."
mkdir -p "$DEPLOY_PATH"

# 解压部署包
if [ -f "/tmp/deploy.tar.gz" ]; then
  echo "📥 解压部署包..."
  cd "$DEPLOY_PATH"
  tar -xzf /tmp/deploy.tar.gz
  rm -f /tmp/deploy.tar.gz
else
  echo "❌ 未找到部署包: /tmp/deploy.tar.gz"
  exit 1
fi

# 设置文件权限
echo "🔐 设置文件权限..."
chown -R ${NGINX_USER}:${NGINX_USER} "$DEPLOY_PATH" || true
chmod -R 755 "$DEPLOY_PATH"

# 清理旧备份（保留最近 5 个）
echo "🧹 清理旧备份..."
ls -dt /tmp/frontend-backup-* 2>/dev/null | tail -n +6 | xargs rm -rf 2>/dev/null || true

echo "✅ 部署完成！"
echo "部署路径: $DEPLOY_PATH"
echo "备份路径: $BACKUP_DIR"


