# Pryv Service Bluebutton

Bluebutton service for Pryv with simple web app: https://bluebutton.pryv.me/

![Bluebutton](http://www.healthit.gov/sites/default/files/consumer_big_blue/bb-logo-215x215.jpg "Bluebutton")

To know more about Bluebutton, see [here](https://www.healthit.gov/patients-families/blue-button/about-blue-button).
Must be run behind a Nginx process handling the HTTPS encryption.

## Contribute

### Install

Prerequisites: **Node v.8+**,**yarn v0.27+** & **Docker v17+**

- Install Node dependencies: `yarn install`
- Generate web app: `yarn run gen-app`

### Docker image

Build it using `yarn run docker-build`

## Run

### Production

The production setup requires a configuration file `service-bluebutton.config.json` with the following fields:

```
{
	"pryv": {
		"domain": "pryv.me"
	},
	"db": {
    "path": "/var/pryv/data/service-bluebutton/db-files/",
    "backup": "/var/pryv/data/service-bluebutton/backup/",
    "download": "/var/pryv/data/service-bluebutton/download/"
  }
}
```

- Build the image using `./scripts/docker-build.sh`

- Run the container using `./script/docker-run.sh ${PathToConfigDir}`

- Open the following link in a browser: [http://127.0.0.1:5880](http://127.0.0.1:5880)

### Development

#### Node app

- At the root of the repository, run: `npm start`
- Open the following link in a browser: [http://0.0.0.0:5780](http://0.0.0.0:5780) **(Warning: app accessible from anyone on the same subnet)**

#### Docker container 

- Build image `npm run docker-build`

- Run container `npm run docker-run`

- Open the following link in a browser: [http://127.0.0.1:5880](http://127.0.0.1:5880)

#### Run tests

Use `npm test` to run the tests

## License

BSD-Revised