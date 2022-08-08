(function () {
    let receiverID;
    var socket = io();
    function generateId() {
        return `${Math.trunc(Math.random() * 999)}-${Math.trunc(Math.random() * 999)}-${Math.trunc(Math.random() * 999)}`;
    }
    document.querySelector("#sender-start-con-btn ").addEventListener("click", function () {
        let joinID = generateId();
        document.querySelector("#join-id ").innerHTML = `<b>Room ID</b>
            <span>${joinID}</span>`;
        socket.emit("sender-join", {
            uid: joinID
        })
    });

    socket.on("init", (uid) => {
        console.log("on init uid",uid)
        receiverID= uid;
        console.log("after init uid",receiverID)
        document.querySelector(".join-sereen ").classList.remove('active');
        document.querySelector(".fs-screen").classList.add('active');
    });

    document.querySelector("#file-input").addEventListener("change", (e) => {
        let file = e.target.files[0];
        if (!file) {
            return;
        }
        let reader = new FileReader();
        reader.onload = (e) => {
            console.log("file reader", e)
            let buffer = new Uint8Array(reader.result);
            console.log(buffer);

            // created like file
            let el = document.createElement("div");
            el.classList.add("item");
            el.innerHTML = `
                <div class="progress">0% </div>
                <div class="filename">${file.name} </div>`;
            document.querySelector(".files-list").appendChild(el);

            shareFile({
                filename:
                    file.name,
                total_buffer_size: buffer.length,
                buffer_size: 1024
            }, buffer, el.querySelector(".progress"));
        }
        reader.readAsArrayBuffer(file);
    });

    function shareFile(metadata, buffer, progress_node) {
        // console.log(" in shareFile fun ",metadata)
        // console.log(" in shareFile fun bfr ",buffer)
        // console.log(" in shareFile fun bfr length ",buffer.length)
        // console.log(" in shareFile fun prg ",progress_node)
        // console.log(" in shareFile fun recr id ",receiverID)
        socket.emit("file-meta", {
            uid: receiverID,
            metadata: metadata
        
        })

        socket.on("fs-share", () => {
            let chunk = buffer.slice(0, metadata.buffer_size);
            console.log("chuck ", chunk)
            console.log("chuck length ", chunk.length)
            buffer = buffer.slice(metadata.buffer_size, buffer.length);
            console.log("chuck buffer ", buffer)
            progress_node.innerText = Math.trunc((metadata.total_buffer_size - buffer.length) / metadata.total_buffer_size * 100) + "%";
            if (chunk.length != 0) {
                socket.emit("file-raw", {
                    uid: receiverID,
                    buffer: chunk
                });
            }
        })
    }
})();