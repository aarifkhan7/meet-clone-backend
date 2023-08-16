const {Environment, Room, Participant} = require('./classes');

const currEnv = new Environment();

const randomId = function(length = 6) {
    return Math.random().toString(36).substring(2, length+2);
};

const express = require('express');
const {createServer} = require('http');
const {Server} = require('socket.io');
const cors = require('cors');

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/index.html');
})

const socketio = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000"
    }
});
// Socket events and their handlers
socketio.on("connection", async (socket)=>{
    console.log("User connected, socketId: " + socket.id);

    socket.on("createroom", ()=>{
        console.log(socket.id + " requests to create a new room. ");
        const newRoomId = randomId(9);
        if(currEnv.createRoom(newRoomId)){
            console.log("Room created: " + newRoomId);
            currEnv.createRoom(newRoomId);
            socket.emit("createroom-success", {roomId: newRoomId});
        }else{
            console.log("Error in creating room...");
            socket.emit("createroom-failure", {msg: "Internal Server Error"});
        }
    });

    socket.on("reqjoin", (data)=>{
        // data
        // ---roomId
        if(!data.roomId){
            socket.emit("reqjoin-failure", {msg: "Invalid Object, no roomId found"});
            return;
        }
        if(!currEnv.checkRoomExists(data.roomId)){
            socket.emit("reqjoin-failure", {msg: "Invalid roomId"});
            return;
        }
        let room = currEnv.getRoom(data.roomId);
        room.add(new Participant('Any thing', socket, socket.id));
        currEnv.setSocketRoomPair(socket.id, data.roomId);
        // room metadata is sent along with reqjoin-success event
        socket.emit("reqjoin-success", {
            numParticipants: room.getSize()-1
        });
    });

    socket.on("metadata", (data)=>{
        
    })

    socket.on("checkjoin", (data)=>{
        // data
        // ---roomId
        // tbi
    })

    socket.on("offers", (data)=>{
        console.log(socket.id + " has sent peerids for the room participants");
        if(!data.pID){
            socket.emit("offers-error", {msg: "Field pID (peerID array) missing"});
            return;
        }
        // the array should be
        // pID = [pid1, pid2, pid3, pid4] --- these pids will be randomly
        // check the array size equals the number of participants-1 (the one who sent the offers)
        // sent to the participants
        // for the time being lets assume the array size sent is = no of participants in the room
        
        // broadcast the peerids to other participants of the room expect one self
        currEnv.getRoom(currEnv.getRoomBySocket(socket.id)).sendOffers(data.pID, socket.id);

        socket.emit("offers-valid-syntax", data);
    });

    socket.on("answer", (data)=>{
        // this event handler relays peer id from one participant to another
        // given remote socket id
        // data should be of format
        // ---remoteSocketId
        // ---remotePeerId
        // ---localPeerId
        // the data sent to the new joinee will be reverse order
        if(!data.remoteSocketId || !data.remotePeerId || !data.localPeerId){
            socket.emit("answer-error", {msg: "Invalid data object"});
            return;
        }
        let tmp = data.remotePeerId;
        data.remotePeerId = data.localPeerId;
        data.localPeerId = tmp;
        socket.emit("answer-success");
        socketio.to(data.remoteSocketId).emit("relay-answer", data);
    });

    socket.on("disconnect", ()=>{
        console.log("User disconnected, socketId: " + socket.id);
    })
})

httpServer.listen(4000, ()=>{
    console.log("OK");
});
