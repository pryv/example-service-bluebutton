FROM node:4-onbuild

# app default port
EXPOSE 5780


ENV APP_CONFIG "/var/pryv/service-backup.config.json"
ENV NODE_ENV production