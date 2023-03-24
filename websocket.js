const WebSocket = require('ws');
const PORT = process.env.PORT || 8080;

const wss = new WebSocket.Server({ port: PORT, perMessageDeflate: false });

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


module.exports = wss;