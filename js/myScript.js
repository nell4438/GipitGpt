document.getElementById("user-input").addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

let messages = [{
    "role": "system",
    "content": "You are a helpful assistant that helps the client to solve coding problems. you will help the user to debug, optimize code and eveything that helps the programmer in making websites"
}];

async function sendMessage() {
    const messagesDiv = document.getElementById('messages');
    const userInput = document.getElementById('user-input').value;
    const typingIndicator = document.getElementById('typing-indicator');

    if (!userInput) return;

    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'message message-user';
    const formattedUserInput = userInput.replace(/\n/g, '<br>');
    userMessageDiv.innerHTML = formattedUserInput;

    typingIndicator.remove();
 
    messagesDiv.appendChild(userMessageDiv);


    messagesDiv.appendChild(typingIndicator);

    typingIndicator.style.display = 'block';
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    const inputField = document.getElementById('user-input');
    const sendButton = document.getElementById('send-btn');
    inputField.disabled = true;
    sendButton.disabled = true;

    messages.push({
        "role": "user",
        "content": userInput
    });

    try {
        const response = await fetch('https://gpt-api-bay.vercel.app/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: messages
            })
        });
        const data = await response.json();
        messages = data.messages;
        displayMessage(data.response);
    } catch (error) {
        console.error('Error:', error);
        displayMessage("Error: Could not get response");
    } finally {
        typingIndicator.style.display = 'none';
        inputField.disabled = false;
        sendButton.disabled = false;
        inputField.value = '';
        inputField.focus();
    }
}

function displayMessage(message) {
    const messagesDiv = document.getElementById('messages');
    const typingIndicator = document.getElementById('typing-indicator');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message message-bot';


    let formattedMessage = message.replace(/```(\w+)\n([\s\S]*?)```/g, (match, language, code) => {
        const escapedCode = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        return `<pre class="code-block language-${language}"><code class="language-${language}">${escapedCode}</code></pre>`;
    });

    formattedMessage = formattedMessage.replace(/^#{1,6}\s+(.+)$/gm, (match, text) => {
        const level = match.match(/#/g).length;
        return `<h${level}>${text}</h${level}>`;
    });

    formattedMessage = formattedMessage.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
    formattedMessage = formattedMessage.replace(/^- \*\*([^\*]+)\*\*\n/gm, '<ul><li><strong>$1</strong></li></ul>');
    formattedMessage = formattedMessage.replace(/^- ([^\n]+)/gm, '<ul><li>$1</li></ul>');

    messageDiv.innerHTML = formattedMessage;


    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    Prism.highlightAll();
}

function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    const currentIcon = themeIcon.textContent;


    themeIcon.classList.add('theme-icon-animation-out');

    setTimeout(() => {
        if (body.classList.contains('light-mode')) {
            body.classList.remove('light-mode');
            themeIcon.textContent = '🌙';
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.add('light-mode');
            themeIcon.textContent = '☀️';
            localStorage.setItem('theme', 'light');
        }


        themeIcon.classList.remove('theme-icon-animation-out');
        themeIcon.classList.add('theme-icon-animation');


        setTimeout(() => {
            themeIcon.classList.remove('theme-icon-animation');
        }, 500);

    }, 300);
}


document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.getElementById('theme-icon');

    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeIcon.textContent = '☀️';
    }


    themeIcon.classList.add('theme-icon-animation');
    setTimeout(() => {
        themeIcon.classList.remove('theme-icon-animation');
    }, 500);
});
