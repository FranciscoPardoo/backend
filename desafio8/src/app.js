import express from "express";
import compression from"express-compression";
import  {Server}  from "socket.io";
import socketserv from "./socketinteract.js";
import handlebars from 'express-handlebars'
import path from 'path';
import __dirname from './utils.js';
import session from 'express-session';
import cors from "cors"
import mongoConnect from "./db/db.mongo.js"
import MongoStore from 'connect-mongo'
import "dotenv/config.js";
import cookieParser from 'cookie-parser'
import router from "./routes/router.js"
import errorHandler from "./middlewares/handle.errors.js"

const app = express();
const port =3000;
app.use(compression({
    broli:{enable:true,zlib:{}}
}))
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors());

mongoConnect();

app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'handlebars');
app.use(express.static(__dirname+'/public'));
app.use(cookieParser());

app.use(session({
    secret:process.env.KEYSECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl:process.env.MONGODB_URL,
        ttl: 4*120,
        autoRemove:"native"    
    }),
}));

router(app);

const httpServer =app.listen(port,()=>{
    console.log(`Current port ${port}`)
})
const io = new Server(httpServer);
socketserv(io);
app.use(errorHandler)

export default io