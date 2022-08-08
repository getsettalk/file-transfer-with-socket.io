(function(){

 
    let senderID;
    var socket = io();
    function generateId(){
        return `${Math.trunc(Math.random()*999)}-${Math.trunc(Math.random()*999)}-${Math.trunc(Math.random()*999)}`;
    }
        document.querySelector("#receiver-start-con-btn ").addEventListener("click",function(){
            senderID= document.querySelector("#join-id").value;
            // console.log("Menual sid",senderID);
            if (senderID.length ==0) {
                return;
            }
            let joinID = generateId();
        
            socket.emit("receiver-join",{
                uid:joinID,
                sender_uid: senderID
            },console.log("receiver-join sent"));

            document.querySelector(".join-sereen ").classList.remove('active');
            document.querySelector(".fs-screen").classList.add('active');
        });

        socket.on("receiver-init", (uid) => {
            console.log("RE init uid",uid)
            // document.querySelector(".fs-screen").classList.add('active');
        });

        let fileShare = {};
        socket.on("fs-meta",(metadata)=>{
            // console.log(metadata)
            fileShare.metadata = metadata;
            fileShare.transmitted= 0;
            fileShare.buffer = [];
            let el = document.createElement("div");
            el.classList.add("item");
            el.classList.add("fileclr");
            el.innerHTML=`
            <div class="progress">0% </div>
            <div class="filename">${metadata.filename} </div>`;
            document.querySelector(".files-list").appendChild(el);
            fileShare.progress_node = el.querySelector(".progress");

            socket.emit("fs-start",{
                uid:senderID
            });
        })


            socket.on("fs-share",(buffer)=>{
                fileShare.buffer.push(buffer);
                fileShare.transmitted += buffer.byteLength;
                fileShare.progress_node.innerText= Math.trunc(fileShare.transmitted / fileShare.metadata.total_buffer_size * 100) +"%";
                if(fileShare.transmitted == fileShare.metadata.total_buffer_size){
                    download(new Blob(fileShare.buffer),fileShare.metadata.filename);
                    fileShare= {};
                }else{
                    socket.emit("fs-start",{
                        uid: senderID
                    })
                }
            })
})();