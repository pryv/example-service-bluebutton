FROM pryv/base:1.2.7
MAINTAINER "Tech@Pryv" <tech@pryv.com>

RUN echo '### Dockerfile starts ###'

ADD . /pd_build
RUN /pd_build/install.sh

VOLUME /app/data/db-files /app/data/backup

# Ports:
#   9000        bluebutton api
#
EXPOSE 9000

