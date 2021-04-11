const http = require('http');
const fs = require('fs');
const config = {
    port: 8090,
    domain: 'localhost',
    pathToTempDB: './db.json',
    allowRequestFromDomain: '*'
}

const server = http.createServer((req, res) => {
    const headers = {
        'Access-Control-Allow-Origin': config.allowRequestFromDomain,
        'Access-Control-Allow-Methods': 'GET', // OPTIONS, POST, GET , ..
        'Access-Control-Max-Age': 2592000, // 30 days
    };
    console.log('\x1b[33m%s\x1b[0m', 'Request URL: ', "\x1b[31m", req.url);

    switch (req.url) {
        case '/videos':
            fs.readFile(config.pathToTempDB, (error, data) => {
                if (error) throw error
                res.writeHead(200, headers);

                db = JSON.parse(data)
                res.write(JSON.stringify(db.videos))
                res.end()
            })
            break;
        case '/photos':
            fs.readFile(config.pathToTempDB, (error, data) => {
                if (error) throw error
                res.writeHead(200, headers);

                db = JSON.parse(data)
                res.write(JSON.stringify(db.photos))
                res.end()
            })
            break;
        case '/shots':
            fs.readFile(config.pathToTempDB, (error, data) => {
                if (error) throw error
                res.writeHead(200, headers);

                db = JSON.parse(data)
                res.write(JSON.stringify(db.shots))
                res.end()
            })
            break;
        case '/contact':
            fs.readFile(config.pathToTempDB, (error, data) => {
                if (error) throw error
                res.writeHead(200, headers);

                db = JSON.parse(data)
                res.write(JSON.stringify(db.contact))
                res.end()
            })
            break;
        default:
            res.writeHead(404, headers); // 1 set Headers
            res.write(JSON.stringify({ status: 'error' })) // 2 set Data to response
            res.end()
            break;
    }
})

server.listen(config.port, config.domain, () => {
    console.log(`The server is running at: http://${config.domain}:${config.port}`)
})
