class Participant{
    #name;
    #socket;
    #peerId;
    constructor(name, skt, pid){
        this.#name = name;
        this.#socket = skt;
        this.#peerId = pid;
    }
    getName(){
        return this.#name;
    }
    getSocket(){
        return this.#socket;
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
    #st; // set of participants
    constructor(rId){
        this.#roomId = rId;
        this.#st = new Set();
    }
    add(connObj){
        this.#st.add(connObj);
    }
    remove(connObj){
        return this.#st.delete(connObj);
    }
    getSize(){
        return this.#st.size;
    }
    sendOffers(pIDArr, senderSocketID){
        let i = 0;
        this.#st.forEach(function (p) {
            if(p.getSocket().id != senderSocketID){
                p.sendRemoteId(senderSocketID, pIDArr[i]);
                i++;
            }
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