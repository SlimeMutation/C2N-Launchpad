#!/usr/bin/env sh

module_name=portal-api

set -a
source ../docker_build.env
set +a

echo "================================================="
echo "image_prefix:${image_prefix}"
echo "================================================="

tag_name=${1:-'0.0.1-snapshot'}

commitId=`git rev-parse --short HEAD`
tag_name=${tag_name}-${commitId}

echo "module_name:${module_name}"
echo "tag_name:${tag_name}"

target_tag=${image_prefix}/${module_name}:${tag_name}
echo "target_tag:${target_tag}"

docker build -t ${target_tag} .

