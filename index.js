const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 5000;
const PORTWS = process.env.PORTWS || 8080;
const {wss, fetchMessages, newMessage, fetchUsers} = require('./websocketFunction');
const authRouter = require('./authRouter')


const corsOptions = {
    origin: (origin, callback) => {
        console.log("origin: ", origin);
        callback(null, true);
    },
    credentials: true,
    optionSuccessStatus: 200
};
const jsonBodyMiddleWare = express.json();

app.use(jsonBodyMiddleWare);
app.use(cors(corsOptions));
app.use(cookieParser('secret key'));

app.use(cookieParser('secret key'))
// app.use('/auth', authRouter);

wss.on('connection', function connection(ws) {
    console.log('client connected');

    ws.on('message', function incoming(data) {
        const obj = JSON.parse(data);
        if (obj.action === 'fetchMessages') {
            fetchMessages(ws, obj.userName);
        }
        if (obj.action === 'sendMessage') {
            newMessage(ws, obj)
        }
        if (obj.action === 'setUserName') {
            ws.userName = obj.userName
        }
        if (obj.action === 'fetchUsers') {
            fetchUsers(ws);
        }
    });
    ws.send(JSON.stringify('Hello, client!'));
});

wss.on('listening', () => {
    console.log(`WebSocket server is listening on port ${PORTWS}`);
});

// app.listen(PORT, () => {
//     console.log(`I started listening port: ${PORT}`)
// })

