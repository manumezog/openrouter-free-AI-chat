// ===========================
// Application State
// ===========================
const APP_STATE = {
  apiKey: localStorage.getItem("openrouter_api_key") || "",
  conversations: JSON.parse(localStorage.getItem("conversations") || "[]"),
  currentConversationId:
    localStorage.getItem("current_conversation_id") || null,
  availableModels: [],
  selectedModel: localStorage.getItem("selected_model") || "",
  isLoading: false,
};

// ===========================
// DOM Elements
// ===========================
const elements = {
  apiKeyModal: document.getElementById("api-key-modal"),
  apiKeyInput: document.getElementById("api-key-input"),
  saveApiKeyBtn: document.getElementById("save-api-key-btn"),
  conversationsList: document.getElementById("conversations-list"),
  newConversationBtn: document.getElementById("new-conversation-btn"),
  modelSelector: document.getElementById("model-selector"),
  messagesContainer: document.getElementById("messages-container"),
  messageInput: document.getElementById("message-input"),
  sendBtn: document.getElementById("send-btn"),
  settingsBtn: document.getElementById("settings-btn"),
  // Mobile sidebar elements
  sidebar: document.getElementById("sidebar"),
  sidebarOverlay: document.getElementById("sidebar-overlay"),
  mobileMenuToggle: document.getElementById("mobile-menu-toggle"),
  sidebarCloseBtn: document.getElementById("sidebar-close-btn"),
};

// ===========================
// OpenRouter API Client
// ===========================
const OpenRouterAPI = {
  baseURL: "https://openrouter.ai/api/v1",

  async fetchFreeModels() {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          Authorization: `Bearer ${APP_STATE.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch models");
      }

      const data = await response.json();
      // Filter for free models (pricing.prompt === "0" and pricing.completion === "0")
      const freeModels = data.data.filter((model) => {
        const pricing = model.pricing;
        return (
          pricing &&
          (pricing.prompt === "0" ||
            pricing.prompt === 0 ||
            parseFloat(pricing.prompt) === 0) &&
          (pricing.completion === "0" ||
            pricing.completion === 0 ||
            parseFloat(pricing.completion) === 0)
        );
      });

      return freeModels;
    } catch (error) {
      console.error("Error fetching models:", error);
      throw error;
    }
  },

  async sendMessage(messages, model) {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${APP_STATE.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.href,
          "X-Title": "OpenRouter Free AI Chat",
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to send message");
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },
};

// ===========================
// Conversation Management
// ===========================
const ConversationManager = {
  createConversation() {
    const newConversation = {
      id: Date.now().toString(),
      title: "New Conversation",
      messages: [],
      model: APP_STATE.selectedModel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    APP_STATE.conversations.unshift(newConversation);
    APP_STATE.currentConversationId = newConversation.id;
    this.saveConversations();
    return newConversation;
  },

  getCurrentConversation() {
    return APP_STATE.conversations.find(
      (c) => c.id === APP_STATE.currentConversationId
    );
  },

  addMessage(role, content) {
    const conversation = this.getCurrentConversation();
    if (!conversation) return;

    conversation.messages.push({
      role: role,
      content: content,
      timestamp: new Date().toISOString(),
    });

    // Update conversation title based on first user message
    if (
      role === "user" &&
      conversation.messages.filter((m) => m.role === "user").length === 1
    ) {
      conversation.title =
        content.substring(0, 50) + (content.length > 50 ? "..." : "");
    }

    conversation.updatedAt = new Date().toISOString();
    this.saveConversations();
  },

  switchConversation(conversationId) {
    APP_STATE.currentConversationId = conversationId;
    localStorage.setItem("current_conversation_id", conversationId);
    UI.renderMessages();
    UI.renderConversations();
    // Close sidebar on mobile after selecting conversation
    if (typeof closeMobileSidebar === "function") {
      closeMobileSidebar();
    }
  },

  saveConversations() {
    localStorage.setItem(
      "conversations",
      JSON.stringify(APP_STATE.conversations)
    );
  },
};

// ===========================
// UI Rendering
// ===========================
const UI = {
  showApiKeyModal() {
    elements.apiKeyModal.classList.add("active");
  },

  hideApiKeyModal() {
    elements.apiKeyModal.classList.remove("active");
  },

  renderConversations() {
    elements.conversationsList.innerHTML = "";

    if (APP_STATE.conversations.length === 0) {
      elements.conversationsList.innerHTML = `
                <div style="text-align: center; color: var(--text-tertiary); padding: var(--spacing-lg);">
                    <p>No conversations yet.</p>
                    <p style="font-size: var(--font-size-sm); margin-top: var(--spacing-sm);">Click + to start chatting!</p>
                </div>
            `;
      return;
    }

    APP_STATE.conversations.forEach((conversation) => {
      const conversationEl = document.createElement("div");
      conversationEl.className = "conversation-item";
      if (conversation.id === APP_STATE.currentConversationId) {
        conversationEl.classList.add("active");
      }

      const date = new Date(conversation.updatedAt);
      const formattedDate = date.toLocaleDateString();

      conversationEl.innerHTML = `
                <div class="conversation-title">${conversation.title}</div>
                <div class="conversation-meta">
                    <span>${conversation.messages.length} messages</span>
                    <span>${formattedDate}</span>
                </div>
            `;

      conversationEl.addEventListener("click", () => {
        ConversationManager.switchConversation(conversation.id);
      });

      elements.conversationsList.appendChild(conversationEl);
    });
  },

  renderMessages() {
    const conversation = ConversationManager.getCurrentConversation();

    if (!conversation || conversation.messages.length === 0) {
      elements.messagesContainer.innerHTML = `
                <div class="welcome-screen">
                    <h2>Welcome to OpenRouter Free AI Chat! 🚀</h2>
                    <p>Select a model above and start chatting with free AI models.</p>
                    <div class="feature-grid">
                        <div class="feature-card">
                            <span class="feature-icon">🤖</span>
                            <h3>Multiple Models</h3>
                            <p>Access all free models from OpenRouter</p>
                        </div>
                        <div class="feature-card">
                            <span class="feature-icon">💾</span>
                            <h3>Conversation History</h3>
                            <p>All chats saved locally in your browser</p>
                        </div>
                        <div class="feature-card">
                            <span class="feature-icon">⚡</span>
                            <h3>Fast & Simple</h3>
                            <p>Clean interface, no signup required</p>
                        </div>
                    </div>
                </div>
            `;
      return;
    }

    elements.messagesContainer.innerHTML = "";

    conversation.messages.forEach((message) => {
      const messageEl = this.createMessageElement(message);
      elements.messagesContainer.appendChild(messageEl);
    });

    this.scrollToBottom();
  },

  createMessageElement(message) {
    const messageEl = document.createElement("div");
    messageEl.className = `message ${message.role}`;

    const avatar = message.role === "user" ? "👤" : "🤖";

    messageEl.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">${this.formatMessageContent(
              message.content
            )}</div>
        `;

    return messageEl;
  },

  formatMessageContent(content) {
    // Basic markdown-like formatting
    let formatted = content;

    // Code blocks
    formatted = formatted.replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      "<pre><code>$2</code></pre>"
    );

    // Inline code
    formatted = formatted.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Bold
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

    // Italic
    formatted = formatted.replace(/\*(.+?)\*/g, "<em>$1</em>");

    // Line breaks
    formatted = formatted.replace(/\n/g, "<br>");

    return formatted;
  },

  addTypingIndicator() {
    const typingEl = document.createElement("div");
    typingEl.className = "message assistant";
    typingEl.id = "typing-indicator";
    typingEl.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;

    elements.messagesContainer.appendChild(typingEl);
    this.scrollToBottom();
  },

  removeTypingIndicator() {
    const typingEl = document.getElementById("typing-indicator");
    if (typingEl) {
      typingEl.remove();
    }
  },

  scrollToBottom() {
    elements.messagesContainer.scrollTop =
      elements.messagesContainer.scrollHeight;
  },

  async loadModels() {
    try {
      elements.modelSelector.innerHTML =
        '<option value="">Loading models...</option>';

      const models = await OpenRouterAPI.fetchFreeModels();
      APP_STATE.availableModels = models;

      elements.modelSelector.innerHTML = "";

      if (models.length === 0) {
        elements.modelSelector.innerHTML =
          '<option value="">No free models available</option>';
        return;
      }

      models.forEach((model) => {
        const option = document.createElement("option");
        option.value = model.id;
        option.textContent = `${model.name || model.id}`;
        elements.modelSelector.appendChild(option);
      });

      // Select previously selected model or first model
      if (
        APP_STATE.selectedModel &&
        models.find((m) => m.id === APP_STATE.selectedModel)
      ) {
        elements.modelSelector.value = APP_STATE.selectedModel;
      } else {
        elements.modelSelector.value = models[0].id;
        APP_STATE.selectedModel = models[0].id;
        localStorage.setItem("selected_model", APP_STATE.selectedModel);
      }
    } catch (error) {
      console.error("Error loading models:", error);
      elements.modelSelector.innerHTML =
        '<option value="">Error loading models</option>';
      this.showError("Failed to load models. Please check your API key.");
    }
  },

  showError(message) {
    const errorEl = document.createElement("div");
    errorEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
    errorEl.textContent = message;

    document.body.appendChild(errorEl);

    setTimeout(() => {
      errorEl.style.animation = "slideOut 0.3s ease";
      setTimeout(() => errorEl.remove(), 300);
    }, 4000);
  },
};

// ===========================
// Event Handlers
// ===========================
async function handleSendMessage() {
  const messageText = elements.messageInput.value.trim();

  if (!messageText || APP_STATE.isLoading) return;

  if (!APP_STATE.selectedModel) {
    UI.showError("Please select a model first");
    return;
  }

  // Create conversation if none exists
  if (!ConversationManager.getCurrentConversation()) {
    ConversationManager.createConversation();
    UI.renderConversations();
  }

  // Add user message
  ConversationManager.addMessage("user", messageText);
  elements.messageInput.value = "";
  elements.messageInput.style.height = "auto";
  UI.renderMessages();

  // Show typing indicator
  UI.addTypingIndicator();
  APP_STATE.isLoading = true;
  elements.sendBtn.disabled = true;

  try {
    const conversation = ConversationManager.getCurrentConversation();
    const messages = conversation.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await OpenRouterAPI.sendMessage(
      messages,
      APP_STATE.selectedModel
    );

    UI.removeTypingIndicator();
    ConversationManager.addMessage("assistant", response);
    UI.renderMessages();
    UI.renderConversations();
  } catch (error) {
    UI.removeTypingIndicator();
    UI.showError(error.message || "Failed to get response from AI");
    console.error("Error:", error);
  } finally {
    APP_STATE.isLoading = false;
    elements.sendBtn.disabled = false;
  }
}

function handleNewConversation() {
  ConversationManager.createConversation();
  UI.renderConversations();
  UI.renderMessages();
}

function handleModelChange(event) {
  APP_STATE.selectedModel = event.target.value;
  localStorage.setItem("selected_model", APP_STATE.selectedModel);
}

function handleSaveApiKey() {
  const apiKey = elements.apiKeyInput.value.trim();

  if (!apiKey) {
    UI.showError("Please enter a valid API key");
    return;
  }

  APP_STATE.apiKey = apiKey;
  localStorage.setItem("openrouter_api_key", apiKey);
  UI.hideApiKeyModal();
  UI.loadModels();
}

function handleSettings() {
  elements.apiKeyInput.value = APP_STATE.apiKey;
  UI.showApiKeyModal();
}

// Auto-resize textarea
function handleTextareaInput() {
  elements.messageInput.style.height = "auto";
  elements.messageInput.style.height =
    elements.messageInput.scrollHeight + "px";
}

// Handle Enter key to send message
function handleKeyPress(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    handleSendMessage();
  }
}

// ===========================
// Event Listeners
// ===========================
elements.saveApiKeyBtn.addEventListener("click", handleSaveApiKey);
elements.newConversationBtn.addEventListener("click", handleNewConversation);
elements.sendBtn.addEventListener("click", handleSendMessage);
elements.modelSelector.addEventListener("change", handleModelChange);
elements.settingsBtn.addEventListener("click", handleSettings);
elements.messageInput.addEventListener("input", handleTextareaInput);
elements.messageInput.addEventListener("keypress", handleKeyPress);

// Allow Enter to save API key in modal
elements.apiKeyInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    handleSaveApiKey();
  }
});

// ===========================
// Mobile Sidebar Functions
// ===========================
function openMobileSidebar() {
  elements.sidebar.classList.add("open");
  elements.sidebarOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeMobileSidebar() {
  elements.sidebar.classList.remove("open");
  elements.sidebarOverlay.classList.remove("active");
  document.body.style.overflow = "";
}

// Mobile sidebar event listeners
if (elements.mobileMenuToggle) {
  elements.mobileMenuToggle.addEventListener("click", openMobileSidebar);
}

if (elements.sidebarCloseBtn) {
  elements.sidebarCloseBtn.addEventListener("click", closeMobileSidebar);
}

if (elements.sidebarOverlay) {
  elements.sidebarOverlay.addEventListener("click", closeMobileSidebar);
}

// ===========================
// Initialization
// ===========================
async function init() {
  // Check if API key exists
  if (!APP_STATE.apiKey) {
    UI.showApiKeyModal();
  } else {
    // Load models
    await UI.loadModels();
  }

  // Render conversations
  UI.renderConversations();

  // If there's a current conversation, render it
  if (APP_STATE.currentConversationId) {
    UI.renderMessages();
  }
}

// Start the application
init();
