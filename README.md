# Pryv Bluebutton service

Example Bluebutton service & web app for users to download all their data. See Pryv Lab instance: https://bluebutton.pryv.me/

![Bluebutton](http://www.healthit.gov/sites/default/files/consumer_big_blue/bb-logo-215x215.jpg "Bluebutton")

To know more about Bluebutton, see [here](https://www.healthit.gov/patients-families/blue-button/about-blue-button).

_Note: Bluebutton service is based on Pryv's command line backup tool 
 https://github.com/pryv/pryv-account-backup. Also, we expect it to be run behind a Nginx process handling the HTTPS encryption._


## Install

Prerequisites: **Node v.8+**,**yarn v0.27+** & **Docker v17+**

_Note: to use the Bluebutton Docker image, you will need a valid Licence.
If you don't have one, please contact Pryv Sales department._

Throughout this procedure, you will have to replace some configuration values, we will refer to them with the following variables:
- **PRYVIO_DOMAIN**: the domain managed by your Pryv.io installation.
- **BLUEBUTTON_CONFIG_FOLDER**: configuration folder that will hold the configuration file (bluebutton.json) created below, make sure to create this folder if not existing.
- **BLUEBUTTON_DATA_FOLDER**: data folder where the backup files will be stored until the user download them, make sure to create this folder if not existing.
- **BLUEBUTTON_PORT**: the port on which you decide to have the Bluebutton service accessible.

Create the configuration file `${BLUEBUTTON_CONFIG_FOLDER}/bluebutton.json`, with the following content :
```
{
  "pryv": {
    "serviceInfoUrl": "${SERVICE_INFO_URL}"
  },
  "db": {
    "path": "/app/data/db-files/",
    "backup": "/app/data/backup/",
    "download": "/app/data/download/"
  },
  "http": {
    "port": 9000,
    "ip": "0.0.0.0"
  }
}
```

Create and run the docker container with the following command line, replacing the variables with your own values :

```shell
$ sudo docker run -d --name pryv_bluebutton -p ${BLUEBUTTON_PORT}:9000 -v ${BLUEBUTTON_DATA_FOLDER}:/app/data/ -v ${BLUEBUTTON_CONFIG_FOLDER}:/app/conf/:ro -ti pryvsa-docker-release.bintray.io/pryv/bluebutton:1.0.15
```

Open your web browser and reach the address of the server on which this service is running, with the port you decided upon to display the Bluebutton web interface.

## Contribute

- Install Node dependencies: `yarn install`
- Build the web app: `yarn build`
- Start the dev server: `yarn start`
- Open the following link in a browser: [http:/127.0.0.1:9000](http://127.0.0.1:9000)
- To run the tests, use `yarn test`

## License

BSD-Revised
