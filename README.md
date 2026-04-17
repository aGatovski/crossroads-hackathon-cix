# 🎮 Word Chain Puzzle - Crossroads Hackathon CIX

An AI-powered word puzzle game where players solve interconnected word chains by guessing words that connect through various linguistic relationships. Features real-time validation, neural network-style feedback, and an engaging visual interface.

## 🌟 Project Overview

This full-stack application combines:
- **Backend**: FastAPI server with OpenAI integration for word generation and validation
- **Frontend**: Next.js interactive interface with zoom/pan canvas and real-time feedback
- **AI Integration**: GPT-4 for intelligent word connections and validation

## 🎯 Key Features

### 🧩 Puzzle Generation
- Dynamic board creation with configurable difficulty
- Pre-designed templates (T-Shape, Grid, Ladder, Star patterns)
- AI-generated word chains with meaningful connections
- Customizable grid sizes and chain counts

### 🎮 Interactive Gameplay
- Smooth zoom and pan controls for large boards
- Click-to-guess interface for active nodes
- Real-time validation with visual feedback
- Neural network-style validation spreading from given nodes

### 🔍 Validation System
- Connection-by-connection AI validation
- Popup notifications for success/failure
- Weak points panel showing invalid connections
- Color-coded visual feedback (green = valid, red = invalid)

### ⚙️ Configuration
- Multi-language support
- CEFR levels (A1, A2, B1, B2, C1)
- Difficulty settings (Easy, Medium, Hard)
- Persistent settings via localStorage

## 🏗️ Architecture

```
crossroads-hackathon-cix/
├── backend/                    # FastAPI Backend
│   ├── main.py                # API endpoints
│   ├── game_logic.py          # Board generation
│   ├── connection_validator.py # AI validation
│   ├── models.py              # Data models
│   ├── chain_templates.py     # Layout templates
│   └── requirements.txt
│
├── frontend/                   # Next.js Frontend
│   ├── app/
│   │   ├── cix/               # Game interface
│   │   ├── setup/             # Configuration
│   │   └── services/          # API integration
│   ├── public/images/
│   └── package.json
│
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- OpenAI API key

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "OPENAI_API_KEY=your_api_key_here" > .env

# Start backend server
python main.py
```

Backend will run at `http://localhost:8000`

### 2. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# (Optional) Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

Frontend will run at `http://localhost:3000`

### 3. Play!

1. Open `http://localhost:3000`
2. Navigate to `/setup` if not redirected
3. Configure your game (language, level, difficulty)
4. Click "Initialize Game"
5. Start guessing words and validating connections!

## 📖 Detailed Documentation

- **Backend**: See [backend/README.md](backend/README.md)
- **Frontend**: See [frontend/README.md](frontend/README.md)

## 🎮 How to Play

### Setup Phase
1. **Enter Language**: Type your target language (e.g., "Spanish", "French")
2. **Select Level**: Choose CEFR level (A1 = Beginner, C1 = Advanced)
3. **Choose Difficulty**: 
   - Easy: 3 word chains
   - Medium: 5 word chains  
   - Hard: 7 word chains

### Game Phase
1. **View the Board**: Green nodes are given words (starting points)
2. **Click Active Nodes**: White nodes adjacent to filled nodes
3. **Enter Your Guess**: Type a word you think fits
4. **Validate**: Click "Validate Board" to check all connections
5. **Review Results**: 
   - Green popups = Correct connections
   - Red popups = Invalid connections
   - Check bottom-left panel for weak points

## 🧠 Neural Network Validation

The validation system mimics neural network propagation:

1. **Activation**: Starts from given nodes (pre-filled words)
2. **Propagation**: Spreads to adjacent connections
3. **Queue Processing**: BFS-style traversal through the network
4. **Visual Feedback**: Popups appear as each connection validates
5. **Error Tracking**: Invalid connections collected as "weak points"

This creates an organic, visual experience where you can watch validation spread through the puzzle.

## 🔗 API Endpoints

### Generate Board
```bash
POST /api/board/generate
{
  "num_chains": 5,
  "grid_size": 15,
  "category": "animals",
  "use_templates": true
}
```

### Validate Connection
```bash
POST /api/connection/validate
{
  "word1": "hot",
  "word2": "cold",
  "connection": "antonym"
}
```

### Validate Board
```bash
POST /api/board/validate
{
  "board": { ... }
}
```

## 🎨 Visual Guide

### Node Colors
- 🟢 **Green Glow**: Given words (starting points)
- ⚪ **White**: Active, can be guessed
- ⚫ **Faded**: Inactive, not yet accessible
- 🟩 **Highlighted**: Currently selected

### Connection Colors
- ⚪ **White**: Active (at least one word filled)
- 🟢 **Green**: Validated and correct
- ⚫ **Faded**: Inactive
- 🟡 **Yellow Hover**: Can be clicked to validate

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **OpenAI GPT-4**: AI word generation and validation
- **Pydantic**: Data validation
- **Uvicorn**: ASGI server

### Frontend
- **Next.js 15**: React framework
- **React 19**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **react-zoom-pan-pinch**: Canvas navigation

## 📊 Configuration Mapping

| Difficulty | Chains | Level | Grid Size |
|-----------|--------|-------|-----------|
| Easy | 3 | A1 | 10×10 |
| Medium | 5 | A2 | 12×12 |
| Hard | 7 | B1 | 15×15 |
| - | - | B2 | 17×17 |
| - | - | C1 | 20×20 |

## 🐛 Troubleshooting

### Backend Issues
- **OpenAI Error**: Check API key in backend `.env`
- **CORS Error**: Backend allows all origins by default
- **Generation Fails**: Reduce `num_chains` or increase `grid_size`

### Frontend Issues
- **Board Not Loading**: Ensure backend is running at port 8000
- **Validation Fails**: Check backend logs for OpenAI errors
- **Visual Glitches**: Clear browser cache, reset zoom

### General Issues
- **Slow Generation**: AI word generation takes 5-15 seconds
- **Invalid Connections**: AI validation may have false negatives
- **Performance**: Large boards (C1, Hard) may be slower

## 🎯 Features Breakdown

### ✅ Implemented
- [x] Dynamic board generation
- [x] Template-based layouts
- [x] AI word generation
- [x] Connection validation
- [x] Neural network validation flow
- [x] Real-time feedback popups
- [x] Weak points tracking
- [x] Zoom/pan interface
- [x] Configuration persistence
- [x] Multi-level difficulty

### 🚧 Future Enhancements
- [ ] Hint system
- [ ] Score tracking
- [ ] Leaderboards
- [ ] Undo/Redo
- [ ] Save/Load games
- [ ] Multiplayer mode
- [ ] Sound effects
- [ ] Animation improvements
- [ ] Mobile optimization

## 🔐 Security Notes

- Store OpenAI API key in `.env` (never commit!)
- Backend CORS set to allow all origins (change for production)
- No authentication required (add for production)
- Client-side API URL is public (expected for dev)

## 📝 Development Notes

### State Management
- Frontend uses React hooks
- localStorage for configuration persistence
- No global state library needed

### API Integration
- Type-safe with TypeScript interfaces
- Error handling on both ends
- Async validation with loading states

### Styling
- Tailwind utility-first approach
- Glassmorphism effects (backdrop blur)
- Responsive design principles

## 🧪 Testing

### Backend Testing
```bash
# Interactive API docs
http://localhost:8000/docs

# Test with curl
curl -X POST http://localhost:8000/api/board/generate \
  -H "Content-Type: application/json" \
  -d '{"num_chains": 3, "grid_size": 15, "use_templates": true}'
```

### Frontend Testing
1. Navigate through setup flow
2. Verify board loads
3. Test guessing words
4. Validate connections
5. Check weak points display

## 📄 License

Part of the Crossroads Hackathon CIX project.

## 🤝 Contributing

This is a hackathon project. For improvements:
1. Follow existing code structure
2. Maintain type safety
3. Test with various configurations
4. Update documentation

## 👥 Team

Crossroads Hackathon CIX Team

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- FastAPI community
- Next.js team
- Tailwind CSS

---

**Ready to play?** Start both servers and visit `http://localhost:3000`

**Need help?** Check individual README files in backend/ and frontend/

**Found a bug?** Open an issue with steps to reproduce

Happy puzzling! 🧩✨
