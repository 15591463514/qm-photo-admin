#!/bin/bash

# ============================================
# 前端部署脚本
# ============================================
# 功能：
# 1. 构建前端资源
# 2. 构建 Docker 镜像
# 3. 启动 Nginx 容器
# ============================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

echo -e "${GREEN}开始部署前端服务...${NC}"

# 检查 Docker 镜像源配置
echo -e "${YELLOW}检查 Docker 镜像源配置...${NC}"
if ! docker info | grep -q "dmhnthr3.mirror.aliyuncs.com"; then
    echo -e "${YELLOW}提示: 建议配置 Docker 镜像源以加速构建，参考: docs/docker-mirror-config.md${NC}"
fi

# 1. 检查环境变量文件
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}警告: .env.production 文件不存在，使用默认配置${NC}"
fi

# 2. 构建 Docker 镜像（包含前端构建）
echo -e "${YELLOW}[1/2] 构建 Docker 镜像（包含前端构建）...${NC}"
docker-compose build --no-cache nginx

# 3. 启动 Nginx 容器
echo -e "${YELLOW}[2/2] 启动 Nginx 容器...${NC}"

# 检查网络是否存在，不存在则创建
if ! docker network ls | grep -q qm-photo-network-prod; then
    echo "创建 Docker 网络..."
    docker network create qm-photo-network-prod
fi

docker-compose up -d nginx

# 等待服务启动
echo "等待服务启动..."
sleep 3

# 4. 健康检查
echo -e "${YELLOW}执行健康检查...${NC}"
MAX_RETRIES=5
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker exec qm-photo-admin-prod wget --no-verbose --tries=1 --spider http://localhost/ 2>/dev/null; then
        echo -e "${GREEN}✓ 服务健康检查通过${NC}"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo "健康检查失败，重试 $RETRY_COUNT/$MAX_RETRIES..."
        sleep 2
    fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}✗ 健康检查失败，请查看日志${NC}"
    docker-compose logs nginx
    exit 1
fi

# 5. 显示服务状态
echo -e "${GREEN}部署完成！${NC}"
echo ""
echo "服务状态："
docker-compose ps

echo ""
echo "查看日志："
echo "  docker-compose logs -f nginx"
echo ""
echo "访问地址："
echo "  http://localhost:80"

