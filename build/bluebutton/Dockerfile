FROM pryvsa-docker-release.bintray.io/pryv/base:1.2.13
MAINTAINER "Tech@Pryv" <tech@pryv.com>

RUN echo '### Dockerfile starts ###'

ADD . /pd_build
RUN /pd_build/install.sh

VOLUME /app/data/db-files /app/data/backup

# Ports:
#   9001        bluebutton api
#
EXPOSE 9001

