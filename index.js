const express = require ('express')
const cors = require('cors')
const app = express()
const mysql = require('mysql')
const cookieParser = require('cookie-parser')
const PORT = process.env.PORT || 8080;
const WebSocket = require('ws');




const wss = new WebSocket.Server({ port: PORT, perMessageDeflate: false });


const connection = mysql.createConnection({
    host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '2cuErdwPjzvhbTv.root',
    password: 'qpYHPLYC8xfASH2b',
    database: 'mail',
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    }
});

connection.connect((err) => {
    if (err) {
        return console.log(JSON.stringify(err))
    } else {
        return console.log('Connection successful')
    }
})

const corsOptions = {
    origin: (origin, callback) => {
        console.log("origin: ", origin);
        callback(null, true);
    },
    credentials: true,
    optionSuccessStatus: 200
}
const jsonBodyMiddleWare = express.json()

app.use(jsonBodyMiddleWare)
app.use(cors(corsOptions));
// app.use('/auth', cors(corsOptions))

// app.use(cors());
// app.use('/ws', (req, res) => {
//     /* обработка запроса WebSocket */
// });
app.use(cookieParser('secret key'))
// app.use('/auth', authRouter);



app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});









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


async function fetchMessages(ws, userName) {
    try {
        const messages = `SELECT * FROM Messages WHERE recipient_name='${userName}'`;
        connection.query(messages, (error, results) => {
            if (error) throw error;
            ws.send(JSON.stringify({
                action: "fetchMessages",
                message: 'Message transfer was successful',
                data: results,
                statusCode: 200
            }));
        });
    } catch (e) {
        console.log(e);
        ws.send(JSON.stringify({message: 'Get messages error', statusCode: 400}));
    }
}

async function fetchUsers (ws) {
    try {
        const users = `SELECT name FROM Users;`;

        connection.query(users, (error, results) => {
            if (error) throw error;
            ws.send(JSON.stringify({action: "fetchUsers", message: 'Users transfer was successful', data: results, statusCode: 200}));
        });
    } catch (e) {
        console.log(e);
        ws.send(JSON.stringify({message: 'Get users error', statusCode: 400}));
    }
}

async function newMessage(ws, obj) {
    try {
        const {senderName, recipientName, subject, message} = obj.newObj;
        const userQuery = `SELECT * FROM Users WHERE name = '${recipientName}'`;
        const userResults = await new Promise((resolve, reject) => {
            connection.query(userQuery, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
        if (userResults.length === 0) {
            const newUser = `INSERT INTO Users (name) VALUES ('${recipientName}')`;
            await new Promise((resolve, reject) => {
                connection.query(newUser, (error, res) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(res);
                    }
                });
            });
        }
        const newMessage = `INSERT INTO Messages (sender_name, recipient_name, subject, message) VALUES ('${senderName}', '${recipientName}', '${subject}', '${message}')`;
        const results = await new Promise((resolve, reject) => {
            connection.query(newMessage, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
        const messageQuery = `SELECT * FROM Messages WHERE id = ${results.insertId}`;
        const messageResults = await new Promise((resolve, reject) => {
            connection.query(messageQuery, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
        if (messageResults.length > 0) {
            const message = messageResults[0];
            const newMessage = {
                id: message.id,
                sender_name: message.sender_name,
                recipient_name: message.recipient_name,
                subject: message.subject,
                message: message.message,
                created_at: message.created_at
            }
            wss.clients.forEach(function each(client) {
                if (client.userName === message.recipient_name) {
                    client.send(JSON.stringify({action: "sendMessage", message: 'New message', data: newMessage, statusCode: 200}));
                }
            });
        } else {
            ws.send(JSON.stringify({action: "getMessage", message: "Message not found", statusCode: 404}));
        }
    } catch (e) {
        console.log(e);
        ws.send(JSON.stringify({message: 'Send messages error', statusCode: 400}));
    }
}










// app.get("/", (req, res) => {
//     res.json({message: "hi from Express App"})
//     return console.log('Connection closed')
// })

wss.on('listening', () => {
    console.log(`WebSocket server is listening on port ${PORT}`);
});

// app.listen(PORT, () => {
//     console.log(`I started listening port: ${PORT}`)
// })
