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

// Popup menu toggle
const menuToggle = document.getElementById("menuToggle");
const controlsPopup = document.getElementById("controlsPopup");
const closePopup = document.getElementById("closePopup");

menuToggle.onclick = () => {
    controlsPopup.classList.add("active");
};

closePopup.onclick = () => {
    controlsPopup.classList.remove("active");
};

// Close popup when clicking outside
controlsPopup.onclick = (e) => {
    if (e.target === controlsPopup) {
        controlsPopup.classList.remove("active");
    }
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
        addSentImage(selectedImage);
        
        // Reset
        selectedImage = null;
        dropZone.innerHTML = '<p>📤 Drag & drop an image here or click to browse</p>';
        imageInput.value = "";
        sendImageBtn.disabled = true;
    }
};

sendImageBtn.disabled = true;

//browser to browser chat example
const receivedChat = document.getElementById("receivedChat");
const sentChat = document.getElementById("sentChat");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// Display message helper - received messages go to top screen
function addReceivedMessage(text) {
    const msg = document.createElement("div");
    msg.className = "message";
    msg.innerHTML = `<span class="message-label">👩‍🚀 Peer:</span><span class="message-text">${text}</span>`;
    receivedChat.appendChild(msg);
    receivedChat.scrollTop = receivedChat.scrollHeight;
}

// Display sent messages - go to bottom screen
function addSentMessage(text) {
    const msg = document.createElement("div");
    msg.className = "message";
    msg.innerHTML = `<span class="message-label">🧑‍💻 You:</span><span class="message-text">${text}</span>`;
    sentChat.appendChild(msg);
    sentChat.scrollTop = sentChat.scrollHeight;
}

// Display image helper - received images
function addReceivedImage(imageData) {
    const msg = document.createElement("div");
    msg.className = "message";
    
    const label = document.createElement("div");
    label.className = "message-label";
    label.textContent = "👩‍🚀 Peer:";
    
    const img = document.createElement("img");
    img.src = imageData;
    img.className = "chat-image";
    img.onclick = () => window.open(imageData, "_blank");
    
    msg.appendChild(label);
    msg.appendChild(img);
    receivedChat.appendChild(msg);
    receivedChat.scrollTop = receivedChat.scrollHeight;
}

// Display sent images
function addSentImage(imageData) {
    const msg = document.createElement("div");
    msg.className = "message";
    
    const label = document.createElement("div");
    label.className = "message-label";
    label.textContent = "🧑‍💻 You:";
    
    const img = document.createElement("img");
    img.src = imageData;
    img.className = "chat-image";
    img.onclick = () => window.open(imageData, "_blank");
    
    msg.appendChild(label);
    msg.appendChild(img);
    sentChat.appendChild(msg);
    sentChat.scrollTop = sentChat.scrollHeight;
}

// When clicking "Send", emit the message
sendBtn.onclick = () => {
    const message = input.value.trim();
    if (!message) return;
    socket.emit("signal", { type: "chat", text: message });
    addSentMessage(message);
    input.value = "";
};

// When a "signal" is received, check its type
socket.on("signal", (data) => {
    if (data.type === "chat") {
        addReceivedMessage(data.text);
    } else if (data.type === "image") {
        addReceivedImage(data.data);
    }
});