// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const clearButton = document.getElementById('clear-button');

let isFirstMessage = true;
let typingEffect;

// Function to initialize typing animation
function initTypingAnimation(element) {
  const words = ['AI', 'Inquiry', 'Mission', 'Goal', 'Senior High'];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100; // typing speed in ms
  let deletingSpeed = 80; // deleting speed in ms
  let delayBetweenWords = 2000; // delay before starting next word

  function type() {
    const currentWord = words[wordIndex];

    if (isDeleting) {
      // Deleting characters
      element.textContent = `Hi, I'm Gardner Chatbot your ${currentWord.substring(
        0,
        charIndex - 1
      )}.`;
      charIndex--;
      typingSpeed = deletingSpeed;
    } else {
      // Typing characters
      element.textContent = `Hi, I'm Gardner Chatbot your ${currentWord.substring(
        0,
        charIndex + 1
      )}.`;
      charIndex++;
      typingSpeed = 100;
    }

    // Check if word is complete
    if (!isDeleting && charIndex === currentWord.length) {
      // Pause at end of word
      typingSpeed = delayBetweenWords;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      // Move to next word
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typingSpeed = 500; // pause before typing next word
    }

    typingEffect = setTimeout(type, typingSpeed);
  }

  // Start the animation
  type();
}

// Function to send a message
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // Hide greeting message if it's the first user message
  if (isFirstMessage) {
    const greeting = document.querySelector('.greeting-message');
    if (greeting) {
      greeting.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(() => {
        greeting.remove();
        clearTimeout(typingEffect); // Stop the typing animation
      }, 300); // Match this with the animation duration
    }
    isFirstMessage = false;
  }

  // Add user message to the chat
  appendMessage('user', message);
  userInput.value = '';

  // Show typing indicator
  showTypingIndicator();

  // Send message to the backend
  try {
    const response = await fetch('http://127.0.0.1:5000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    hideTypingIndicator();
    appendMessage('bot', formatResponse(data.response));
  } catch (error) {
    hideTypingIndicator();
    console.error('Error:', error);
    appendMessage('bot', 'Sorry, something went wrong. Please try again.');
  }
}

function clearConversation() {
  chatMessages.innerHTML = '';
  isFirstMessage = true; // Reset the flag when clearing chat
  clearTimeout(typingEffect); // Clear any existing typing animation

  // Create centered greeting message
  const greetingElement = document.createElement('div');
  greetingElement.classList.add('greeting-message');
  greetingElement.innerHTML = `
    <div class="greeting-content">
      <div class="greeting-text">Hi, I'm Gardner Chatbot your </div>
      <div class="greeting-subtext">How can I help you today?</div>
    </div>
  `;
  chatMessages.appendChild(greetingElement);

  // Start the typing animation
  const greetingTextElement = greetingElement.querySelector('.greeting-text');
  initTypingAnimation(greetingTextElement);
}

// Initialize with greeting
clearConversation();

// Show typing indicator
function showTypingIndicator() {
  const typingElement = document.createElement('div');
  typingElement.classList.add('typing-indicator');
  typingElement.id = 'typing-indicator';
  typingElement.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
  chatMessages.appendChild(typingElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
  const typingElement = document.getElementById('typing-indicator');
  if (typingElement) {
    typingElement.remove();
  }
}

// Function to format the response with bullet points
function formatResponse(response) {
  // Remove all asterisks first
  response = response.replace(/\*/g, '');

  // Highlight important keywords (case insensitive)
  const keywords = [
    'Senior High School',
    'ABM',
    'HUMSS',
    'STEM',
    'GAS',
    'ICT',
    'A&D',
    'tuition',
    'fees',
    'miscellaneous',
    'contact number',
    'working hours',
    'address',
    'email',
    'website',
    'Facebook',
    'ENGR. Ines M. Basaen, Ph.D.',
    'Daniel A. Ongchoco',
    'Kristine Mae Garrucho',
    'Glenn Macatiag',
    'Management Team',
    'OUR VISION',
    'OUR MISSION',
    'OUR CORE VALUES',
    'OUR CORE MISSION',
    'Global',
    'Excellent',
    'Noble',
    'Innovative',
    'Universal',
    'Selfless',
  ];

  keywords.forEach((keyword) => {
    const regex = new RegExp(`(${keyword})`, 'gi');
    response = response.replace(regex, '<strong>$1</strong>');
  });

  // Format bullet points (both - and •)
  response = response.replace(
    /^-\s*(.*$)/gm,
    '<div class="bullet-point">$1</div>'
  );
  response = response.replace(
    /^•\s*(.*$)/gm,
    '<div class="bullet-point">$1</div>'
  );

  // Format numbered lists
  response = response.replace(
    /^\d+\.\s*(.*$)/gm,
    '<div class="numbered-point">$1</div>'
  );

  // Format links (if any)
  response = response.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" target="_blank">$1</a>'
  );

  // Preserve line breaks
  response = response.replace(/\n/g, '<br>');

  return response;
}

// Function to append a message to the chat
function appendMessage(sender, message) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', sender);
  messageElement.innerHTML = formatResponse(message);
  chatMessages.appendChild(messageElement);

  // Scroll to the bottom of the chat
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Event Listeners
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

// Add event listener for clear button
clearButton.addEventListener('click', clearConversation);
