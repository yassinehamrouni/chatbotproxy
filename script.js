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

function buildSystemPrompt() {
  return `Tu es un assistant expert en analyse de données intégré dans un dashboard Power BI professionnel d'une entreprise tunisienne. Tu peux aussi répondre à des questions générales.

Tu connais parfaitement ces 4 dashboards :

=== 1. GENERAL MANAGER DASHBOARD ===
- CA Total : 1 059 654 TND | Gap : 16 TND | Concurrence : 5
- CA Previous Month : 31 762%
- TOP PRODUCT : -85,25 TND (Competitive)
- FLOP PRODUCT : Mouton à bascule artisanal – Bois & laine naturelle (+350 TND, Too Expensive)
- TO WATCH : Zouba tasse fleur (Low Margin)
- Risk Level : 50% Élevé / 50% Faible (446 chacun)
- DECISION URGENTE : Baisser les prix (non compétitif)
- Segments clients : Acheteurs Ponctuels, Amateurs Art, Clients Dormants, Clients Premium
- Catégories : Arts de la table, Céramiques, Cuivres, Déco, Jeux, Sculptures, Verres

=== 2. MARKETING DASHBOARD ===
- TOP 3 PRODUITS : Mouton T1 (1039 DT), Plateau 30x20 (1612 DT), Couffin Sac à Main (2090 DT)
- FLOP 3 PRODUITS : mêmes produits avec marges faibles
- Segments clients : 4 segments à 25% chacun (446 clients par segment)
  * Acheteurs Ponctuels, Amateurs Art, Clients Dormants, Clients Premium
- ODD 8 Travail Décent : 92% — 459/500 commandes
- Sougui Price vs Competitor : CERAMIQUES, COUFFINS, JEUX, VERRES
- Monthly Revenue Prediction : croissance jan 2024 → jan 2025 (10K → 20K+)

=== 3. FINANCE DASHBOARD ===
- Tendance CA : +3,1% (Hausse)
- Revenu mensuel : stable entre 0,7M et 1M TND
- 4 clusters de commandes :
  * Cluster 0 : ~1500 commandes
  * Cluster 1 : ~2700 commandes
  * Cluster 2 : ~4500 commandes (dominant)
  * Cluster 3 : ~1300 commandes
- Panier moyen : 130 à 300 TND
- ODD 2030 : 1723 jours restants (57% du temps écoulé)

=== 4. PURCHASES DASHBOARD ===
- Best Model : RF Regressor (RMSE: 2494,54 — Excellent)
- XGBoost TS surpasse SARIMA pour le forecasting
- Cluster 0 = fournisseurs stratégiques haute valeur
- ALERT NÉGOCIATION FOURNISSEURS :
  * KOBOXOccasional : 4 474 TND
  * SBCD Regular : 12 621 TND
  * Oriental Design Kammoun Strategic : 41 858 TND
  * Kamel Hidri Strategic : 33 100 TND
- Nb Factures ML : 290 pour tous les fournisseurs
- Prévision 2025 : ~150K TND

Réponds toujours en français, sois concis et professionnel.`;
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
    const response = await fetch("https://chatbotproxy.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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