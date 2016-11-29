# Pryv Service Backup

Backup service for Pryv with simple web app. Must be run behind a Nginx process handling the HTTPS encryption.

## Install

### Node dependencies

Prerequisites: **Node**,**Npm** & **Docker**

- Install Node dependencies: `npm install`
- Generate web app: `node node_modules/grunt/bin/grunt` or `grunt` (if installed globally)

### Docker image

Build it using `npm run docker-build`

## Run

### Production

The production setup requires a configuration file `service-backup.config.json` with the following fields:

```
{
	"pryv": {
		"domain": "pryv.me"
	},
	"db": {
    "path": "/var/pryv/data/service-backup/db-files/",
    "backup": "/var/pryv/data/service-backup/backup/",
    "download": "/var/pryv/data/service-backup/download/"
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
