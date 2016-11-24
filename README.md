# Pryv Service Backup

Backup API service for Pryv

## Usage

Prerequisites: __*node*__ & __*npm*__

* Install dependencies: `npm install`
* At the root of the repository, run: `npm start`
* Open the following link in a browser: https://l.rec.la:3443

### Docker

- build `npm run docker-build`

- run `npm run docker-run`

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