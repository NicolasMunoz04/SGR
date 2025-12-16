// Configuración del webhook de n8n
window.ChatWidgetConfig = {
  webhook: {
    url: 'http://localhost:5678/webhook/402d26a2-84dc-427b-8cc3-d153a090b9b4/chat',
  },
};

// Mantener una sesión única por usuario
if (!sessionStorage.getItem("sessionId")) {
  sessionStorage.setItem("sessionId", crypto.randomUUID());
}
const sessionId = sessionStorage.getItem("sessionId");

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {

  const btnChat = document.getElementById('chatbot-button');
  const chatWidget = document.getElementById('chatbot-widget');
  const closeBtn = document.querySelector('#chatbot-header .close-btn');
  const input = document.getElementById('chatbot-input');
  const messagesContainer = document.getElementById('chatbot-messages');

  if (!btnChat || !chatWidget) return; // si no existen, salir

  // Mostrar el chat
  btnChat.addEventListener('click', () => {
    chatWidget.style.display = 'flex';
    btnChat.style.display = 'none';
  });

  // Cerrar el chat con la X
  function closeChatWidget() {
    chatWidget.style.display = 'none';
    btnChat.style.display = 'block';
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeChatWidget);
  }

  // Enviar mensaje con Enter
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault(); // evita saltos de línea
        sendMessage();
      }
    });
  }

  // Enviar mensaje al servidor n8n
  async function sendMessage() {
    const message = input.value.trim();
    if (message === '') return;

    // Mostrar mensaje del usuario
    const userMsg = document.createElement('div');
    userMsg.className = 'msg-user';
    userMsg.textContent = message;
    messagesContainer.appendChild(userMsg);

    // Limpiar input y bajar scroll
    input.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // 👉 Añadimos la animación de “escribiendo...”
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'msg-assistant typing';
    typingIndicator.innerHTML = `
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    `;
    messagesContainer.appendChild(typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      const response = await fetch(window.ChatWidgetConfig.webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId,
          chatInput: message,
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      // Eliminar el indicador de escritura antes de mostrar la respuesta
      typingIndicator.remove();

      // Mostrar respuesta del bot
      const botMsg = document.createElement('div');
      botMsg.className = 'msg-assistant';
      botMsg.innerHTML = data.output || 'Lo siento, no entendí eso.';
      messagesContainer.appendChild(botMsg);

    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      typingIndicator.remove(); // eliminar animación si hay error
      const errorMsg = document.createElement('div');
      errorMsg.className = 'msg-assistant';
      errorMsg.textContent = '❗ Error al conectar con el asistente.';
      messagesContainer.appendChild(errorMsg);
    }

    // Bajar scroll al final
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

});