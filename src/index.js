const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io  = require("socket.io")(http);

const PORT = process.env.PORT || 3000; 

app.use(express.static(path.join(__dirname,"../public")))

app.get('/',(req,res)=>{
    res.render("index.html")
})

io.on("connection",function(socket){
    console.log("new User  connected..")
    socket.on("sender-join",function(data){
        socket.join(data.uid);
    });

    socket.on("receiver-join",function(data){
        socket.join(data.uid);
        socket.in(data.sender_uid).emit("init",data.uid);
       
    });

    socket.on("file-meta",function(data){
        // console.log("file-meta data:",data)
     socket.in(data.uid).emit("fs-meta",data.metadata);
    });

    socket.on("fs-start",function(data){
     socket.in(data.uid).emit("fs-share",{});
    });

    socket.on("file-raw",function(data){
     socket.in(data.uid).emit("fs-share",data.buffer);
    });

});

http.listen(PORT,()=>{
    console.log("now i'm listining at port "+ PORT)
})