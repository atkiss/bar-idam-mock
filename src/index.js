import http from 'http';
import https from 'https';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import initializeDb from './db';
import middleware from './middleware';
import details from './api/details';
import config from './config.json';
import fs from 'fs';
import path from 'path'

const options = {
  key: fs.readFileSync('./server.key'),
  cert: fs.readFileSync('./server.cert')
};

let app = express();
let server = http.createServer(options, app);
app.server = server;

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(cors({
	exposedHeaders: config.corsHeaders
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const caching = {cacheControl: true, setHeaders: (res) => res.setHeader('Cache-Control', 'max-age=604800')};
const webchatPath = path.join(__dirname, '../node_modules/@hmcts/ctsc-web-chat/assets');
app.use('/public/webchat', express.static(webchatPath, caching));

const webchatHtml = path.join(__dirname, '../resources/webchat.html')
app.use('/web', (req, resp) => resp.sendFile(webchatHtml));

// connect to db
initializeDb( db => {

	//populate db
	fs.readFile('./resources/users.json', function (err, data) {
		if (err) throw err;
		let users = JSON.parse(data);
		users.forEach((element) => {		
			db.insert(element);
		});
	});

	// internal middleware
	app.use(middleware({ config, db }));

	// check bearer
	app.use('/', details({ config, db }));

	server.listen(process.env.PORT || config.port, () => {
		console.log(`Started on port ${server.address().port}`);
	});
});

export default app;
