"""
OpenRouter API Interactive Chat

An interactive CLI tool for chatting with multiple free AI models via the OpenRouter API.

Features:
- Interactive question-and-answer interface
- Choose from 6+ free AI models
- Beautiful formatted responses
- Automatic conversation logging with model metadata
- JSONL format logs for easy parsing and analysis
- Error handling and validation

Supported Models:
- DeepSeek R1 Turbo (Recommended)
- Llama 2 70B
- Mistral 7B
- Neural Chat 7B
- Toppy M 7B
- Qwen 7B Chat

Requirements:
- Python 3.7+
- requests library
- python-dotenv library
- .env file with OPENROUTER_API_KEY configured

Setup:
1. pip install requests python-dotenv
2. Create .env file with: OPENROUTER_API_KEY=your_api_key
3. python openRouterFreeAIchat.py

Usage:
  Run the script, select a model, then ask questions interactively.
  Type 'quit' to exit.
  
  All conversations are automatically saved to conversation_log.jsonl
"""

import requests
import json
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables from .env file in the current directory
load_dotenv()

# Retrieve API key from environment - this key is used to authenticate with OpenRouter
api_key = os.getenv("OPENROUTER_API_KEY")

# Available free models on OpenRouter
# These are models that can be used without credits
FREE_MODELS = {
    "1": {
        "name": "DeepSeek R1 Turbo (Recommended)",
        "id": "tngtech/deepseek-r1t2-chimera:free"
    },
    "2": {
        "name": "Llama 2 70B",
        "id": "meta-llama/llama-2-70b-chat"
    },
    "3": {
        "name": "Mistral 7B",
        "id": "mistralai/mistral-7b-instruct"
    },
    "4": {
        "name": "Neural Chat 7B",
        "id": "intel/neural-chat-7b"
    },
    "5": {
        "name": "Toppy M 7B",
        "id": "undi95/toppy-m-7b"
    },
    "6": {
        "name": "Qwen 7B Chat",
        "id": "qwen/qwen-7b-chat"
    }
}

def display_model_selection():
  """
  Display available free models and get user selection.
  
  Returns:
    tuple: (model_id, model_name) - The selected model ID and its display name
  """
  print("\n" + "="*80)
  print("AVAILABLE FREE MODELS")
  print("="*80)
  
  for key, model in FREE_MODELS.items():
    print(f"{key}. {model['name']}")
  
  print("="*80)
  
  while True:
    choice = input("Select a model (1-6): ").strip()
    if choice in FREE_MODELS:
      selected = FREE_MODELS[choice]
      print(f"✓ Selected: {selected['name']}")
      return selected["id"], selected["name"]
    else:
      print(f"Invalid choice. Please enter a number between 1 and 6.")

def send_question(question, model_id):
  """
  Send a question to the OpenRouter API and return the raw response.
  
  Args:
    question (str): The user's question to send to the model
    model_id (str): The OpenRouter model ID to use
    
  Returns:
    requests.Response: The full API response object containing status code and body
    
  The API endpoint uses the specified model.
  The request includes proper headers for API authentication and content type.
  """
  response = requests.post(
    url="https://openrouter.ai/api/v1/chat/completions",
    headers={
      "Authorization": f"Bearer {api_key}",  # API authentication
      "Content-Type": "application/json"     # Specify JSON content format
    },
    data=json.dumps({
      "model": model_id,  # Use the selected model
      "messages": [
        {
          "role": "user",  # Identify this as a user message (not assistant)
          "content": question  # The actual question text
        }
      ]
    })
  )
  return response

def format_response(response_json):
  """
  Extract the text answer from the OpenRouter API JSON response.
  
  Args:
    response_json (dict): Parsed JSON response from the API
    
  Returns:
    str: The assistant's answer text, or an error message if parsing fails
    
  The OpenRouter API returns responses in this structure:
    {
      "choices": [
        {
          "message": {
            "content": "<the answer>"
          }
        }
      ]
    }
  
  This function safely extracts the content with error handling.
  """
  try:
    # Check if we have choices in the response
    if "choices" in response_json and len(response_json["choices"]) > 0:
      # Extract the message content from the first choice
      return response_json["choices"][0]["message"]["content"]
    else:
      return "No response content found"
  except (KeyError, IndexError) as e:
    # If the response structure is unexpected, return a helpful error
    return f"Error parsing response: {str(e)}"

def save_log(question, status_code, response_text, model_id, model_name):
  """
  Save a question and answer pair to the conversation log.
  
  Args:
    question (str): The user's question
    status_code (int): HTTP status code from the API response
    response_text (str): The model's answer or error message
    model_id (str): The OpenRouter model ID that was used
    model_name (str): The display name of the model
    
  The log is stored in JSONL format (JSON Lines):
  - One JSON object per line
  - Each line is a separate conversation entry
  - Can be easily parsed by other tools
  
  This allows the conversation history to accumulate over time.
  """
  log_entry = {
    "timestamp": datetime.now().isoformat(),  # ISO format timestamp for sorting
    "model_id": model_id,                     # The model ID used
    "model_name": model_name,                 # The model display name
    "question": question,                     # The user's input
    "status_code": status_code,              # HTTP status for debugging
    "response": response_text                 # The model's answer
  }
  
  log_file = "conversation_log.jsonl"
  with open(log_file, "a") as f:
    # Append mode ("a") ensures we don't overwrite previous conversations
    f.write(json.dumps(log_entry) + "\n")

# ============================================================================
# MAIN INTERACTIVE LOOP
# ============================================================================
# First, let the user select a model
selected_model_id, selected_model_name = display_model_selection()

# This loop keeps running until the user types 'quit'
while True:
  # Display separator for readability
  print("\n" + "="*80)
  
  # Prompt for user input
  question = input("Enter your question (or 'quit' to exit): ").strip()
  
  # Check for exit condition
  if question.lower() == 'quit':
    print("Goodbye!")
    break
  
  # Validate that user entered something
  if not question:
    print("Please enter a question.")
    continue
  
  # Provide feedback to user
  print("\nSending request...")
  
  # Send the question to the API with the selected model
  response = send_question(question, selected_model_id)
  
  # Handle successful response
  if response.status_code == 200:
    # Parse the JSON response body
    response_json = response.json()
    
    # Extract just the answer text in a readable format
    answer = format_response(response_json)
    
    # Display the answer with clear formatting
    print("\n" + "─"*80)
    print("ANSWER:")
    print("─"*80)
    print(answer)
    print("─"*80)
    
    # Automatically save this conversation turn to the log file with model info
    save_log(question, response.status_code, answer, selected_model_id, selected_model_name)
    print(f"✓ Saved to conversation_log.jsonl")
  
  # Handle error responses from the API
  else:
    # Build an error message with the HTTP status and response body
    error_msg = f"Error {response.status_code}: {response.text}"
    print(f"\n❌ {error_msg}")
    
    # Log the error as well for debugging, including model info
    save_log(question, response.status_code, error_msg, selected_model_id, selected_model_name)
