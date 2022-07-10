const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const fetch = require('node-fetch');
const path = require('path');

const app = express();

const server =  http.createServer(app);
const io = new Server(server);

app.use(express.static('build'));
app.use((req,res,next)=>{
    res.sendFile(path.join(__dirname,'build','index.html'));
});

const socketMap = {};
const roomData = {};
const Inputdata = {};

io.on('connection',(socket)=>{
    const id = socket.id;
    console.log('Socket connected ',id);
    socket.on("join",({roomId,username})=>{
        socketMap[id] = username;
        socket.join(roomId)
        const clients = [];
        //this is an ES6 Set of all client ids in the room
        const Clients = io.sockets.adapter.rooms.get(roomId);
        for(const clientId of Clients){
            clients.push({socketId : clientId,username : socketMap[clientId]})
        }
        //to just emit the same event to all members of a room
        io.sockets.in(roomId).emit('connectToRoom', {clients,user : username,socketId : id});
        io.to(id).emit("setRoomText",{text : roomData[roomId],stdIn : Inputdata[roomId]});  
    })
    
    socket.on("updatedText",({roomId,newText})=>{
        roomData[roomId] = newText;
        io.sockets.in(roomId).emit('updateText', {socketId: id,text : newText})
    })
    socket.on("OutputLang",({lang,roomId})=>{
        socket.in(roomId).emit("SetLang",{lang})
    })

    socket.on("OutputCode",({codeResult,roomId})=>{
        io.sockets.in(roomId).emit("SetCode",{codeResult})
    })
    socket.on("PlainMode",({roomId})=>{
        socket.in(roomId).emit("TurnPlain");
    })
    socket.on("CodeMode",({roomId})=>{
        socket.in(roomId).emit("TurnCode");
    })
    socket.on("stdInputChange",({roomId,input})=>{
        Inputdata[roomId] = input
        socket.in(roomId).emit("setInput",{input});
    })
    socket.on("disconnecting", () => {
        const rooms = [...socket.rooms];
        rooms.map((roomId)=>{
            socket.in(roomId).emit("disconnected",{socketId : id,username : socketMap[id]})
        })
        delete socketMap[id]
        rooms.map((roomId)=>{
            if(roomId != id){
                delete roomData[roomId];
                delete Inputdata[roomId];
            }
        })
        socket.leave()

    })
})

const PORT = process.env.PORT || 5000

server.listen(PORT,()=>console.log("Server listening on port 5000"));
