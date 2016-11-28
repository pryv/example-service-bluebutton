#!/bin/sh

grunt; docker build --build-arg NODE_ENV=production -t service-backup-app .