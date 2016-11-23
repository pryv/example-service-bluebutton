# Pryv Service Backup

Backup API service for Pryv

## Usage

Prerequisites: __*node*__ & __*npm*__

* Install dependencies: `npm install`
* At the root of the repository, run: `npm start`
* Open the following link in a browser: https://l.rec.la:3443

### Docker

- build

run `grunt` then build using `docker build -t service-backup-app .`

- run

`docker run -p 127.0.0.1::5780 -it --rm -v /tmp:/var/pryv --name backup service-backup-app`

`docker run -e "APP_CONFIG=CONFIG_FILE_ABSOLUTE_PATH" -it --rm -v /tmp:/var/pryv --name backup 
service-backup-app`

#### config file

```
{
	"pryv": {
		"domain": "pryv.io"
	},
	"http": {
		"port": 74552
	
}
```