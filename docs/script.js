//  simple signaling example using Socket.io 
// Connect to the Socket.io server on Render
const socket = io("https://project-4-lilyvosari.onrender.com");

// Start page navigation
const startPage = document.getElementById("startPage");
const chatPage = document.getElementById("chatPage");
const startBtnMain = document.getElementById("startBtn");
const backBtn = document.getElementById("backBtn");

startBtnMain.onclick = () => {
    startPage.style.display = "none";
    chatPage.style.display = "block";
};

backBtn.onclick = () => {
    chatPage.style.display = "none";
    startPage.style.display = "block";
};

// Tab switching
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach(button => {
    button.addEventListener("click", () => {
        const tabName = button.getAttribute("data-tab");
        
        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove("active"));
        tabContents.forEach(content => content.classList.remove("active"));
        
        // Add active class to clicked button and corresponding content
        button.classList.add("active");
        document.getElementById(tabName + "Tab").classList.add("active");
    });
});

// Image upload functionality
const dropZone = document.getElementById("dropZone");
const imageInput = document.getElementById("imageInput");
const sendImageBtn = document.getElementById("sendImageBtn");
let selectedImage = null;

// Click to browse
dropZone.addEventListener("click", () => {
    imageInput.click();
});

// File selected via browse
imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
        handleImageFile(file);
    }
});

// Drag and drop handlers
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
        handleImageFile(file);
    }
});

function handleImageFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        selectedImage = e.target.result;
        dropZone.innerHTML = `<p>✅ Image selected: ${file.name}</p><img src="${selectedImage}" style="max-width: 200px; max-height: 200px; border-radius: 8px; margin-top: 10px;">`;
        sendImageBtn.disabled = false;
    };
    reader.readAsDataURL(file);
}

// Send image
sendImageBtn.onclick = () => {
    if (selectedImage) {
        socket.emit("signal", { type: "image", data: selectedImage });
        addImageMessage(selectedImage, true);
        
        // Reset
        selectedImage = null;
        dropZone.innerHTML = '<p>📤 Drag & drop an image here or click to browse</p>';
        imageInput.value = "";
        sendImageBtn.disabled = true;
    }
};

sendImageBtn.disabled = true;

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
    chat.scrollTop = chat.scrollHeight;
}

// Display image helper
function addImageMessage(imageData, isOwn = false) {
    const msg = document.createElement("div");
    msg.style.textAlign = isOwn ? "right" : "left";
    
    const label = document.createElement("div");
    label.textContent = isOwn ? "🧑‍💻 You:" : "👩‍🚀 Peer:";
    
    const img = document.createElement("img");
    img.src = imageData;
    img.className = "chat-image";
    img.onclick = () => window.open(imageData, "_blank");
    
    msg.appendChild(label);
    msg.appendChild(img);
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
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
    } else if (data.type === "image") {
        addImageMessage(data.data);
    }
});