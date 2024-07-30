#!/usr/bin/env sh

commitId=$1
container_id=registry.localdev:5002/bobabrewery/portal-api:0.0.1-snapshot-${commitId}
echo "container_id=${container_id}"
docker image  save -o portal-api.tar ${container_id}
