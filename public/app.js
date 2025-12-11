// ===========================
// Application State
// ===========================
const APP_STATE = {
  apiKey: localStorage.getItem("openrouter_api_key") || "",
  conversations: JSON.parse(localStorage.getItem("conversations") || "[]"),
  currentConversationId:
    localStorage.getItem("current_conversation_id") || null,
  allModels: [], // All fetched models
  availableModels: [], // Filtered models based on current filter
  // Chat mode: 'single' or 'compare'
  chatMode: localStorage.getItem("chat_mode") || "single",
  // Model filter: 'free', 'paid', or 'all'
  modelFilter: localStorage.getItem("model_filter") || "free",
  // Single model selection
  selectedModelSingle: localStorage.getItem("selected_model_single") || "",
  // Dual model selection
  selectedModelA: localStorage.getItem("selected_model_a") || "",
  selectedModelB: localStorage.getItem("selected_model_b") || "",
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
  // Toggle controls
  chatModeToggle: document.getElementById("chat-mode-toggle"),
  modelFilterToggle: document.getElementById("model-filter-toggle"),
  // Single model selector
  singleModelSelector: document.getElementById("single-model-selector"),
  modelSelectorSingle: document.getElementById("model-selector-single"),
  // Dual model selectors
  dualModelSelectors: document.getElementById("dual-model-selectors"),
  modelSelectorA: document.getElementById("model-selector-a"),
  modelSelectorB: document.getElementById("model-selector-b"),
  panelAModelName: document.getElementById("panel-a-model-name"),
  panelBModelName: document.getElementById("panel-b-model-name"),
  // Chat containers
  singleChatContainer: document.getElementById("single-chat-container"),
  comparisonContainer: document.getElementById("comparison-container"),
  // Message containers
  messagesContainerSingle: document.getElementById("messages-container-single"),
  messagesContainerA: document.getElementById("messages-container-a"),
  messagesContainerB: document.getElementById("messages-container-b"),
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

  async fetchAllModels() {
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
      return data.data || [];
    } catch (error) {
      console.error("Error fetching models:", error);
      throw error;
    }
  },
  
  // Filter models based on free/paid/all selection
  filterModels(allModels, filter) {
    if (filter === 'all') {
      return allModels;
    }
    
    return allModels.filter((model) => {
      const pricing = model.pricing;
      const isFree = pricing &&
        (pricing.prompt === "0" || pricing.prompt === 0 || parseFloat(pricing.prompt) === 0) &&
        (pricing.completion === "0" || pricing.completion === 0 || parseFloat(pricing.completion) === 0);
      
      return filter === 'free' ? isFree : !isFree;
    });
  },

  async sendMessage(messages, model) {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${APP_STATE.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://ai-chat.mezapps.com/",
          "X-Title": "AIchatApp",
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
      // Return full response data for metrics
      return {
        content: data.choices[0].message.content,
        usage: data.usage || {},
        model: data.model || model,
      };
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },
  
  // Get model pricing info
  getModelPricing(modelId) {
    const model = APP_STATE.availableModels.find(m => m.id === modelId);
    if (model && model.pricing) {
      return {
        prompt: parseFloat(model.pricing.prompt) || 0,
        completion: parseFloat(model.pricing.completion) || 0,
      };
    }
    return { prompt: 0, completion: 0 };
  },
};

// ===========================
// Conversation Management
// ===========================
const ConversationManager = {
  createConversation() {
    const newConversation = {
      id: Date.now().toString(),
      title: "New Comparison",
      messages: [], // Will contain messages with panel indicator
      modelA: APP_STATE.selectedModelA,
      modelB: APP_STATE.selectedModelB,
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

  addMessage(role, content, panel = null, model = null, metrics = null) {
    const conversation = this.getCurrentConversation();
    if (!conversation) return;

    conversation.messages.push({
      role: role,
      content: content,
      panel: panel, // 'A', 'B', or null for user messages
      model: model,
      metrics: metrics, // { timeElapsed, wordCount, tokenCount, cost }
      timestamp: new Date().toISOString(),
    });

    // Update conversation title based on first user message
    if (
      role === "user" &&
      conversation.messages.filter((m) => m.role === "user").length === 1
    ) {
      conversation.title =
        content.substring(0, 40) + (content.length > 40 ? "..." : "");
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
                    <p>No comparisons yet.</p>
                    <p style="font-size: var(--font-size-sm); margin-top: var(--spacing-sm);">Select two models and start comparing!</p>
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
                    <span>${conversation.messages.filter(m => m.role === 'user').length} prompts</span>
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
      // Show welcome screens
      this.showWelcomeScreens();
      return;
    }

    if (APP_STATE.chatMode === 'single') {
      // Single mode rendering
      if (!elements.messagesContainerSingle) return;
      elements.messagesContainerSingle.innerHTML = "";
      
      conversation.messages.forEach((message) => {
        // In single mode, show user messages and assistant messages from single mode or panel A
        if (message.role === "user" || message.panel === 'single' || message.panel === 'A') {
          const messageEl = this.createMessageElement(message, "single");
          elements.messagesContainerSingle.appendChild(messageEl);
        }
      });
    } else {
      // Compare mode rendering
      if (elements.messagesContainerA) elements.messagesContainerA.innerHTML = "";
      if (elements.messagesContainerB) elements.messagesContainerB.innerHTML = "";

      conversation.messages.forEach((message) => {
        if (message.role === "user") {
          // User messages appear in both panels
          if (elements.messagesContainerA) {
            const messageElA = this.createMessageElement(message, "A");
            elements.messagesContainerA.appendChild(messageElA);
          }
          if (elements.messagesContainerB) {
            const messageElB = this.createMessageElement(message, "B");
            elements.messagesContainerB.appendChild(messageElB);
          }
        } else if (message.panel === "A" && elements.messagesContainerA) {
          const messageEl = this.createMessageElement(message, "A");
          elements.messagesContainerA.appendChild(messageEl);
        } else if (message.panel === "B" && elements.messagesContainerB) {
          const messageEl = this.createMessageElement(message, "B");
          elements.messagesContainerB.appendChild(messageEl);
        }
      });
    }

    this.scrollToBottom();
  },

  showWelcomeScreens() {
    if (APP_STATE.chatMode === 'single') {
      if (elements.messagesContainerSingle) {
        elements.messagesContainerSingle.innerHTML = `
          <div class="welcome-screen">
            <h2>Welcome to OpenRouter AI Chat! 🚀</h2>
            <p>Select a model above and start chatting with AI.</p>
            <div class="feature-grid">
              <div class="feature-card">
                <span class="feature-icon">🤖</span>
                <h3>Multiple Models</h3>
                <p>Access free and paid AI models</p>
              </div>
              <div class="feature-card">
                <span class="feature-icon">💾</span>
                <h3>Save History</h3>
                <p>All chats saved locally</p>
              </div>
              <div class="feature-card">
                <span class="feature-icon">⚡</span>
                <h3>Fast & Simple</h3>
                <p>Clean interface, no signup</p>
              </div>
            </div>
          </div>
        `;
      }
      return;
    }
    
    // Compare mode welcome screens
    if (elements.messagesContainerA) {
      elements.messagesContainerA.innerHTML = `
      <div class="welcome-screen">
        <h2>Compare AI Models! 🔄</h2>
        <p>Select two models above and start chatting to compare their responses side-by-side.</p>
        <div class="feature-grid">
          <div class="feature-card">
            <span class="feature-icon">⚖️</span>
            <h3>Side-by-Side</h3>
            <p>Compare responses in real-time</p>
          </div>
          <div class="feature-card">
            <span class="feature-icon">🚀</span>
            <h3>Parallel Requests</h3>
            <p>Both models respond simultaneously</p>
          </div>
          <div class="feature-card">
            <span class="feature-icon">💾</span>
            <h3>Save History</h3>
            <p>All comparisons saved locally</p>
          </div>
        </div>
      </div>
    `;
    }
    
    if (elements.messagesContainerB) {
      elements.messagesContainerB.innerHTML = `
      <div class="welcome-screen">
        <h2>Ready to Compare! ⚡</h2>
        <p>Type a message below to see how different AI models respond.</p>
        <div class="feature-grid">
          <div class="feature-card">
            <span class="feature-icon">🤖</span>
            <h3>Free Models</h3>
            <p>Access all OpenRouter free models</p>
          </div>
          <div class="feature-card">
            <span class="feature-icon">🎯</span>
            <h3>Find the Best</h3>
            <p>Discover which model suits your needs</p>
          </div>
          <div class="feature-card">
            <span class="feature-icon">⚡</span>
            <h3>Fast & Simple</h3>
            <p>Clean interface, no signup required</p>
          </div>
        </div>
      </div>
    `;
    }
  },

  createMessageElement(message, panel) {
    const messageEl = document.createElement("div");
    messageEl.className = `message ${message.role}`;

    const avatar = message.role === "user" ? "👤" : "🤖";
    
    // Build metrics HTML if available
    let metricsHtml = '';
    if (message.role === 'assistant' && message.metrics) {
      const m = message.metrics;
      metricsHtml = `
        <div class="message-metrics">
          <span class="metric">⏱️ ${m.timeElapsed}s</span>
          <span class="metric">📝 ${m.wordCount} words</span>
          <span class="metric">🔤 ${m.tokenCount} tokens</span>
          <span class="metric">💰 $${m.cost}</span>
        </div>
      `;
    }

    messageEl.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
              ${this.formatMessageContent(message.content)}
              ${metricsHtml}
            </div>
        `;

    return messageEl;
  },

  formatMessageContent(content) {
    // Comprehensive markdown formatting
    let formatted = content;

    // Escape HTML to prevent XSS
    formatted = formatted
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks with syntax highlighting hint
    formatted = formatted.replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      '<pre class="code-block"><code class="language-$1">$2</code></pre>'
    );

    // Inline code (must come after code blocks)
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Tables - detect and format markdown tables
    formatted = formatted.replace(
      /(?:^|\n)((?:\|[^\n]+\|\n)+)/g,
      (match, tableContent) => {
        const rows = tableContent.trim().split('\n');
        let tableHtml = '<table class="md-table">';
        
        rows.forEach((row, index) => {
          // Skip separator row (|---|---|)
          if (row.match(/^\|[\s\-:]+\|$/)) return;
          
          const cells = row.split('|').filter(cell => cell.trim() !== '');
          const tag = index === 0 ? 'th' : 'td';
          const rowTag = index === 0 ? 'thead' : (index === 1 ? 'tbody' : '');
          
          if (index === 0) tableHtml += '<thead>';
          if (index === 1) tableHtml += '</thead><tbody>';
          
          tableHtml += '<tr>';
          cells.forEach(cell => {
            tableHtml += `<${tag}>${cell.trim()}</${tag}>`;
          });
          tableHtml += '</tr>';
        });
        
        tableHtml += '</tbody></table>';
        return tableHtml;
      }
    );

    // Headers (h1-h6) - must be at start of line
    formatted = formatted.replace(/^###### (.+)$/gm, '<h6>$1</h6>');
    formatted = formatted.replace(/^##### (.+)$/gm, '<h5>$1</h5>');
    formatted = formatted.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    formatted = formatted.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    formatted = formatted.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    formatted = formatted.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Horizontal rule
    formatted = formatted.replace(/^---+$/gm, '<hr>');

    // Blockquotes
    formatted = formatted.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

    // Unordered lists
    formatted = formatted.replace(/^[\*\-] (.+)$/gm, '<li class="ul-item">$1</li>');
    formatted = formatted.replace(/((?:<li class="ul-item">.*<\/li>\n?)+)/g, '<ul>$1</ul>');

    // Ordered lists
    formatted = formatted.replace(/^\d+\. (.+)$/gm, '<li class="ol-item">$1</li>');
    formatted = formatted.replace(/((?:<li class="ol-item">.*<\/li>\n?)+)/g, '<ol>$1</ol>');

    // Links [text](url)
    formatted = formatted.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>'
    );

    // Bold **text** or __text__
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // Italic *text* or _text_
    formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/_([^_]+)_/g, '<em>$1</em>');

    // Strikethrough ~~text~~
    formatted = formatted.replace(/~~(.+?)~~/g, '<del>$1</del>');

    // Line breaks (but not inside pre/code blocks)
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Clean up extra <br> after block elements
    formatted = formatted.replace(/<\/(h[1-6]|p|ul|ol|li|blockquote|table|pre|hr)><br>/g, '</$1>');
    formatted = formatted.replace(/<(hr)><br>/g, '<$1>');

    return formatted;
  },

  addTypingIndicator(panel) {
    let container;
    if (panel === 'single') {
      container = elements.messagesContainerSingle;
    } else if (panel === 'A') {
      container = elements.messagesContainerA;
    } else {
      container = elements.messagesContainerB;
    }
    if (!container) return;
    
    const typingEl = document.createElement("div");
    typingEl.className = "message assistant";
    typingEl.id = `typing-indicator-${panel}`;
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

    container.appendChild(typingEl);
    this.scrollToBottom();
  },

  removeTypingIndicator(panel) {
    const typingEl = document.getElementById(`typing-indicator-${panel}`);
    if (typingEl) {
      typingEl.remove();
    }
  },

  scrollToBottom() {
    if (APP_STATE.chatMode === 'single') {
      if (elements.messagesContainerSingle) {
        elements.messagesContainerSingle.scrollTop = elements.messagesContainerSingle.scrollHeight;
      }
    } else {
      if (elements.messagesContainerA) {
        elements.messagesContainerA.scrollTop = elements.messagesContainerA.scrollHeight;
      }
      if (elements.messagesContainerB) {
        elements.messagesContainerB.scrollTop = elements.messagesContainerB.scrollHeight;
      }
    }
  },

  async loadModels() {
    try {
      // Set loading state on all model selectors
      if (elements.modelSelectorSingle) {
        elements.modelSelectorSingle.innerHTML = '<option value="">Loading models...</option>';
      }
      if (elements.modelSelectorA) {
        elements.modelSelectorA.innerHTML = '<option value="">Loading models...</option>';
      }
      if (elements.modelSelectorB) {
        elements.modelSelectorB.innerHTML = '<option value="">Loading models...</option>';
      }

      // Fetch all models
      const allModels = await OpenRouterAPI.fetchAllModels();
      APP_STATE.allModels = allModels;
      
      // Apply filter
      this.applyModelFilter();
    } catch (error) {
      console.error("Error loading models:", error);
      if (elements.modelSelectorSingle) {
        elements.modelSelectorSingle.innerHTML = '<option value="">Error loading models</option>';
      }
      if (elements.modelSelectorA) {
        elements.modelSelectorA.innerHTML = '<option value="">Error loading models</option>';
      }
      if (elements.modelSelectorB) {
        elements.modelSelectorB.innerHTML = '<option value="">Error loading models</option>';
      }
      this.showError("Failed to load models. Please check your API key.");
    }
  },
  
  applyModelFilter() {
    const models = OpenRouterAPI.filterModels(APP_STATE.allModels, APP_STATE.modelFilter);
    APP_STATE.availableModels = models;
    
    // Populate all selectors
    this.populateModelSelector(elements.modelSelectorSingle, models);
    this.populateModelSelector(elements.modelSelectorA, models);
    this.populateModelSelector(elements.modelSelectorB, models);
    
    if (models.length === 0) {
      const filterLabels = { free: 'free', paid: 'paid', all: '' };
      const msg = `No ${filterLabels[APP_STATE.modelFilter]} models available`;
      if (elements.modelSelectorSingle) elements.modelSelectorSingle.innerHTML = `<option value="">${msg}</option>`;
      if (elements.modelSelectorA) elements.modelSelectorA.innerHTML = `<option value="">${msg}</option>`;
      if (elements.modelSelectorB) elements.modelSelectorB.innerHTML = `<option value="">${msg}</option>`;
      return;
    }
    
    // Restore selections or set defaults
    // Single mode
    if (APP_STATE.selectedModelSingle && models.find(m => m.id === APP_STATE.selectedModelSingle)) {
      if (elements.modelSelectorSingle) elements.modelSelectorSingle.value = APP_STATE.selectedModelSingle;
    } else {
      APP_STATE.selectedModelSingle = models[0].id;
      localStorage.setItem("selected_model_single", APP_STATE.selectedModelSingle);
      if (elements.modelSelectorSingle) elements.modelSelectorSingle.value = models[0].id;
    }
    
    // Compare mode - Model A
    if (APP_STATE.selectedModelA && models.find(m => m.id === APP_STATE.selectedModelA)) {
      if (elements.modelSelectorA) elements.modelSelectorA.value = APP_STATE.selectedModelA;
    } else {
      APP_STATE.selectedModelA = models[0].id;
      localStorage.setItem("selected_model_a", APP_STATE.selectedModelA);
      if (elements.modelSelectorA) elements.modelSelectorA.value = models[0].id;
    }
    
    // Compare mode - Model B
    if (APP_STATE.selectedModelB && models.find(m => m.id === APP_STATE.selectedModelB)) {
      if (elements.modelSelectorB) elements.modelSelectorB.value = APP_STATE.selectedModelB;
    } else {
      const secondIdx = models.length > 1 ? 1 : 0;
      APP_STATE.selectedModelB = models[secondIdx].id;
      localStorage.setItem("selected_model_b", APP_STATE.selectedModelB);
      if (elements.modelSelectorB) elements.modelSelectorB.value = models[secondIdx].id;
    }
    
    this.updatePanelLabels();
  },
  
  populateModelSelector(selector, models) {
    if (!selector) return;
    selector.innerHTML = '';
    models.forEach(model => {
      const option = document.createElement('option');
      option.value = model.id;
      option.textContent = model.name || model.id;
      selector.appendChild(option);
    });
  },
  
  updateChatMode() {
    const isSingle = APP_STATE.chatMode === 'single';
    
    // Toggle UI elements
    if (elements.singleModelSelector) {
      elements.singleModelSelector.style.display = isSingle ? 'flex' : 'none';
    }
    if (elements.dualModelSelectors) {
      elements.dualModelSelectors.style.display = isSingle ? 'none' : 'flex';
    }
    if (elements.singleChatContainer) {
      elements.singleChatContainer.style.display = isSingle ? 'flex' : 'none';
    }
    if (elements.comparisonContainer) {
      elements.comparisonContainer.style.display = isSingle ? 'none' : 'flex';
    }
    
    // Update toggle button states
    if (elements.chatModeToggle) {
      elements.chatModeToggle.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === APP_STATE.chatMode);
      });
    }
    
    // Render messages for current mode
    this.renderMessages();
  },
  
  updatePanelLabels() {
    if (elements.panelAModelName) {
      const modelA = APP_STATE.availableModels.find(m => m.id === APP_STATE.selectedModelA);
      elements.panelAModelName.textContent = modelA ? (modelA.name || modelA.id) : "Select a model";
    }
    if (elements.panelBModelName) {
      const modelB = APP_STATE.availableModels.find(m => m.id === APP_STATE.selectedModelB);
      elements.panelBModelName.textContent = modelB ? (modelB.name || modelB.id) : "Select a model";
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
            max-width: 400px;
        `;
    errorEl.textContent = message;

    document.body.appendChild(errorEl);

    setTimeout(() => {
      errorEl.style.animation = "slideOut 0.3s ease";
      setTimeout(() => errorEl.remove(), 300);
    }, 4000);
  },
  
  showSuccess(message) {
    const successEl = document.createElement("div");
    successEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 400px;
        `;
    successEl.textContent = message;

    document.body.appendChild(successEl);

    setTimeout(() => {
      successEl.style.animation = "slideOut 0.3s ease";
      setTimeout(() => successEl.remove(), 300);
    }, 3000);
  },
};

// ===========================
// Event Handlers
// ===========================
async function handleSendMessage() {
  const messageText = elements.messageInput.value.trim();

  if (!messageText || APP_STATE.isLoading) return;

  // Validate model selection based on mode
  if (APP_STATE.chatMode === 'single') {
    if (!APP_STATE.selectedModelSingle) {
      UI.showError("Please select a model");
      return;
    }
  } else {
    if (!APP_STATE.selectedModelA || !APP_STATE.selectedModelB) {
      UI.showError("Please select both Model A and Model B");
      return;
    }
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

  APP_STATE.isLoading = true;
  elements.sendBtn.disabled = true;

  // Get conversation messages for context
  const conversation = ConversationManager.getCurrentConversation();
  const messagesForAPI = conversation.messages
    .filter(m => m.role === "user" || m.role === "assistant")
    .reduce((acc, m) => {
      if (m.role === "user") {
        if (!acc.find(msg => msg.content === m.content && msg.role === "user")) {
          acc.push({ role: "user", content: m.content });
        }
      }
      return acc;
    }, []);
  
  const currentMessages = [...messagesForAPI];
  if (!currentMessages.find(m => m.content === messageText)) {
    currentMessages.push({ role: "user", content: messageText });
  }

  // Helper to calculate metrics
  function calculateMetrics(response, modelId) {
    const content = response.content;
    const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    const tokenCount = response.usage?.completion_tokens || Math.ceil(content.length / 4);
    const promptTokens = response.usage?.prompt_tokens || Math.ceil(messageText.length / 4);
    const pricing = OpenRouterAPI.getModelPricing(modelId);
    const cost = ((promptTokens * pricing.prompt) + (tokenCount * pricing.completion)).toFixed(6);
    
    return {
      timeElapsed: response.timeElapsed,
      wordCount: wordCount,
      tokenCount: tokenCount,
      cost: cost,
    };
  }

  if (APP_STATE.chatMode === 'single') {
    // Single mode - send to one model
    UI.addTypingIndicator('single');
    
    const startTime = performance.now();
    try {
      const response = await OpenRouterAPI.sendMessage(currentMessages, APP_STATE.selectedModelSingle);
      response.timeElapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      
      UI.removeTypingIndicator('single');
      const metrics = calculateMetrics(response, APP_STATE.selectedModelSingle);
      ConversationManager.addMessage("assistant", response.content, "single", APP_STATE.selectedModelSingle, metrics);
    } catch (error) {
      UI.removeTypingIndicator('single');
      ConversationManager.addMessage(
        "assistant",
        `❌ Error: ${error.message || "Failed to get response"}`,
        "single",
        APP_STATE.selectedModelSingle
      );
    }
  } else {
    // Compare mode - send to both models in parallel
    UI.addTypingIndicator("A");
    UI.addTypingIndicator("B");

    // Send to both models in parallel with timing
    const startTimeA = performance.now();
    const startTimeB = performance.now();
    
    const [responseA, responseB] = await Promise.allSettled([
      OpenRouterAPI.sendMessage(currentMessages, APP_STATE.selectedModelA).then(result => {
        result.timeElapsed = ((performance.now() - startTimeA) / 1000).toFixed(2);
        return result;
      }),
      OpenRouterAPI.sendMessage(currentMessages, APP_STATE.selectedModelB).then(result => {
        result.timeElapsed = ((performance.now() - startTimeB) / 1000).toFixed(2);
        return result;
      }),
    ]);

    // Handle Model A response
    UI.removeTypingIndicator("A");
    if (responseA.status === "fulfilled") {
      const metrics = calculateMetrics(responseA.value, APP_STATE.selectedModelA);
      ConversationManager.addMessage("assistant", responseA.value.content, "A", APP_STATE.selectedModelA, metrics);
    } else {
      ConversationManager.addMessage(
        "assistant",
        `❌ Error: ${responseA.reason?.message || "Failed to get response"}`,
        "A",
        APP_STATE.selectedModelA
      );
    }

    // Handle Model B response
    UI.removeTypingIndicator("B");
    if (responseB.status === "fulfilled") {
      const metrics = calculateMetrics(responseB.value, APP_STATE.selectedModelB);
      ConversationManager.addMessage("assistant", responseB.value.content, "B", APP_STATE.selectedModelB, metrics);
    } else {
      ConversationManager.addMessage(
        "assistant",
        `❌ Error: ${responseB.reason?.message || "Failed to get response"}`,
        "B",
        APP_STATE.selectedModelB
      );
    }
  }

  UI.renderMessages();
  UI.renderConversations();

  APP_STATE.isLoading = false;
  elements.sendBtn.disabled = false;
}

function handleNewConversation() {
  ConversationManager.createConversation();
  UI.renderConversations();
  UI.renderMessages();
}

function handleModelChangeA(event) {
  APP_STATE.selectedModelA = event.target.value;
  localStorage.setItem("selected_model_a", APP_STATE.selectedModelA);
  UI.updatePanelLabels();
}

function handleModelChangeB(event) {
  APP_STATE.selectedModelB = event.target.value;
  localStorage.setItem("selected_model_b", APP_STATE.selectedModelB);
  UI.updatePanelLabels();
}

function handleModelChangeSingle(event) {
  APP_STATE.selectedModelSingle = event.target.value;
  localStorage.setItem("selected_model_single", APP_STATE.selectedModelSingle);
}

function handleChatModeChange(mode) {
  APP_STATE.chatMode = mode;
  localStorage.setItem("chat_mode", mode);
  UI.updateChatMode();
}

function handleModelFilterChange(filter) {
  APP_STATE.modelFilter = filter;
  localStorage.setItem("model_filter", filter);
  
  // Update toggle button states
  if (elements.modelFilterToggle) {
    elements.modelFilterToggle.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
  }
  
  // Re-apply filter to models
  UI.applyModelFilter();
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
if (elements.modelSelectorA) elements.modelSelectorA.addEventListener("change", handleModelChangeA);
if (elements.modelSelectorB) elements.modelSelectorB.addEventListener("change", handleModelChangeB);
if (elements.modelSelectorSingle) elements.modelSelectorSingle.addEventListener("change", handleModelChangeSingle);
elements.settingsBtn.addEventListener("click", handleSettings);
elements.messageInput.addEventListener("input", handleTextareaInput);
elements.messageInput.addEventListener("keypress", handleKeyPress);

// Chat mode toggle buttons
if (elements.chatModeToggle) {
  elements.chatModeToggle.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => handleChatModeChange(btn.dataset.mode));
  });
}

// Model filter toggle buttons
if (elements.modelFilterToggle) {
  elements.modelFilterToggle.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => handleModelFilterChange(btn.dataset.filter));
  });
}

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
  // Apply saved chat mode on startup
  UI.updateChatMode();
  
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
