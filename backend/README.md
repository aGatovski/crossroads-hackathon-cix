# Word Chain Puzzle Backend API

A FastAPI-based backend service that generates and validates word chain puzzle boards using OpenAI's GPT models. The API creates interconnected word chains where each word connects to the next through various linguistic relationships.

## 🎯 Overview

This backend powers a word chain puzzle game where:
- Words are arranged in chains on a grid
- Adjacent words are connected through linguistic relationships (synonyms, antonyms, categories, etc.)
- Chains can overlap and intersect at shared words
- AI validates the authenticity of word connections

## 🚀 Features

- **Board Generation**: Create puzzle boards with configurable chain counts and grid sizes
- **Template Layouts**: Pre-designed layouts (T-Shape, Grid, Ladder, Star patterns)
- **Random Generation**: Dynamic board creation with intelligent word placement
- **Connection Validation**: AI-powered validation of word relationships
- **Category Support**: Generate themed boards (optional)
- **Flexible Configuration**: Customize connection types and difficulty

## 📋 Prerequisites

- Python 3.8+
- OpenAI API key

## 🔧 Installation

1. **Clone the repository** (if not already done):
```bash
cd backend
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Set up environment variables**:
Create a `.env` file in the backend directory:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

## 🏃 Running the Server

### Development Mode
```bash
python main.py
```

The server will start at `http://localhost:8000`

### Production Mode
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 📡 API Endpoints

### Root Endpoint
```
GET /
```
Returns a welcome message.

**Response:**
```json
{
  "message": "Word Chain Puzzle API"
}
```

---

### Generate Board
```
POST /api/board/generate
```
Generate a new game board with word chains.

**Request Body:**
```json
{
  "num_chains": 5,
  "grid_size": 15,
  "connection_types": ["synonym", "antonym", "category"],
  "category": "animals",
  "use_templates": false
}
```

**Parameters:**
- `num_chains` (required): Number of word chains (2-10)
- `grid_size` (optional, default: 15): Grid size (10-20)
- `connection_types` (optional): List of allowed connection types
- `category` (optional): Thematic category for words
- `use_templates` (optional, default: false): Use predefined layouts

**Response:**
```json
{
  "rows": 15,
  "cols": 15,
  "cells": [
    {
      "row": 10,
      "col": 6,
      "word": "cat"
    }
  ],
  "connections": [
    {
      "from_cell": [10, 6],
      "to_cell": [10, 7],
      "connection": "category"
    }
  ],
  "category": "animals"
}
```

---

### Validate Connection
```
POST /api/connection/validate
```
Validate if two words are connected by a specific relationship.

**Request Body:**
```json
{
  "word1": "happy",
  "word2": "sad",
  "connection": "antonym"
}
```

**Response:**
```json
{
  "is_valid": true,
  "reason": "Happy and sad are valid antonyms"
}
```

---

### Validate Board
```
POST /api/board/validate
```
Validate all connections in a complete board.

**Request Body:**
```json
{
  "board": {
    "rows": 15,
    "cols": 15,
    "cells": [...],
    "connections": [...],
    "category": null
  }
}
```

**Response:**
```json
{
  "is_valid": true,
  "invalid_connections": []
}
```

## 🏗️ Project Structure

```
backend/
├── main.py                    # FastAPI application and endpoints
├── models.py                  # Pydantic data models
├── game_logic.py             # Board generation logic
├── connection_validator.py   # AI-powered validation
├── chain_templates.py        # Pre-defined board layouts
├── requirements.txt          # Python dependencies
└── .env                      # Environment variables (not in repo)
```

## 📦 Core Components

### `main.py`
FastAPI application with CORS middleware and API endpoints.

### `models.py`
Pydantic models for request/response validation:
- `Cell`: Single grid cell
- `ConnectionBetweenCells`: Connection between two cells
- `GameBoard`: Complete board structure
- `GenerateBoardRequest`: Board generation parameters
- `ValidationResult`: Connection validation result

### `game_logic.py`
`BoardGenerator` class that:
- Generates word chains using OpenAI
- Places chains on grid with intelligent positioning
- Supports both template-based and random generation
- Handles chain overlaps and intersections

### `connection_validator.py`
`ConnectionValidator` class that:
- Validates word relationships using OpenAI
- Checks individual connections
- Validates entire boards

### `chain_templates.py`
Pre-defined layout templates:
- T-Shape (3 chains)
- Grid Pattern (4 chains)
- Ladder (5 chains)
- Star Pattern (6 chains)
- Compact Grid (7 chains)

## 🎨 Layout Templates

Templates provide structured, aesthetically pleasing board layouts:

| Template | Chains | Description |
|----------|--------|-------------|
| T-Shape | 3 | Three chains forming a T |
| Grid Pattern | 4 | Four chains in a grid |
| Ladder | 5 | Horizontal chains with vertical rungs |
| Star Pattern | 6 | Chains radiating from center |
| Compact Grid | 7 | Dense grid layout |

To use templates, set `use_templates: true` in the generation request.

## 🔍 Connection Types

Common connection types (examples):
- `synonym`: Words with similar meanings
- `antonym`: Words with opposite meanings
- `category`: Words in the same category
- `association`: Loosely related words
- `rhyme`: Words that rhyme
- `compound`: Part of compound words

## 🧪 Testing

Test the API using curl:

```bash
# Generate a board
curl -X POST http://localhost:8000/api/board/generate \
  -H "Content-Type: application/json" \
  -d '{
    "num_chains": 3,
    "grid_size": 15,
    "use_templates": true
  }'

# Validate a connection
curl -X POST http://localhost:8000/api/connection/validate \
  -H "Content-Type: application/json" \
  -d '{
    "word1": "hot",
    "word2": "cold",
    "connection": "antonym"
  }'
```

Or use the interactive API docs at `http://localhost:8000/docs`

## 🛠️ Configuration

### Environment Variables
- `OPENAI_API_KEY`: Your OpenAI API key (required)

### Generation Parameters
- **num_chains**: 2-10 (controls puzzle complexity)
- **grid_size**: 10-20 (controls board size)
- **chain_length**: Fixed at 6 words per chain (configurable in code)

## 📊 Dependencies

- **FastAPI**: Modern web framework
- **Uvicorn**: ASGI server
- **OpenAI**: GPT model integration
- **Pydantic**: Data validation
- **python-dotenv**: Environment variable management
- **httpx**: HTTP client

## 🐛 Troubleshooting

### OpenAI API Errors
- Ensure your API key is valid and has sufficient credits
- Check the `.env` file is properly configured
- The API currently uses `gpt-4o-mini` model

### Board Generation Issues
- If template generation fails, it falls back to random generation
- Reduce `num_chains` or increase `grid_size` if placement fails
- Some word combinations may not be possible with strict connection types

### CORS Issues
- The API allows all origins by default (`allow_origins=["*"]`)
- Modify CORS settings in `main.py` for production

## 🚦 API Status Codes

- `200`: Success
- `422`: Validation error (invalid request parameters)
- `500`: Server error (OpenAI API issues, generation failures)

## 📝 Notes

- Word generation uses OpenAI's GPT-4o-mini model
- Generation can take several seconds depending on chain count
- The API is designed to work with the accompanying frontend
- Some functions in `game_logic.py` have debug return values (`"x"`)

## 🔐 Security Considerations

- Never commit `.env` file with API keys
- Consider rate limiting for production
- Restrict CORS origins in production environments
- Validate and sanitize all user inputs

## 📄 License

Part of the Crossroads Hackathon CIX project.

## 🤝 Contributing

This is a hackathon project. For improvements:
1. Follow existing code structure
2. Update models when changing API contracts
3. Test board generation with various parameters
4. Ensure validation logic remains consistent

---

**API Documentation**: Visit `http://localhost:8000/docs` for interactive Swagger UI

