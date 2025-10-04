// aiproxy/scout/script.js

const emailForm = document.getElementById('email-form');
const emailInput = document.getElementById('email');
const sendLinkButton = document.getElementById('send-link');
const aiChatDiv = document.getElementById('ai-chat');

// Add event listener to send link button
sendLinkButton.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    if (email) {
        try {
            // Send request to generate secured session link
            const response = await fetch('/generate-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (data.success) {
                // Send email with secured session link
                console.log('Email sent with secured session link');
            } else {
                console.error('Error generating secured session link');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
});

// Initialize AI chat
async function initAIChat() {
    // Load AI settings and priority
    const aiSettings = await loadAISettings();

    // Initialize AI chat with default AI
    const defaultAI = aiSettings.priority[0];
    const aiChat = new AIChat(defaultAI);
    aiChatDiv.appendChild(aiChat.render());
}

// Load AI settings and priority
async function loadAISettings() {
    // Implement logic to load AI settings and priority from encrypted file
    // For demonstration purposes, assume a simple JSON file
    const response = await fetch('/ai-settings.json');
    return await response.json();
}

// AI Chat class
class AIChat {
    constructor(ai) {
        this.ai = ai;
        this.chatLog = [];
    }

    render() {
        const chatHTML = `
            <div id="ai-chat-log">
                ${this.chatLog.map((message) => `<p>${message.text}</p>`).join('')}
            </div>
            <input type="text" id="ai-input" placeholder="Type a message...">
            <button id="ai-send">Send</button>
        `;
        const chatElement = document.createElement('div');
        chatElement.innerHTML = chatHTML;

        // Add event listener to send button
        const sendButton = chatElement.querySelector('#ai-send');
        sendButton.addEventListener('click', async () => {
            const userInput = chatElement.querySelector('#ai-input').value.trim();
            if (userInput) {
                try {
                    // Send request to AI
                    const response = await fetch('/ai-response', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ai: this.ai, input: userInput }),
                    });
                    const data = await response.json();
                    if (data.success) {
                        // Update chat log
                        this.chatLog.push({ text: data.response });
                        chatElement.querySelector('#ai-chat-log').innerHTML = this.chatLog.map((message) => `<p>${message.text}</p>`).join('');
                    } else {
                        console.error('Error getting AI response');
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        });

        return chatElement;
    }
}