# OpenRouter Free AI Interactive Chat with multiple model options

A sleek, user-friendly Python CLI tool for interactive conversations with multiple free AI models through the [OpenRouter API](https://openrouter.ai/).

![Python](https://img.shields.io/badge/Python-3.7%2B-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Features

- **Multi-Model Support**: Choose from 6+ free AI models
- **Interactive Chat Interface**: Ask questions and get responses in real-time
- **Beautiful Formatting**: Clean, readable output with visual separators
- **Automatic Logging**: All conversations saved to `conversation_log.jsonl`
- **Model Tracking**: Logs include which model was used for each response
- **Easy Setup**: Minimal dependencies and simple configuration
- **Error Handling**: Graceful error messages for API issues

## 📋 Supported Models

All models are **100% free** on OpenRouter:

| # | Model | Provider |
|---|-------|----------|
| 1 | **DeepSeek R1 Turbo** ⭐ | Recommended |
| 2 | Llama 2 70B | Meta |
| 3 | Mistral 7B | Mistral AI |
| 4 | Neural Chat 7B | Intel |
| 5 | Toppy M 7B | Teknium |
| 6 | Qwen 7B Chat | Alibaba |

## ⚙️ Prerequisites

- **Python 3.7** or higher
- **pip** (Python package manager)
- **OpenRouter API key** (free account at [openrouter.ai](https://openrouter.ai))

## 📦 Installation

### 1. Clone or Download

```bash
git clone https://github.com/manumezog/openrouter-interactive-chat.git
cd openrouter-interactive-chat
```

### 2. Install Dependencies

```bash
pip install requests python-dotenv
```

### 3. Configure API Key

Create a `.env` file in the project directory:

```bash
# On Windows (PowerShell)
echo "OPENROUTER_API_KEY=your_api_key_here" > .env

# On macOS/Linux
echo "OPENROUTER_API_KEY=your_api_key_here" > .env
```

**To get your API key:**
1. Visit [openrouter.ai](https://openrouter.ai)
2. Sign up for a free account
3. Go to Settings → Keys
4. Copy your API key
5. Paste it in the `.env` file

## 🎯 Quick Start

### Run the Script

```bash
python openRouterFreeAIchat.py
```

### Select a Model

```
================================================================================
AVAILABLE FREE MODELS
================================================================================
1. DeepSeek R1 Turbo (Recommended)
2. Llama 2 70B
3. Mistral 7B
4. Neural Chat 7B
5. Toppy M 7B
6. Qwen 7B Chat
================================================================================
Select a model (1-6): 1
✓ Selected: DeepSeek R1 Turbo (Recommended)
```

### Start Chatting

```
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

Continue asking questions or type `quit` to exit.

## 💾 Conversation Logs

All conversations are automatically saved to `conversation_log.jsonl` in **JSON Lines format** (one JSON object per line).

### Example Log Entry

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

### Read Logs with Python

```python
import json

with open('conversation_log.jsonl', 'r') as f:
    for line in f:
        entry = json.loads(line)
        print(f"[{entry['timestamp']}] Model: {entry['model_name']}")
        print(f"Q: {entry['question']}")
        print(f"A: {entry['response'][:100]}...\n")
```

### Parse with Command Line

```bash
# View all questions asked
cat conversation_log.jsonl | jq '.question'

# View conversations from a specific model
cat conversation_log.jsonl | jq 'select(.model_name == "DeepSeek R1 Turbo (Recommended)")'

# Count total conversations
cat conversation_log.jsonl | wc -l
```

## 🔧 Code Structure

### Main Functions

#### `display_model_selection()`
Displays available models and returns user's selection with both the model ID and friendly name.

```python
model_id, model_name = display_model_selection()
```

#### `send_question(question, model_id)`
Sends a question to the OpenRouter API using the specified model.

```python
response = send_question("Your question?", "model-id")
```

#### `format_response(response_json)`
Extracts the answer text from the API's JSON response with error handling.

```python
answer = format_response(response.json())
```

#### `save_log(question, status_code, response_text, model_id, model_name)`
Saves conversation entries to the log file with complete metadata.

```python
save_log(question, 200, answer, model_id, model_name)
```

## 🛠️ Configuration

### Change Default Model

Edit the `FREE_MODELS` dictionary in the script to modify available models:

```python
FREE_MODELS = {
    "1": {
        "name": "Your Model Name",
        "id": "your-model-id"
    },
    # ... more models
}
```

### Customize Log Location

Change the `log_file` variable in `save_log()`:

```python
log_file = "my_conversations.jsonl"  # Custom filename
```

## 🐛 Troubleshooting

### ❌ ModuleNotFoundError: No module named 'requests'

**Solution:**
```bash
pip install requests
```

### ❌ ModuleNotFoundError: No module named 'dotenv'

**Solution:**
```bash
pip install python-dotenv
```

### ❌ Error: "OPENROUTER_API_KEY not found"

**Solutions:**
1. Ensure `.env` file exists in the same directory as the script
2. Check that the file contains: `OPENROUTER_API_KEY=your_key`
3. Restart the script after creating/editing `.env`

### ❌ API Error 401: Unauthorized

**Solutions:**
1. Verify your API key is correct
2. Check it's not expired
3. Regenerate from [openrouter.ai/settings](https://openrouter.ai/settings)

### ❌ API Error 429: Too Many Requests

**Solution:** Wait a moment before sending another request (rate limit exceeded).

### ❌ No response received

**Solutions:**
1. Check your internet connection
2. Verify the OpenRouter API is online
3. Try a different model
4. Check if your free tier quota is exhausted

## 📊 Usage Examples

### Get Philosophy Insights

```
Select a model (1-6): 2
Enter your question: What are the main schools of philosophical thought?
```

### Learn Programming Concepts

```
Select a model (1-6): 1
Enter your question: Explain REST APIs in simple terms
```

### Get Writing Help

```
Select a model (1-6): 3
Enter your question: Help me improve this sentence...
```

## 📈 Advanced Usage

### Batch Process Questions

Create a `questions.txt` file:

```bash
# questions.txt
What is AI?
Explain quantum computing
Define machine learning
```

Then process with Python:

```python
import json

with open('questions.txt', 'r') as f:
    for question in f:
        response = send_question(question.strip(), model_id)
        # Process response...
```

### Analyze Sentiment of Responses

```python
from collections import Counter
import json

responses = []
with open('conversation_log.jsonl', 'r') as f:
    for line in f:
        responses.append(json.loads(line)['response'])

# Your sentiment analysis here...
```

### Compare Model Responses

```python
import json
from collections import defaultdict

model_stats = defaultdict(lambda: {'count': 0, 'avg_length': 0})

with open('conversation_log.jsonl', 'r') as f:
    for line in f:
        entry = json.loads(line)
        model = entry['model_name']
        model_stats[model]['count'] += 1
        model_stats[model]['avg_length'] += len(entry['response'])

for model, stats in model_stats.items():
    stats['avg_length'] /= stats['count']
    print(f"{model}: {stats['count']} responses, avg length: {stats['avg_length']:.0f}")
```

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- [OpenRouter API Documentation](https://openrouter.ai/docs)
- [OpenRouter Website](https://openrouter.ai/)
- [Python Requests Library](https://requests.readthedocs.io/)

## ⚡ Performance Tips

1. **Model Selection**: DeepSeek R1 Turbo is fastest and recommended
2. **Question Length**: Shorter, specific questions get faster responses
3. **Batch Requests**: Process multiple questions programmatically instead of interactively
4. **Log Analysis**: Use `jq` for fast log file queries

## 📞 Support

If you encounter issues:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review your `.env` configuration
3. Verify your API key has quota remaining
4. Check OpenRouter's status page

## 🎓 Learning Resources

- [OpenRouter API Docs](https://openrouter.ai/docs)
- [Python Requests Guide](https://docs.python-requests.org/)
- [JSON Lines Format](https://jsonlines.org/)
- [Python Virtual Environments](https://docs.python.org/3/tutorial/venv.html)

---

**Made with ❤️ for the AI community**
