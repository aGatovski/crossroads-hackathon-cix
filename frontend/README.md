# CIX Frontend

A Next.js-based interactive frontend for CIX. Players solve puzzles by filling in words that connect through various linguistic relationships, with real-time AI validation.

## 🎯 Overview

This frontend provides an engaging puzzle-solving experience where:
- Players configure their game settings (language, level, difficulty)
- A dynamic board is generated from the backend
- Players guess words to complete chains
- Connections are validated in real-time using AI
- Visual feedback shows validation results and weak points

## 🚀 Features

- **Interactive Setup Flow**: Multi-step configuration for language, level (A1-C1), and difficulty
- **Dynamic Board Loading**: Fetches puzzle boards from backend API
- **Zoom & Pan Interface**: Navigate large puzzle boards with smooth controls
- **Neural Network Validation**: Validates connections starting from given nodes, spreading like a neural network
- **Real-time Feedback**: Popup notifications for validation results
- **Weak Points Display**: Bottom-left panel showing invalid connections
- **Visual Indicators**: Color-coded nodes and connections
- **Local Storage**: Persists game configuration

## 📋 Prerequisites

- Node.js 16+
- Backend API running (see backend/README.md)

## 🔧 Installation

1. **Navigate to frontend directory**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment** (optional):
Create a `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```

The application will start at `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

## 🎮 How to Play

### 1. Setup Phase (`/setup`)
1. Enter your target language
2. Select your CEFR level (A1, A2, B1, B2, C1)
3. Choose difficulty (Easy, Medium, Hard)
4. Click "Initialize Game"

### 2. Game Phase (`/cix`)
1. **View the Board**: A generated puzzle board appears with some given words (highlighted in green)
2. **Guess Words**: Click on active nodes (adjacent to filled nodes) to enter guesses
3. **Validate Connections**: Click "Validate Board" to check all connections
4. **Review Feedback**: 
   - Green popups = Valid connections
   - Red popups = Invalid connections
   - Check bottom-left for weak points

## 🎨 Visual Guide

### Node States
- **Given Nodes** (Green glow): Pre-filled words that serve as starting points
- **Active Nodes** (White): Available for guessing (adjacent to filled nodes)
- **Inactive Nodes** (Faded): Not yet accessible
- **Selected Node** (Green highlight): Currently being edited

### Connection States
- **White**: Active connection (at least one endpoint filled)
- **Green**: Validated connection (confirmed correct)
- **Faded**: Inactive connection
- **Yellow on hover**: Connection can be validated

### Controls
- **Mouse Drag**: Pan around the board
- **Scroll Wheel**: Zoom in/out
- **Reset Button**: Reset view to center
- **Click Node**: Select node to enter guess
- **Click Connection**: Validate that specific connection
- **Validate Board**: Run full neural network validation

## 📡 Backend Integration

The frontend communicates with the backend through the API service (`app/services/api.ts`):

### Endpoints Used
1. **Generate Board** (`POST /api/board/generate`)
   - Triggered on game load
   - Uses setup configuration to determine parameters

2. **Validate Connection** (`POST /api/connection/validate`)
   - Triggered when validating individual connections
   - Shows real-time feedback

3. **Validate Board** (`POST /api/board/validate`)
   - Available but currently not used (using connection-by-connection instead)

### Configuration Mapping
- **Difficulty → Chain Count**:
  - Easy: 3 chains
  - Medium: 5 chains
  - Hard: 7 chains

- **Level → Grid Size**:
  - A1: 10×10
  - A2: 12×12
  - B1: 15×15
  - B2: 17×17
  - C1: 20×20

## 🏗️ Project Structure

```
frontend/
├── app/
│   ├── cix/
│   │   └── page.tsx           # Main game interface
│   ├── setup/
│   │   └── page.tsx           # Setup/configuration page
│   ├── services/
│   │   └── api.ts             # Backend API integration
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Landing page
├── public/
│   └── images/
│       ├── default_bg.jpg     # Background image
│       └── ...
├── package.json
└── tsconfig.json
```

## 🔍 Key Components

### Setup Page (`/setup`)
- Multi-step configuration flow
- Stores settings in localStorage
- Validates inputs before proceeding

### Game Page (`/cix`)
- Loads configuration from localStorage
- Fetches board from backend API
- Manages game state (guesses, validations)
- Implements neural network validation logic
- Displays real-time feedback

### API Service
- Type-safe API calls
- Error handling
- Request/response mapping

## 🧪 Neural Network Validation

The validation system works like a neural network:

1. **Starting Points**: Begins from all given nodes (pre-filled words)
2. **Spreading**: Validates connections adjacent to validated nodes
3. **Queue-based**: Uses BFS-like traversal to validate connection-by-connection
4. **Visual Feedback**: Shows popups as each connection is validated
5. **Weak Point Tracking**: Collects invalid connections for review

This creates an organic, visual validation experience where you can see the validation "spread" through the network.

## 🎨 Styling

- **Tailwind CSS**: Utility-first styling
- **Custom Animations**: Slide-in for popups
- **Backdrop Blur**: Glassmorphism effects
- **Responsive Design**: Adapts to different screen sizes

## 📦 Dependencies

Key packages:
- **Next.js 15**: React framework
- **React 19**: UI library
- **react-zoom-pan-pinch**: Canvas navigation
- **Tailwind CSS**: Styling
- **TypeScript**: Type safety

## 🐛 Troubleshooting

### Board Not Loading
- Ensure backend is running at `http://localhost:8000`
- Check browser console for API errors
- Verify localStorage has `gameConfig`

### Validation Not Working
- Check backend logs for OpenAI API errors
- Ensure words are filled in both nodes of a connection
- Verify backend `.env` has valid `OPENAI_API_KEY`

### Visual Issues
- Clear browser cache
- Check if background image exists at `/public/images/default_bg.jpg`
- Try resetting zoom with the reset button

## 🚀 Performance Tips

1. **Large Boards**: Use zoom controls to focus on specific areas
2. **Validation**: Individual connection validation is faster than full board
3. **Memory**: Clear guesses periodically for long sessions

## 🔐 Security Notes

- API URL is exposed in client-side code (safe for development)
- No sensitive data stored in localStorage
- Backend handles all AI interactions

## 📝 Development Notes

### State Management
- Uses React hooks (useState, useEffect)
- No global state library (not needed for this scope)
- localStorage for persistence

### TypeScript
- Full type safety for API interactions
- Interfaces for all data structures
- Compile-time error checking

### Styling Conventions
- Tailwind utility classes
- Backdrop blur for modern look
- Consistent color scheme (green for valid, red for invalid)

## 🎯 Future Enhancements

Potential improvements:
- [ ] Hint system
- [ ] Score tracking
- [ ] Leaderboards
- [ ] Multiplayer mode
- [ ] Custom themes
- [ ] Sound effects
- [ ] Animation improvements
- [ ] Mobile optimization

## 📄 License

Part of the Crossroads Hackathon CIX project.

## 🤝 Contributing

This is a hackathon project. For improvements:
1. Follow existing component structure
2. Maintain type safety
3. Test with various board sizes
4. Ensure mobile responsiveness

---

**Live Demo**: Start the dev server and visit `http://localhost:3000`
**Interactive Docs**: Backend API docs at `http://localhost:8000/docs`
