#!/bin/sh

if [ "$#" == "0" ]; then
   echo "No arguments provided"
   echo "Usage: ./scripts/docker-run.sh <Path to config dir>\n" \
   "<Path to config dir> should contain service-backup.config.json\n"
   exit 1
fi

echo "Docker container listening on port 5880"

docker run -p 127.0.0.1:5880:5780 -it -v $1:/var/pryv/ --rm --name backup service-backup-app

