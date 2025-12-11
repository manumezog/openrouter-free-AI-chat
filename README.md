# OpenRouter AI Model Comparator ⚖️

Compare responses from **two AI models side-by-side** using free models from [OpenRouter](https://openrouter.ai/). See how different LLMs respond to the same prompts in real-time!

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-openrouter--free--ai--chat.web.app-blueviolet)](https://openrouter-free-ai-chat.web.app)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![Firebase](https://img.shields.io/badge/Firebase-Hosting-orange)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

### ⚖️ Side-by-Side Comparison

- **Dual Model Selection** — Choose two different AI models to compare
- **Split-Screen Interface** — See both responses simultaneously
- **Parallel API Calls** — Both models respond at the same time
- **Color-Coded Panels** — Green for Model A, Orange for Model B

### 📊 Response Metrics

Each AI response displays:

| Metric        | Description                             |
| ------------- | --------------------------------------- |
| ⏱️ **Time**   | Response time in seconds                |
| 📝 **Words**  | Word count of the response              |
| 🔤 **Tokens** | Token count (from API or estimated)     |
| 💰 **Cost**   | Estimated cost (free models show $0.00) |

### 🎨 Rich Markdown Rendering

AI responses are beautifully formatted with support for:

- **Headers** (H1-H6) with proper styling
- **Tables** with borders and alternating rows
- **Code blocks** with syntax highlighting
- **Lists** (ordered and unordered)
- **Blockquotes** with accent styling
- **Links**, **bold**, _italic_, and ~~strikethrough~~

### 💾 Additional Features

- **Conversation History** — All comparisons saved locally
- **Premium Dark Mode** — Modern glassmorphism design
- **Fully Responsive** — Works on desktop and mobile
- **Privacy-First** — Everything stored in your browser

---

## 🚀 Quick Start

### Option 1: Use the Live Web App

👉 **[https://openrouter-free-ai-chat.web.app](https://openrouter-free-ai-chat.web.app)**

1. Visit the link above
2. Enter your OpenRouter API key
3. Select two models to compare
4. Type a prompt and see both responses!

### Option 2: Run Locally

```bash
# Clone the repository
git clone https://github.com/manumezog/openrouter-free-AI-chat.git
cd openrouter-free-AI-chat

# Start a local server
cd public
python -m http.server 8000

# Visit http://localhost:8000
```

---

## 🔑 Getting Your API Key

1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for a **free** account
3. Go to **Settings → Keys**
4. Generate and copy your API key
5. Paste it in the app when prompted

---

## 📋 Supported Free Models

All models are **100% free** on OpenRouter:

| Model            | Provider   | Context |
| ---------------- | ---------- | ------- |
| DeepSeek R1      | DeepSeek   | 64K     |
| Llama 3.3 70B    | Meta       | 131K    |
| Gemini 2.0 Flash | Google     | 1M      |
| Mistral 7B       | Mistral AI | 32K     |
| Qwen 2.5 72B     | Alibaba    | 131K    |

> **Note**: Free model availability changes. The app automatically fetches all currently available free models.

---

## 📁 Project Structure

```
openrouter-free-AI-chat/
├── public/
│   ├── index.html        # Split-screen comparison layout
│   ├── styles.css        # Dark theme + markdown styling
│   └── app.js            # Dual model logic & API integration
├── openRouterFreeAIchat.py  # Python CLI (single model)
├── firebase.json         # Firebase Hosting config
└── README.md
```

---

## 🎯 Use Cases

- **Model Evaluation** — Find the best model for your needs
- **Output Quality** — Compare response quality and style
- **Speed Testing** — See which models respond faster
- **Cost Analysis** — Understand token usage patterns
- **Research** — Study how different LLMs approach problems

---

## 🐍 Python CLI (Single Model)

A simpler CLI tool is also included for terminal-based chats:

```bash
pip install requests python-dotenv
echo "OPENROUTER_API_KEY=your_key" > .env
python openRouterFreeAIchat.py
```

---

## 🚀 Deploy Your Own

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy --only hosting
```

---

## 🛠️ Technology Stack

| Component | Technology                     |
| --------- | ------------------------------ |
| Frontend  | HTML5, CSS3, JavaScript (ES6+) |
| API       | OpenRouter API                 |
| Hosting   | Firebase Hosting               |
| Storage   | localStorage                   |
| Fonts     | Google Fonts (Inter)           |

---

## ⚠️ Notes

- **Free Models**: Verify [OpenRouter pricing](https://openrouter.ai/docs#models) as availability changes
- **Rate Limits**: Free models may have request limits
- **Privacy**: All data stored locally in your browser
- **API Key**: Never commit or expose your API key

---

## 🤝 Contributing

Contributions welcome!

- 🐛 Report bugs
- 💡 Suggest features
- 🔧 Submit pull requests

---

## 📝 License

MIT License - see [LICENSE](LICENSE)

---

<div align="center">

**Compare AI Models Instantly ⚖️**

[Live Demo](https://openrouter-free-ai-chat.web.app) • [Report Bug](https://github.com/manumezog/openrouter-free-AI-chat/issues) • [Request Feature](https://github.com/manumezog/openrouter-free-AI-chat/issues)

</div>
