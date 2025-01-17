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
    // console.log(message);
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message message-bot';

    // handle code blocks with \n at start and end
    let formattedMessage = message.replace(/```\\n([\s\S]*?)\\n```/g, (match, code) => {
        const escapedCode = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        return `<pre class="code-block language-plaintext"><code class="language-plaintext">${escapedCode}</code></pre>`;
    });

    // handle normal code blocks with language specification
    formattedMessage = formattedMessage.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
        const escapedCode = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        return `<pre class="code-block language-${language || 'plaintext'}"><code class="language-${language || 'plaintext'}">${escapedCode}</code></pre>`;
    });

    // Split the message into lines
    let lines = formattedMessage.split('\n');
    let inList = false;
    let formattedLines = lines.map(line => {
        // Handle headers
        if (line.match(/^#{1,6}\s/)) {
            const level = line.match(/^#{1,6}/)[0].length;
            const text = line.replace(/^#{1,6}\s+/, '');
            return `<h${level}>${text}</h${level}>`;
        }

        // Handle bold text
        line = line.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');

        // Handle bullet points
        if (line.match(/^- /)) {
            if (!inList) {
                inList = true;
                return '<ul><li>' + line.substring(2) + '</li>';
            }
            return '<li>' + line.substring(2) + '</li>';
        } else if (inList) {
            inList = false;
            return '</ul>' + line;
        }

        return line;
    });

    if (inList) {
        formattedLines.push('</ul>');
    }

    // Join lines back together with proper spacing
    formattedMessage = formattedLines.join('<br>');

    // Add paragraph tags for better spacing
    formattedMessage = '<p>' + formattedMessage + '</p>';

    // Clean up empty paragraphs and multiple breaks
    formattedMessage = formattedMessage
        .replace(/<p>\s*<\/p>/g, '')
        .replace(/<p><br><\/p>/g, '<br>')
        .replace(/<br>\s*<br>/g, '<br>');

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
