#!/usr/bin/env sh

# ./image-load.sh [image_file]

file=$1
sudo docker load < ${file}
