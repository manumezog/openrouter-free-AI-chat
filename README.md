# OpenRouter Free AI Chat 🚀

A versatile, open-source project for chatting with **free AI models** through the [OpenRouter API](https://openrouter.ai/). Available as both a **modern web interface** and a **Python CLI tool**.

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-openrouter--free--ai--chat.web.app-blueviolet)](https://openrouter-free-ai-chat.web.app)
![Python](https://img.shields.io/badge/Python-3.7%2B-blue)
![Firebase](https://img.shields.io/badge/Firebase-Hosting-orange)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

### 🌐 Web Interface

- 🤖 **Multi-Model Support** — Access all free models from OpenRouter
- 💬 **Real-time Chat** — Instant messaging with AI models
- 💾 **Conversation History** — All conversations saved locally in your browser
- 🎨 **Premium Dark Mode** — Modern design with glassmorphism effects
- ⚡ **Fast & Lightweight** — Pure HTML, CSS, JavaScript (no frameworks)
- 📱 **Fully Responsive** — Works on desktop and mobile
- 🔒 **Privacy-First** — API key and data stored only in your browser

### 🐍 Python CLI

- 🎯 **Interactive Mode** — Ask questions in real-time from terminal
- 📝 **Automatic Logging** — All conversations saved to `conversation_log.jsonl`
- 🔄 **Model Switching** — Easily switch between 6+ free models
- 📊 **JSON Lines Format** — Easy to parse and analyze conversations

---

## 🚀 Quick Start

### Option 1: Use the Live Web App

👉 **[https://openrouter-free-ai-chat.web.app](https://openrouter-free-ai-chat.web.app)**

1. Visit the link above
2. Enter your OpenRouter API key when prompted
3. Select a model and start chatting!

### Option 2: Run Locally

#### Web Interface

```bash
# Clone the repository
git clone https://github.com/manumezog/openrouter-free-AI-chat.git
cd openrouter-free-AI-chat

# Open directly in browser
# Just open public/index.html

# Or use a local server
cd public
python -m http.server 8000
# Then visit http://localhost:8000
```

#### Python CLI

```bash
# Clone the repository
git clone https://github.com/manumezog/openrouter-free-AI-chat.git
cd openrouter-free-AI-chat

# Install dependencies
pip install requests python-dotenv

# Configure API key
echo "OPENROUTER_API_KEY=your_api_key_here" > .env

# Run the CLI
python openRouterFreeAIchat.py
```

---

## 🔑 Getting Your API Key

1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for a **free** account
3. Go to **Settings → Keys**
4. Generate and copy your API key
5. Use it in the web app or `.env` file

---

## 📋 Supported Free Models

All models are **100% free** on OpenRouter:

| Model                    | Provider   | Notes             |
| ------------------------ | ---------- | ----------------- |
| **DeepSeek R1 Turbo** ⭐ | DeepSeek   | Recommended, fast |
| Gemini 2.0 Flash         | Google     | Experimental      |
| Llama 2 70B              | Meta       | Large model       |
| Mistral 7B               | Mistral AI | Balanced          |
| Neural Chat 7B           | Intel      | Good quality      |
| Qwen 7B Chat             | Alibaba    | Multilingual      |

> **Note**: Free model availability may change. The app automatically fetches all currently available free models.

---

## 📁 Project Structure

```
openrouter-free-AI-chat/
├── public/                    # Web Interface
│   ├── index.html            # Main HTML structure
│   ├── styles.css            # Premium dark theme styling
│   └── app.js                # Application logic & API integration
├── openRouterFreeAIchat.py   # Python CLI tool
├── requirements.txt          # Python dependencies
├── firebase.json             # Firebase Hosting config
├── .firebaserc               # Firebase project config
├── .env                      # API key (create this)
└── README.md                 # This file
```

---

## 🎨 Web Interface Features

### Design Highlights

- **Dark Mode** — Modern, eye-friendly dark theme
- **Glassmorphism** — Beautiful frosted glass effects
- **Smooth Animations** — Micro-interactions for enhanced UX
- **Custom Scrollbars** — Styled to match the theme
- **Responsive Layout** — Adapts to any screen size

### Usage

1. **API Key Setup** — Enter your key when first prompted (click ⚙️ to change later)
2. **Select Model** — Choose from the dropdown menu
3. **Chat** — Type and press Enter (Shift+Enter for new lines)
4. **Conversations** — Click **+** for new, click sidebar items to switch

### Configuration

```javascript
// Clear all data (run in browser console)
localStorage.clear();

// Or clear specific items
localStorage.removeItem("openrouter_api_key");
localStorage.removeItem("conversations");
```

---

## 🐍 Python CLI Features

### Running the CLI

```bash
python openRouterFreeAIchat.py
```

### Example Session

```
# AVAILABLE FREE MODELS
1. DeepSeek R1 Turbo (Recommended)
2. Llama 2 70B
3. Mistral 7B
...

Select a model (1-6): 1
✓ Selected: DeepSeek R1 Turbo

================================================================================
Enter your question (or 'quit' to exit): What is machine learning?

Sending request...

────────────────────────────────────────────────────────────────────────────────
ANSWER:
────────────────────────────────────────────────────────────────────────────────
Machine learning is a subset of artificial intelligence that enables computer
systems to learn and improve from experience without being explicitly programmed...
────────────────────────────────────────────────────────────────────────────────
✓ Saved to conversation_log.jsonl
```

### Conversation Logs

All CLI conversations are saved to `conversation_log.jsonl`:

```json
{
  "timestamp": "2024-12-04T10:30:45.123456",
  "model_id": "tngtech/deepseek-r1t2-chimera:free",
  "model_name": "DeepSeek R1 Turbo (Recommended)",
  "question": "What is machine learning?",
  "status_code": 200,
  "response": "Machine learning is a subset of artificial intelligence..."
}
```

**Analyze logs:**

```bash
# View all questions
cat conversation_log.jsonl | jq '.question'

# Filter by model
cat conversation_log.jsonl | jq 'select(.model_name | contains("DeepSeek"))'

# Count conversations
cat conversation_log.jsonl | wc -l
```

---

## 🚀 Firebase Deployment

Deploy your own instance:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (first time only)
firebase init hosting
# Select: public directory, configure as SPA: Yes

# Deploy
firebase deploy --only hosting
```

Your app will be available at: `https://your-project-id.web.app`

---

## 🐛 Troubleshooting

| Issue                       | Solution                                              |
| --------------------------- | ----------------------------------------------------- |
| **ModuleNotFoundError**     | `pip install requests python-dotenv`                  |
| **API Key not found**       | Create `.env` file with `OPENROUTER_API_KEY=your_key` |
| **Error 401: Unauthorized** | Check/regenerate API key at openrouter.ai             |
| **Error 429: Rate Limited** | Wait a moment, free models have rate limits           |
| **Provider returned error** | Try a different model, check model availability       |
| **No response**             | Check internet, try different model                   |

---

## 🛠️ Technology Stack

| Component        | Technology                     |
| ---------------- | ------------------------------ |
| **Web Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **CLI**          | Python 3.7+                    |
| **API**          | OpenRouter API                 |
| **Hosting**      | Firebase Hosting               |
| **Storage**      | localStorage / JSONL files     |
| **Fonts**        | Google Fonts (Inter)           |

---

## ⚠️ Important Notes

- **Free Models**: Always verify [OpenRouter pricing](https://openrouter.ai/docs#models) as availability changes
- **Rate Limits**: Free models may have request limits
- **Privacy**: Web app stores everything locally; clear browser data to reset
- **API Key Security**: Never commit your `.env` file or expose your API key

---

## 🤝 Contributing

Contributions welcome! Feel free to:

- 🐛 Report bugs
- 💡 Suggest features
- 🔧 Submit pull requests
- 📖 Improve documentation

---

## 📝 License

This project is open source under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- [OpenRouter](https://openrouter.ai/) — Access to free AI models
- [Firebase](https://firebase.google.com/) — Hosting infrastructure
- [Google Fonts](https://fonts.google.com/) — Inter font family

---

<div align="center">

**Made with ❤️ for the AI community**

[Live Demo](https://openrouter-free-ai-chat.web.app) • [Report Bug](https://github.com/manumezog/openrouter-free-AI-chat/issues) • [Request Feature](https://github.com/manumezog/openrouter-free-AI-chat/issues)

</div>
