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

// Alternative image sending using canvas (if you want to add drawing features later)
const sendImageBtnAlt = document.getElementById("sendImageAlt");
if (sendImageBtnAlt) {
  const imageInputAlt = document.getElementById("imageInputAlt");

  sendImageBtnAlt.addEventListener("click", () => {
    imageInputAlt.click();
  });

  imageInputAlt.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target.result;
      
      // Send image to other users via dedicated image event
      if (socket && socket.connected) {
        socket.emit("image", imageData);
      }
      
      // Also display locally
      addSentImage(imageData);
    };
    reader.readAsDataURL(file);
  });
}

// Listen for images from other users via dedicated image event
socket.on("image", (imageData) => {
  addReceivedImage(imageData);
});

// Canvas Drawing Functionality
const canvas = document.getElementById("drawCanvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  const colorPicker = document.getElementById("colorPicker");
  const brushSize = document.getElementById("brushSize");
  const clearCanvas = document.getElementById("clearCanvas");
  
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  
  // Set canvas background
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Drawing functions
  function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
  }
  
  function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const drawData = {
      lastX,
      lastY,
      x,
      y,
      color: colorPicker.value,
      size: brushSize.value
    };
    
    // Draw locally
    drawLine(drawData);
    
    // Send to other users
    socket.emit("draw", drawData);
    
    lastX = x;
    lastY = y;
  }
  
  function stopDrawing() {
    isDrawing = false;
  }
  
  function drawLine(data) {
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    ctx.beginPath();
    ctx.moveTo(data.lastX, data.lastY);
    ctx.lineTo(data.x, data.y);
    ctx.stroke();
  }
  
  // Event listeners
  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);
  canvas.addEventListener("mouseout", stopDrawing);
  
  // Touch support for mobile
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  });
  
  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  });
  
  canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent("mouseup", {});
    canvas.dispatchEvent(mouseEvent);
  });
  
  // Clear canvas
  clearCanvas.addEventListener("click", () => {
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    socket.emit("clear");
  });
  
  // Send drawing as image
  const sendDrawingBtn = document.getElementById("sendDrawing");
  sendDrawingBtn.addEventListener("click", () => {
    // Convert canvas to data URL (image)
    const imageData = canvas.toDataURL("image/png");
    
    // Send via signal event (like other images)
    socket.emit("signal", { type: "image", data: imageData });
    addSentImage(imageData);
    
    // Optionally clear the canvas after sending
    // ctx.fillStyle = "#1a1a1a";
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
  });
  
  // Listen for drawing from other users
  socket.on("draw", (data) => {
    drawLine(data);
  });
  
  // Listen for clear from other users
  socket.on("clear", () => {
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });
}