import express from 'express';
import bodyParser from 'body-parser';
import AppRouter from './router';
import dotenv from 'dotenv';
import m from 'mongoose';
import { setEnv } from './library/apps';

const app = express();
dotenv.config();

// connection mongodb
m.connect(process.env?.MONGOURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
if (process.env.DEV === 'true') {
    app.use('/', (req, res, next) => {
        res.set("Access-Control-Allow-Origin", '*')
        res.set("Access-Control-Allow-Methods", 'GET, POST, OPTIONS, HEAD, DELETE')
        res.set("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, usefirebaseauth, srawungtoken, Accept, Develop-by, bb-token, User-Agent, Content-Disposition")
        res.set("Access-Control-Expose-Headers", '*');
        if (req.method.toLowerCase() === 'options') {
            res.end('OKE');
        }
        else {
            next();
        }
    });
}

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(AppRouter);

// router api
app.use((req, res, next) => {
    res.json({ error: 404, message: "Method Not Found!" });
})

setEnv({ ...process.env });

// listen
app.listen(process.env.PORT, process.env.IP, () => console.log(`server running on port ${process.env.PORT}, ip ${process.env.IP}`))
