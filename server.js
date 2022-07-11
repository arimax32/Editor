const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

const server =  http.createServer(app);
const io = new Server(server);

app.use(express.static('build'));
app.use('/compile',async (req,res,next)=>{
    const {code,lang,input} = req.body 
     const fetch_response = await fetch("https://api.jdoodle.com/v1/execute", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: "f608249a407ffb24c664f73e220a8cb",
        clientSecret:
          "91e58d3c9ea93ef75f88dd1a0f91ec4df2811f23a32c85de24efafef3e1c2807",
        script: code,
        stdin: input,
        language: lang,
        versionIndex: "0"
      })
    })
     const d = await fetch_response.json();
     res.json(d);
     next();
});
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
        socket.leave()

    })
//     socket.on("disconnect",()=>{
//         for(const roomId in roomData){
//             let room = io.sockets.adapter.rooms[roomId];
//             if(room.length == 0){
//                 delete roomData[roomId];
//                 delete Inputdata[roomId];
//             }
//         }
//     })
})

const PORT = process.env.PORT || 5000
server.listen(PORT,()=>console.log(`Server listening on port ${PORT}`));
