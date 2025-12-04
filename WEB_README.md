# OpenRouter Free AI Chat 🚀

A beautiful, modern web interface for chatting with free AI models from OpenRouter. Features a premium dark mode design, conversation history, and seamless model switching.

![Modern AI Chat Interface](https://img.shields.io/badge/AI-Chat-blueviolet) ![Firebase](https://img.shields.io/badge/Firebase-Hosting-orange) ![OpenRouter](https://img.shields.io/badge/OpenRouter-API-green)

## ✨ Features

- 🤖 **Multi-Model Support**: Access all free models available on OpenRouter
- 💬 **Real-time Chat**: Instant messaging with AI models
- 💾 **Conversation History**: All conversations saved locally in your browser
- 🎨 **Premium Design**: Modern dark mode with glassmorphism effects
- ⚡ **Fast & Lightweight**: Pure HTML, CSS, and JavaScript - no frameworks
- 📱 **Responsive**: Works beautifully on desktop and mobile devices
- 🔒 **Privacy-First**: API key and conversations stored locally

## 🚀 Quick Start

### Prerequisites

- A free [OpenRouter](https://openrouter.ai/) account and API key
- [Firebase CLI](https://firebase.google.com/docs/cli) installed (for deployment)
- Node.js and npm (for Firebase CLI)

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/openrouter-free-AI-chat.git
   cd openrouter-free-AI-chat
   ```

2. **Open locally**

   Simply open `public/index.html` in your browser, or use a local server:

   ```bash
   # Using Python
   cd public
   python -m http.server 8000

   # Using Node.js http-server
   npx http-server public -p 8000
   ```

3. **Get your OpenRouter API key**
   - Visit [OpenRouter.ai](https://openrouter.ai/)
   - Sign up for a free account
   - Navigate to the API Keys section
   - Generate a new API key
   - Enter it when prompted in the application

### Firebase Deployment

1. **Install Firebase CLI**

   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**

   ```bash
   firebase login
   ```

3. **Initialize Firebase (first time only)**

   ```bash
   firebase init hosting
   ```

   When prompted:

   - Select "Use an existing project" or create a new one
   - Set `public` as your public directory
   - Configure as a single-page app: **Yes**
   - Don't overwrite index.html

4. **Update `.firebaserc`**

   Edit `.firebaserc` and replace `your-project-id` with your Firebase project ID:

   ```json
   {
     "projects": {
       "default": "your-actual-project-id"
     }
   }
   ```

5. **Deploy**

   ```bash
   firebase deploy
   ```

6. **Access your app**

   Your app will be available at: `https://your-project-id.web.app`

## 🎯 Usage

1. **First-time setup**: Enter your OpenRouter API key when prompted
2. **Select a model**: Choose from the dropdown of available free models
3. **Start chatting**: Type your message and press Enter (Shift+Enter for new lines)
4. **Manage conversations**:
   - Click the **+** button to create a new conversation
   - Click any conversation in the sidebar to switch to it
   - All conversations are auto-saved

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Hosting**: Firebase Hosting
- **API**: OpenRouter API
- **Storage**: Browser localStorage
- **Fonts**: Google Fonts (Inter)

## 📁 Project Structure

```
openrouter-free-AI-chat/
├── public/
│   ├── index.html      # Main HTML structure
│   ├── styles.css      # Design system and styling
│   └── app.js          # Application logic and API integration
├── firebase.json       # Firebase Hosting configuration
├── .firebaserc        # Firebase project configuration
└── README.md          # Documentation
```

## 🎨 Design Features

- **Dark Mode**: Easy on the eyes with a modern dark theme
- **Glassmorphism**: Beautiful frosted glass effects
- **Smooth Animations**: Micro-interactions for enhanced UX
- **Responsive Layout**: Adapts to any screen size
- **Custom Scrollbars**: Styled to match the theme

## 🔧 Configuration

### API Key Storage

The API key is stored in `localStorage` under the key `openrouter_api_key`. To change it:

1. Click the settings icon (⚙️) in the header
2. Enter your new API key
3. Click Save

### Conversation Data

All conversations are stored locally in `localStorage`. To clear:

```javascript
// Open browser console and run:
localStorage.clear();
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## ⚠️ Important Notes

- **API Costs**: This app uses OpenRouter's free models. Always check the [OpenRouter pricing](https://openrouter.ai/docs#models) to ensure models remain free.
- **Rate Limits**: Free models may have rate limits. Check OpenRouter documentation for details.
- **Data Privacy**: All data is stored locally in your browser. Clear your browser data to reset.

## 🙏 Acknowledgments

- [OpenRouter](https://openrouter.ai/) for providing access to free AI models
- [Firebase](https://firebase.google.com/) for hosting infrastructure
- [Google Fonts](https://fonts.google.com/) for the Inter font family

---

Built with ❤️ for the AI community
