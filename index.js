const express = require ('express')
const cors = require('cors')
const app = express()
const mysql = require('mysql')
const cookieParser = require('cookie-parser')
const wss = require('./websocket');
const PORT = process.env.PORT || 8080;


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
