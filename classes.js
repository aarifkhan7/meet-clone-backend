class Participant{
    #name;
    #socket;
    // #peerId;
    constructor(name, skt, pid=0){
        this.#name = name;
        this.#socket = skt;
        // this.#peerId = pid;
    }
    getName(){
        return this.#name;
    }
    getSocket(){
        return this.#socket;
    }
    getSocketId(){
        return this.#socket.id;
    }
    emit(event, data){
        this.#socket.emit(event, data);
    }
    sendRemoteId(remoteSocketId, peerID){
        this.#socket.emit('remote-id', {
            remoteSocketId: remoteSocketId,
            remotePeerId: peerID
        });
    }
}

class Room{
    #roomId;
    #arr; // array of participants
    constructor(rId){
        this.#roomId = rId;
        this.#arr = [];
    }
    add(participant){
        this.#arr.push(participant);
    }
    remove(participantSocketId){
        let ind = -1;
        let i = 0;
        this.#arr.forEach(p => {
            if(p.getSocketId() == participantSocketId){
                ind = i;
            }
            i++;
        });
        if(ind >= 0){
            this.#arr.splice(ind, 1);
            return true;
        }else{
            return false;
        }
    }
    getSize(){
        return this.#arr.length;
    }
    sendOffers(pIDArr, senderSocketID){
        let i = 0;
        this.#arr.forEach(function (p) {
            if(p.getSocket().id != senderSocketID){
                p.sendRemoteId(senderSocketID, pIDArr[i]);
                i++;
            }
        })
    }
    broadcast(event, data){
        this.#arr.forEach(function (p) {
            p.emit(event, data);
        })
    }
}

class Environment{
    #mp; // map of string(roomId) to rooms
    #sktmp; // map of socket ids to room ids
    constructor(){
        this.#mp = new Map();
        this.#sktmp = new Map();
    }
    createRoom(roomId){
        this.#mp.set(roomId, new Room(roomId));
        return this.#mp.has(roomId);
    }
    deleteRoom(roomId){
        // tbi
    }
    setSocketRoomPair(socketID, roomId){
        this.#sktmp.set(socketID, roomId);
    }
    getRoomBySocket(socketID){
        return this.#sktmp.get(socketID);
    }
    getRoom(roomId){
        return this.#mp.get(roomId);
    }
    checkRoomExists(roomId){
        return this.#mp.has(roomId);
    }
}

exports.Participant = Participant;
exports.Room = Room;
exports.Environment = Environment;