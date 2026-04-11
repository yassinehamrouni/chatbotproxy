document.getElementById("chat-toggle").addEventListener("click", () => {
  document.getElementById("chat-wrapper").classList.toggle("open");
});

document.getElementById("close-btn").addEventListener("click", () => {
  document.getElementById("chat-wrapper").classList.remove("open");
});

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

let conversationHistory = [];

function getPageContext() {
  try {
    const body = window.parent.document.body;
    if (!body) return "";
    return body.innerText.replace(/\s+/g, " ").trim().slice(0, 3000);
  } catch (e) {
    return "";
  }
}

function buildSystemPrompt() {
  const pageContext = getPageContext();
  let prompt = `Tu es un assistant expert en analyse de données B2B intégré dans un dashboard.
Tu aides les utilisateurs à comprendre leurs KPIs : chiffre d'affaires, performance, pricing, clients.
Réponds toujours en français, de façon concise et professionnelle.`;

  if (pageContext) {
    prompt += `\n\nVoici le contenu actuel du dashboard :\n"""\n${pageContext}\n"""
Utilise ces données pour répondre précisément.`;
  }

  return prompt;
}

function addMessage(text, type) {
  const msg = document.createElement("div");
  msg.className = type === "user" ? "user-message" : "bot-message";
  msg.innerHTML = text.replace(/\n/g, "<br>");
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showTyping() {
  const typing = document.createElement("div");
  typing.className = "bot-message";
  typing.id = "typing-indicator";
  typing.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
  chatBox.appendChild(typing);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTyping() {
  const typing = document.getElementById("typing-indicator");
  if (typing) typing.remove();
}

async function sendMessage() {
  const message = input.value.trim();
  if (!message) return;

  addMessage(message, "user");
  conversationHistory.push({ role: "user", content: message });
  input.value = "";
  sendBtn.disabled = true;
  showTyping();

  try {
    const response = await fetch("https://chatbot-proxy-niml.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "minimax/minimax-m1:free",
        messages: [
          { role: "system", content: buildSystemPrompt() },
          ...conversationHistory
        ]
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const reply = data.choices[0].message.content;
    conversationHistory.push({ role: "assistant", content: reply });
    removeTyping();
    addMessage(reply, "bot");

  } catch (error) {
    removeTyping();
    addMessage("Erreur : " + error.message, "bot");
  }

  sendBtn.disabled = false;
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", function (e) {
  if (e.key === "Enter") sendMessage();
});