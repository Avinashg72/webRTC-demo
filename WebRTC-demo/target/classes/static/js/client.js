const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const ws = new WebSocket("ws://localhost:8080/signal");
const peer = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
});

navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
    localVideo.srcObject = stream;
    stream.getTracks().forEach(track => peer.addTrack(track, stream));
});

peer.onicecandidate = e => {
    if (e.candidate) {
        ws.send(JSON.stringify({ type: "ice", candidate: e.candidate }));
    }
};

peer.ontrack = e => {
    remoteVideo.srcObject = e.streams[0];
};

ws.onmessage = async (event) => {
    const message = JSON.parse(event.data);

    if (message.type === "offer") {
        await peer.setRemoteDescription(new RTCSessionDescription(message));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        ws.send(JSON.stringify(answer));
    }

    if (message.type === "answer") {
        await peer.setRemoteDescription(new RTCSessionDescription(message));
    }

    if (message.type === "ice" && message.candidate) {
        await peer.addIceCandidate(new RTCIceCandidate(message.candidate));
    }
};

async function startCall() {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    ws.send(JSON.stringify(offer));
}

// auto-start call after short delay
setTimeout(startCall, 1000);
