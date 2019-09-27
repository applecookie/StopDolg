const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const io = require('socket.io');
// you can pass the parameter in the command line. e.g. node static_server.js 3000
const port = 9000;

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);
    // parse URL
    const parsedUrl = url.parse(req.url);
    // extract URL path
    let pathname = `./panel${parsedUrl.pathname}`;
    // maps file extention to MIME types
    const mimeType = {
        '.ico': 'image/x-icon',
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.wav': 'audio/wav',
        '.mp3': 'audio/mpeg',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.eot': 'appliaction/vnd.ms-fontobject',
        '.ttf': 'aplication/font-sfnt',
    };
    fs.exists(pathname, exist => {
        if (!exist) {
            // if the file is not found, return 404
            res.statusCode = 404;
            res.end(`File ${pathname} not found!`);
            return;
        }
        // if is a directory, then look for index.html
        if (fs.statSync(pathname).isDirectory()) {
            pathname += '/index.html';
        }
        // read file from file system
        fs.readFile(pathname, (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end(`Error getting the file: ${err}.`);
            } else {
                // based on the URL path, extract the file extention. e.g. .js, .doc, ...
                const ext = path.parse(pathname).ext;
                // if the file is found, set Content-type and send data
                res.setHeader('Content-type', mimeType[ext] || 'text/plain');
                res.end(data);
            }
        });
    });
});
const ws = io(server);

let clients = [];
let clientsId = 0;

let state = {};
const stateToErrors = () => Object.keys(state).map(task => state[task]).filter(error => error);
process.on('message', ({task, error}) => {
    state[task] = error;

    if (clients.length) {
        ws.emit('error', stateToErrors());
    }
});

ws.on('connection', socket => {
    const clientId = clientsId++;
    clients.push({
        socket,
        id: clientId,
    });

    ws.emit('error', stateToErrors());

    socket.on('disconnect', () => {
        clients = clients.filter(client => client.id !== clientId);
    });
});

server.listen(port);

console.log(`Server listening on port ${port}`);
