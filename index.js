const express = require('express');
const fs = require('fs-extra');
const { v4: uuid } = require('uuid');

const EventEmitter = require('./EventEmitter');

const app = express();
const eventEmitter = new EventEmitter();

function isAuthorized(req, res, next) {
    const auth = req.headers.authorization;
    let token = '';

    if (auth && auth.includes('bearer')) {
        token = auth.split(" ")[1].trim();
    }

    if (token === 'SdIDrtFY=6Sd?fg7D/yF87') {
        next();
    } else {
        res.status(401);
        res.send('Unauthorized');
    }
}

async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    }).catch(function () { });
}

async function main() {
    while (true) {
        const waitTimeMS = Math.floor(Math.random() * 10000);
        await sleep(waitTimeMS);
        console.log('Fire event')
        eventEmitter.fire({ time: waitTimeMS });
    }
}

const server = app.listen(8080, () => {
    var host = server.address().address
    var port = server.address().port
    
    host = host === '::' ? '127.0.0.1' : host;
    console.log("Api is listening at http://%s:%s", host, port);
    main();
});

app.get('/', isAuthorized, (request, response) => {
    const id = uuid();
    var timer = null;

    const handler = async (event) => {
        clearTimeout(timer);
        // mock heavy calculations
        await sleep(20000);
        console.log('event', event);
        return event;
    };

    eventEmitter.register(id, handler);

    timer = setTimeout(function () {
        console.log('timeout');
        response.status(202);
        response.json({
            resultsUrl: `http://127.0.0.1:8080/getresult/${id}`
        })
        response.end();
    }, 25);

    const event = eventEmitter.getEvent(id);

    if (event.status === 'Finished') {
        response.status(200);
        response.json(event);
        response.end();
    }
})

app.get('/getresult/:id', (request, response) => {
    const id = request.params.id

    const event = eventEmitter.getEvent(id);

    const status = event.status === 'Pending' ? 202 : 200;

    response.status(status);
    response.json(event);
    response.end();
})
