const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 4000;
const {v4:uuidv4} = require('uuid');

//Peer
const {ExpressPeerServer} = require('peer')
const peer = ExpressPeerServer(server , {
  debug:true
});


app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use('/peerjs', peer);
app.get('/' , (req,res)=>{
  res.redirect(uuidv4());
});
app.get('/:room' , (req,res)=>{
    res.render('index' , {RoomId:req.params.room});
});
io.on("connection" , (socket)=>{
  socket.on('newUser' , (id , room, name)=>{
    socket.join(room);
    socket.to(room).broadcast.emit('userJoined' , id, name);
    socket.on("message", (message, username) => {
      io.to(room).emit("createMessage", message, username);
    });
    socket.on('disconnect' , ()=>{
        socket.to(room).broadcast.emit('userDisconnect' , id, name);
    })
    socket.on('disconnecteduser', ()=>{
      socket.to(room).broadcast.emit('userDisconnect' , id, name);
    })
    // socket.on('screensharetrigger', (id, username) => {
    //   //socket.join(room)
    //   socket.to(room).broadcast.emit('screenJoined' , id, username);
    // })
    // socket.on('screen-disconnect', () => {
    //   socket.to(room).broadcast.emit('screenDisconnect');
    // })
  })
})
server.listen(port , ()=>{
  console.log("Server running on port : " + port);
})
