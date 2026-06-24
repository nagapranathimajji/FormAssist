# FormAssist Implementation Guide

## Setup Instructions

### Prerequisites
- Python 3.9+
- Bhashini API key
- Mistral or OpenAI API key

### Installation

```bash
git clone https://github.com/nagapranathimajji/FormAssist.git
cd FormAssist
pip install -r requirements.txt
```

### Configuration

```python
# config.py
BHASHINI_API_KEY = "your_key"
MISTRAL_API_KEY = "your_key"
FLASK_PORT = 5000
```

### Running Locally

```bash
python app.py
```

## API Endpoints

### POST /api/transcribe
Transcribes Telugu audio

**Request:**
```json
{
  "audio": "base64_encoded_audio"
}
```

**Response:**
```json
{
  "text": "normalized_telugu_text",
  "confidence": 0.95
}
```

### POST /api/generate-document
Generates formal letter

**Request:**
```json
{
  "text": "user_input",
  "document_type": "complaint|application|report",
  "language": "telugu|english"
}
```

**Response:**
```json
{
  "pdf_url": "download_link",
  "preview": "letter_preview_text"
}
```

## Key Functions

### Speech Processing
```python
def process_speech(audio_file):
    # Transcribe using Web Speech API or backend
    # Normalize using Bhashini
    # Return cleaned text
```

### Document Generation
```python
def generate_formal_letter(text, template_type):
    # Build LLM prompt
    # Generate letter content
    # Insert into template
    # Return formatted text
```

## Testing

```bash
pytest tests/ -v
```

## Deployment

1. Push to GitHub
2. Connect to HuggingFace Spaces
3. Set environment variables
4. Deploy
