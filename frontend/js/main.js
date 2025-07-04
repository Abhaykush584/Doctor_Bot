const doctorOverlay = document.getElementById('doctorOverlay');
const chatbotBg = document.getElementById('chatbotBg');
const doctorAnime = document.getElementById('doctorAnime');
const chatMessages = document.getElementById('chatMessages');
const chatInputContainer = document.getElementById('chatInputContainer');
const userInput = document.getElementById('userInput');
const imageInput = document.getElementById('imageInput');
const sendBtn = document.getElementById('sendBtn');

let videoStream = null;
let videoElem = null;
let captureBtn = null;
let mode = null;
let historyStack = [];

// Typing effect for bot messages
function showTypingMessage(text, sender = 'bot', callback) {
    const msg = document.createElement('div');
    msg.className = 'chat-message message-' + sender;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    let i = 0;
    function typeChar() {
        if (i <= text.length) {
            msg.textContent = text.slice(0, i);
            i++;
            setTimeout(typeChar, 22 + Math.random()*33);
        } else if (callback) {
            callback();
        }
    }
    typeChar();
}

function showMessage(text, sender = 'bot') {
    const msg = document.createElement('div');
    msg.className = 'chat-message message-' + sender;
    msg.textContent = text;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showBackButton() {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = "⬅️ Back";
    btn.onclick = () => {
        if(historyStack.length > 0) {
            const lastState = historyStack.pop();
            restoreState(lastState);
        }
    };
    chatMessages.appendChild(btn);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function saveState() {
    // Save minimal state necessary for back navigation
    historyStack.push({
        mode,
        chatHTML: chatMessages.innerHTML,
        inputValue: userInput.value,
        inputPlaceholder: userInput.placeholder,
        userInputDisplay: userInput.style.display,
        imageInputDisplay: imageInput.style.display,
        sendBtnDisplay: sendBtn.style.display
    });
}

function restoreState(state) {
    resetChat();
    chatMessages.innerHTML = state.chatHTML;
    mode = state.mode;
    userInput.value = state.inputValue;
    userInput.placeholder = state.inputPlaceholder;
    userInput.style.display = state.userInputDisplay;
    imageInput.style.display = state.imageInputDisplay;
    sendBtn.style.display = state.sendBtnDisplay;
    chatInputContainer.style.display = 'flex';
    // If in live_eye mode, restore webcam
    if(mode === 'live_eye') {
        setupWebcamUI();
    }
}

// ---- Webcam logic ----
async function stopWebcam() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
}

function setupWebcamUI() {
    resetChat();
    showTypingMessage("👀 For live eye checkup, allow webcam access and click 'Capture' when ready.", 'bot');
    videoElem = document.createElement('video');
    videoElem.setAttribute('autoplay', true);
    videoElem.setAttribute('playsinline', true);
    videoElem.style.width = '100%';
    videoElem.style.maxHeight = '220px';
    setTimeout(() => {
        chatMessages.appendChild(videoElem);

        captureBtn = document.createElement('button');
        captureBtn.className = 'option-btn';
        captureBtn.textContent = '📸 Capture';
        captureBtn.onclick = captureWebcamImage;
        chatMessages.appendChild(captureBtn);

        showBackButton();

        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                videoStream = stream;
                videoElem.srcObject = stream;
            })
            .catch(err => {
                showMessage("Could not access webcam: " + err, 'bot');
            });
    }, 700);
}

async function captureWebcamImage() {
    if (!videoElem) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoElem.videoWidth;
    canvas.height = videoElem.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElem, 0, 0, canvas.width, canvas.height);
    showMessage("🔍 Checking your eyes...");
    canvas.toBlob(async function(blob) {
        const formData = new FormData();
        formData.append('image', blob, 'webcam.jpg');
        const res = await fetch('http://localhost:5000/predict_eye', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        showTypingMessage("Eye Checkup Result: " + data.prediction, 'bot');
        showBackButton();
    }, 'image/jpeg');
}

// ---- UI logic ----
function resetChat() {
    chatMessages.innerHTML = '';
    chatInputContainer.style.display = 'none';
    userInput.style.display = 'none';
    imageInput.style.display = 'none';
    sendBtn.style.display = 'none';
    userInput.value = '';
    if (videoElem && videoElem.parentNode) {
        videoElem.parentNode.removeChild(videoElem);
        videoElem = null;
    }
    if (captureBtn && captureBtn.parentNode) {
        captureBtn.parentNode.removeChild(captureBtn);
        captureBtn = null;
    }
    stopWebcam();
    // Do NOT clear mode here—needed for state restore
}

// ---- Chat flow ----
doctorOverlay.onclick = function() {
    doctorOverlay.style.opacity = 0;
    setTimeout(() => {
        doctorOverlay.style.display = "none";
        chatbotBg.style.overflow = "visible";
        startDoctorChat();
    }, 600);
};

function startDoctorChat() {
    resetChat();
    historyStack = [];
    showTypingMessage("Hey, I am your doctor! What kind of help do you need?", 'bot', () => {
        chatInputContainer.style.display = 'flex';
        userInput.style.display = 'inline-block';
        userInput.placeholder = "Describe what you want...";
        sendBtn.style.display = 'inline-block';
        mode = 'awaiting_main_intent';
    });
}

// ---- Main Chat Button Handler ----
sendBtn.onclick = async () => {
    if (mode === 'awaiting_main_intent') {
        const userText = userInput.value.trim().toLowerCase();
        if (!userText) return;
        showMessage(userText, 'user');
        userInput.value = '';
        saveState();
        // Simple intent recognition
        if (userText.includes('symptom')) {
            showTypingMessage("Okay! Please enter your symptoms separated by commas (e.g. fever, cough, itching):", 'bot', () => {
                mode = 'symptoms';
                userInput.placeholder = "e.g. fever, cough";
                userInput.style.display = 'inline-block';
                imageInput.style.display = 'none';
                sendBtn.style.display = 'inline-block';
                chatInputContainer.style.display = 'flex';
                showBackButton();
            });
        } else if (userText.includes('image') || userText.includes('skin')) {
            showTypingMessage("Sure! Please upload a skin image for diagnosis:", 'bot', () => {
                mode = 'image';
                userInput.style.display = 'none';
                imageInput.style.display = 'inline-block';
                sendBtn.style.display = 'inline-block';
                chatInputContainer.style.display = 'flex';
                showBackButton();
            });
        } else if (userText.includes('eye')) {
            showTypingMessage("Alright! For live eye checkup, allow webcam access and click 'Capture' when ready.", 'bot', () => {
                mode = 'live_eye';
                setupWebcamUI();
                showBackButton();
            });
        } else {
            showTypingMessage("Sorry, I didn't understand. You can try: check my symptoms, process my image, or eye checkup.", 'bot');
            showBackButton();
        }
        return;
    }

    if (mode === 'symptoms') {
        const symptomsInput = userInput.value.trim();
        if (!symptomsInput) return;
        showMessage(symptomsInput, 'user');
        userInput.value = '';
        saveState();
        showTypingMessage("🔍 Predicting disease...", 'bot');
        // Transform input into symptom dictionary, all set to 1
        const symptomsArray = symptomsInput.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
        const symptomsDict = {};
        symptomsArray.forEach(sym => symptomsDict[sym] = 1);
        const res = await fetch('http://localhost:5000/predict_symptoms', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(symptomsDict)
        });
        const data = await res.json();
        showTypingMessage("Predicted Disease: " + data.predicted_disease, 'bot');
        showBackButton();
        return;
    }

    if (mode === 'image') {
        if (!imageInput.files[0]) return;
        showMessage("Image uploaded!", 'user');
        saveState();
        showTypingMessage("🔍 Processing image...", 'bot');
        const formData = new FormData();
        formData.append('image', imageInput.files[0]);
        const res = await fetch('http://localhost:5000/predict_image', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        showTypingMessage(`Result: ${data.prediction} (${(data.confidence * 100).toFixed(2)}%)`, 'bot');
        showBackButton();
        return;
    }
};

// Allow re-opening chat with the doctor avatar
doctorAnime.onclick = startDoctorChat;