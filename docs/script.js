//  simple signaling example using Socket.io 
// Connect to the Socket.io server
// By default, this connects to the same origin the page was served from
const socket = io();

//browser to browser chat example
const chat = document.getElementById("chat");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// Display message helper
function addMessage(text, isOwn = false) {
    const msg = document.createElement("div");
    msg.textContent = (isOwn ? "🧑‍💻 You: " : "👩‍🚀 Peer: ") + text;
    msg.style.textAlign = isOwn ? "right" : "left";
    chat.appendChild(msg);
}

// When clicking "Send", emit the message
sendBtn.onclick = () => {
    const message = input.value.trim();
    if (!message) return;
    socket.emit("signal", { type: "chat", text: message });
    addMessage(message, true);
    input.value = "";
};

// When a "signal" is received, check its type
socket.on("signal", (data) => {
    if (data.type === "chat") {
        addMessage(data.text);
    }
});