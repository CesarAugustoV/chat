import express from "express";
import {engine} from 'express-handlebars';
import {Server} from "socket.io";
import viewsRouter from './routes/views.router.js';
import { __dirname} from './utils.js';


const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));

//handlebars
app.engine("handlebars", engine());
app.set("views", __dirname + '/views');
app.set('view engine', "handlebars");

//routes
app.use("/", viewsRouter);

const PORT = 8080;

const httpServer = app.listen(PORT, ()=>{
    console.log(`Escuchando al puert ${PORT}`);
});

const socketServer = new Server(httpServer);

const messages = [];

socketServer.on('connection', socket =>{

    console.log(`Cliente conectado: ${socket.id}`);

    //nuevo usuario
    socket.on('newUser', (user)=>{
        //broadcast le llega a todos menos al implicado
        socket.broadcast.emit("userConnected", user);
        //you are connected
        socket.emit('connected');
        socket.on('message', info =>{
            messages.push(info);
            socketServer.emit("chat", messages)
        })
    });

});