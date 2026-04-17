'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { generateBoard, validateConnection, generateHint, type Cell, type Connection, type GameBoard } from '../services/api';

interface ValidationPopup {
  id: number;
  message: string;
  type: 'success' | 'error';
  connection: string;
}

interface HintPopup {
  id: number;
  word: string;
  hint: string;
}

interface WeakPoint {
  fromCell: [number, number];
  toCell: [number, number];
  reason: string;
}

export default function CixGame() {
  const router = useRouter();
  const [gameData, setGameData] = useState<GameBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [inputText, setInputText] = useState('');
  const [guessedWords, setGuessedWords] = useState<Map<string, string>>(new Map());
  const [hoverInfo, setHoverInfo] = useState<{ type: 'node' | 'connection'; value: string } | null>(null);
  const [validationPopups, setValidationPopups] = useState<ValidationPopup[]>([]);
  const [weakPoints, setWeakPoints] = useState<WeakPoint[]>([]);
  const [validatingConnection, setValidatingConnection] = useState(false);
  const [validatedConnections, setValidatedConnections] = useState<Set<string>>(new Set());
  const [hintPopups, setHintPopups] = useState<HintPopup[]>([]);
  const [generatingHint, setGeneratingHint] = useState(false);

  // Load game board on mount
  useEffect(() => {
    const loadGame = async () => {
      try {
        // const configStr = localStorage.getItem('gameConfig');
        // if (!configStr) {
        //   router.push('/setup');
        //   return;
        // }

        // const config = JSON.parse(configStr);
        // const board = await generateBoard(config);
 
        const board: GameBoard = {
          rows: 6,
          cols: 6,
          cells: [
            // Chain 1 - horizontal (row 0)
            { row: 0, col: 0, word: 'cat', is_given: true },
            { row: 0, col: 1, word: 'dog', is_given: false },
            { row: 0, col: 2, word: 'pet', is_given: false },
            { row: 0, col: 3, word: 'animal', is_given: false },
            { row: 0, col: 4, word: 'mammal', is_given: false },
            { row: 0, col: 5, word: 'creature', is_given: false },
            
            // Chain 2 - vertical (col 2), overlaps with Chain 1 at (0,2) "pet"
            { row: 1, col: 2, word: 'owner', is_given: false },
            { row: 2, col: 2, word: 'person', is_given: true },
            { row: 3, col: 2, word: 'human', is_given: false },
            { row: 4, col: 2, word: 'being', is_given: false },
            { row: 5, col: 2, word: 'life', is_given: false },
            
            // Chain 3 - horizontal (row 2), overlaps with Chain 2 at (2,2) "person"
            { row: 2, col: 0, word: 'child', is_given: false },
            { row: 2, col: 1, word: 'youth', is_given: false },
            { row: 2, col: 3, word: 'adult', is_given: false },
            { row: 2, col: 4, word: 'elder', is_given: true },
            { row: 2, col: 5, word: 'senior', is_given: false },
          ],
          connections: [
            // Chain 1 connections (5 connections for 6 words)
            { from_cell: [0, 0], to_cell: [0, 1], connection: 'both are fluffy' },
            { from_cell: [0, 1], to_cell: [0, 2], connection: 'type of' },
            { from_cell: [0, 2], to_cell: [0, 3], connection: 'category' },
            { from_cell: [0, 3], to_cell: [0, 4], connection: 'example' },
            { from_cell: [0, 4], to_cell: [0, 5], connection: 'synonym' },
            
            // Chain 2 connections (5 connections for 6 words)
            { from_cell: [0, 2], to_cell: [1, 2], connection: 'has' },
            { from_cell: [1, 2], to_cell: [2, 2], connection: 'is a' },
            { from_cell: [2, 2], to_cell: [3, 2], connection: 'synonym' },
            { from_cell: [3, 2], to_cell: [4, 2], connection: 'type of' },
            { from_cell: [4, 2], to_cell: [5, 2], connection: 'characteristic' },
            
            // Chain 3 connections (5 connections for 6 words)
            { from_cell: [2, 0], to_cell: [2, 1], connection: 'grows into' },
            { from_cell: [2, 1], to_cell: [2, 2], connection: 'becomes' },
            { from_cell: [2, 2], to_cell: [2, 3], connection: 'life stage' },
            { from_cell: [2, 3], to_cell: [2, 4], connection: 'ages into' },
            { from_cell: [2, 4], to_cell: [2, 5], connection: 'synonym' },
          ],
          category: 'General',
        };
        
        setGameData(board);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load game:', err);
        setError('Failed to load game. Please try again.');
        setLoading(false);
      }
    };

    loadGame();
  }, [router]);

  // Auto-remove validation popups after 1 second
  useEffect(() => {
    if (validationPopups.length > 0) {
      const timer = setTimeout(() => {
        setValidationPopups(prev => prev.slice(1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [validationPopups]);

  // Auto-remove hint popups after 8 seconds (longer since they have more content)
  useEffect(() => {
    if (hintPopups.length > 0) {
      const timer = setTimeout(() => {
        setHintPopups(prev => prev.slice(1));
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [hintPopups]);

  const addPopup = (message: string, type: 'success' | 'error', connection: string) => {
    const id = Date.now();
    setValidationPopups(prev => [...prev, { id, message, type, connection }]);
  };

  const addHintPopup = (word: string, hint: string) => {
    const id = Date.now();
    setHintPopups(prev => [...prev, { id, word, hint }]);
  };

  const getCellWord = (row: number, col: number): string => {
    if (!gameData) return '';
    const cell = gameData.cells.find(c => c.row === row && c.col === col);
    if (!cell) return '';
    
    const key = `${row}-${col}`;
    if (guessedWords.has(key)) {
      return guessedWords.get(key)!;
    }
    
    return cell.is_given && cell.word ? cell.word : '';
  };

  const hasValue = (row: number, col: number): boolean => {
    if (!gameData) return false;
    const cell = gameData.cells.find(c => c.row === row && c.col === col);
    if (!cell) return false;
    if (cell.is_given && cell.word) return true;
    return guessedWords.has(`${row}-${col}`);
  };

  const isGiven = (row: number, col: number): boolean => {
    if (!gameData) return false;
    const cell = gameData.cells.find(c => c.row === row && c.col === col);
    return cell?.is_given || false;
  };

  const isNodeActive = (row: number, col: number): boolean => {
    if (hasValue(row, col)) return true;
    
    if (!gameData) return false;
    
    // Check if there's an actual connection from this cell to a cell with a value
    const hasConnectionToPopulated = gameData.connections.some(conn => {
      const [fromRow, fromCol] = conn.from_cell;
      const [toRow, toCol] = conn.to_cell;
      
      // Check if this is one endpoint of the connection and the other endpoint has a value
      if (fromRow === row && fromCol === col && hasValue(toRow, toCol)) {
        return true;
      }
      if (toRow === row && toCol === col && hasValue(fromRow, fromCol)) {
        return true;
      }
      
      return false;
    });
    
    return hasConnectionToPopulated;
  };

  const isConnectionActive = (conn: Connection): boolean => {
    const [fromRow, fromCol] = conn.from_cell;
    const [toRow, toCol] = conn.to_cell;
    return hasValue(fromRow, fromCol) || hasValue(toRow, toCol);
  };

  const canValidateConnection = (conn: Connection): boolean => {
    const [fromRow, fromCol] = conn.from_cell;
    const [toRow, toCol] = conn.to_cell;
    return hasValue(fromRow, fromCol) && hasValue(toRow, toCol);
  };

  const getConnectionKey = (conn: Connection): string => {
    return `${conn.from_cell[0]}-${conn.from_cell[1]}-${conn.to_cell[0]}-${conn.to_cell[1]}`;
  };

  const handleCellClick = (row: number, col: number) => {
    if (isGiven(row, col)) return;
    if (!isNodeActive(row, col)) return;
    
    setSelectedCell({ row, col });
    setInputText(getCellWord(row, col));
  };

  const handleSend = () => {
    if (!selectedCell || !inputText.trim()) return;
    
    const key = `${selectedCell.row}-${selectedCell.col}`;
    const newGuesses = new Map(guessedWords);
    newGuesses.set(key, inputText.trim());
    setGuessedWords(newGuesses);
    
    setInputText('');
    setSelectedCell(null);
  };

  const handleClear = () => {
    setGuessedWords(new Map());
    setInputText('');
    setSelectedCell(null);
    setWeakPoints([]);
    setValidatedConnections(new Set());
  };

  const handleGetHint = async () => {
    if (!selectedCell || !gameData) return;
    
    // Get the actual target word from the game board (the correct answer)
    const cell = gameData.cells.find(c => c.row === selectedCell.row && c.col === selectedCell.col);
    if (!cell || !cell.word) {
      addHintPopup('Error', 'No target word found for this cell!');
      return;
    }

    const targetWord = cell.word; // This is the correct answer, not the user's guess

    setGeneratingHint(true);
    
    try {
      const configStr = localStorage.getItem('gameConfig');
      const config = configStr ? JSON.parse(configStr) : { language: 'English', level: 'B1' };
      
      const result = await generateHint(targetWord, config.language || 'English', config.level || 'B1');
      addHintPopup(result.word, result.hint);
    } catch (err) {
      console.error('Failed to generate hint:', err);
      addHintPopup(targetWord, 'Failed to generate hint. Please try again.');
    } finally {
      setGeneratingHint(false);
    }
  };

  // Validate a single connection
  const validateSingleConnection = async (conn: Connection) => {
    if (!canValidateConnection(conn)) return;
    
    const connKey = getConnectionKey(conn);
    if (validatedConnections.has(connKey)) return; // Already validated
    
    const [fromRow, fromCol] = conn.from_cell;
    const [toRow, toCol] = conn.to_cell;
    const word1 = getCellWord(fromRow, fromCol);
    const word2 = getCellWord(toRow, toCol);
    
    setValidatingConnection(true);
    
    try {
      const result = await validateConnection(word1, word2, conn.connection);
      
      if (result.is_valid) {
        addPopup(`✓ Connection valid: ${word1} → ${word2}`, 'success', conn.connection);
        setValidatedConnections(prev => new Set([...prev, connKey]));
      } else {
        addPopup(`✗ Invalid: ${result.reason || 'Connection failed'}`, 'error', conn.connection);
        setWeakPoints(prev => [...prev, {
          fromCell: conn.from_cell,
          toCell: conn.to_cell,
          reason: result.reason || 'Connection validation failed'
        }]);
      }
    } catch (err) {
      console.error('Validation error:', err);
      addPopup('✗ Validation error occurred', 'error', conn.connection);
    } finally {
      setValidatingConnection(false);
    }
  };

  // Validate all connections starting from given nodes (neural network style)
  const handleValidateBoard = async () => {
    if (!gameData) return;
    
    setWeakPoints([]);
    setValidatedConnections(new Set());
    
    // Find all given cells (starting points)
    const givenCells = gameData.cells.filter(c => c.is_given);
    const visited = new Set<string>();
    const toVisit: Connection[] = [];
    
    // Find connections from given cells
    for (const cell of givenCells) {
      const cellKey = `${cell.row}-${cell.col}`;
      visited.add(cellKey);
      
      // Find outgoing connections
      const outgoingConns = gameData.connections.filter(
        c => c.from_cell[0] === cell.row && c.from_cell[1] === cell.col
      );
      
      // Find incoming connections
      const incomingConns = gameData.connections.filter(
        c => c.to_cell[0] === cell.row && c.to_cell[1] === cell.col
      );
      
      toVisit.push(...outgoingConns, ...incomingConns);
    }
    
    // Traverse and validate like a neural network
    while (toVisit.length > 0) {
      const conn = toVisit.shift()!;
      const [fromRow, fromCol] = conn.from_cell;
      const [toRow, toCol] = conn.to_cell;
      const fromKey = `${fromRow}-${fromCol}`;
      const toKey = `${toRow}-${toCol}`;
      const connKey = getConnectionKey(conn);
      
      // Skip if both nodes already visited
      if (visited.has(fromKey) && visited.has(toKey)) continue;
      
      // Skip if we can't validate yet
      if (!canValidateConnection(conn)) continue;
      
      // Validate this connection
      await validateSingleConnection(conn);
      await new Promise(resolve => setTimeout(resolve, 300)); // Small delay for visual effect
      
      // Mark nodes as visited
      visited.add(fromKey);
      visited.add(toKey);
      
      // Add adjacent connections to queue
      const adjacentConns = gameData.connections.filter(c => {
        const cFromKey = `${c.from_cell[0]}-${c.from_cell[1]}`;
        const cToKey = `${c.to_cell[0]}-${c.to_cell[1]}`;
        const cConnKey = getConnectionKey(c);
        
        return cConnKey !== connKey && 
               (cFromKey === toKey || cToKey === toKey || cFromKey === fromKey || cToKey === fromKey) &&
               !validatedConnections.has(cConnKey);
      });
      
      toVisit.push(...adjacentConns);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-2xl font-mono">Loading game...</div>
      </div>
    );
  }

  if (error || !gameData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl font-mono flex flex-col items-center gap-4">
          <div className="text-red-500">{error || 'Failed to load game'}</div>
          <button
            onClick={() => router.push('/setup')}
            className="px-6 py-3 bg-white/10 border-2 border-white/50 rounded-lg hover:bg-white/20 cursor-pointer"
          >
            Back to Setup
          </button>
        </div>
      </div>
    );
  }

  const cellSize = 300;
  const nodeRadius = cellSize * 0.3;
  const gridWidth = gameData.cols * cellSize;
  const gridHeight = gameData.rows * cellSize;

  return (
    <div 
      className="min-h-screen relative overflow-hidden" 
      style={{ 
        backgroundImage: 'url(/images/clean_bg.jpg)', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <TransformWrapper
        initialScale={1}
        minScale={0.3}
        maxScale={5}
        centerOnInit={true}
        limitToBounds={false}
        wheel={{ 
          step: 0.15,
          smoothStep: 0.01,
        }}
        doubleClick={{ mode: "zoomIn", step: 0.5 }}
        panning={{ 
          disabled: false,
          velocityDisabled: true,
        }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Zoom Controls - Top Left */}
            <div className="fixed top-6 left-6 flex flex-col gap-2 z-20 pointer-events-none">
              <button
                onClick={() => zoomIn()}
                className="w-10 h-10 bg-black/80 backdrop-blur-sm border-2 border-gray-700 rounded-lg transition-colors shadow-lg flex items-center justify-center text-xl font-bold pointer-events-auto cursor-pointer"
                title="Zoom In"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
              <button
                onClick={() => zoomOut()}
                className="w-10 h-10 bg-black/80 backdrop-blur-sm border-2 border-gray-700 rounded-lg transition-colors shadow-lg flex items-center justify-center text-xl font-bold pointer-events-auto cursor-pointer"
                title="Zoom Out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                </svg>
              </button>
              <button
                onClick={() => resetTransform()}
                className="w-10 h-10 bg-black/80 backdrop-blur-sm border-2 border-gray-700 rounded-lg transition-colors shadow-lg flex items-center justify-center text-sm pointer-events-auto cursor-pointer"
                title="Reset"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
            </div>
            
            {/* Instructions */}
            <div className="fixed top-6 left-20 bg-black/80 backdrop-blur-sm border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 shadow-lg pointer-events-none z-20">
              <div>🖱️ Click & drag to move</div>
              <div>🔍 Scroll to zoom</div>
            </div>

            {/* Weak Points Panel - Bottom Left */}
            {weakPoints.length > 0 && (
              <div className="fixed bottom-6 left-6 max-w-md z-20 pointer-events-auto">
                <div className="bg-black/90 backdrop-blur-sm border-2 border-red-500/50 rounded-lg p-4 shadow-lg">
                  <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-red-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                    Weak Points ({weakPoints.length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {weakPoints.map((wp, idx) => (
                      <div key={idx} className="text-sm text-white/90 bg-red-500/10 border border-red-500/30 rounded p-2">
                        <div className="font-semibold">
                          [{wp.fromCell[0]},{wp.fromCell[1]}] → [{wp.toCell[0]},{wp.toCell[1]}]
                        </div>
                        <div className="text-white/70 text-xs mt-1">{wp.reason}</div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setWeakPoints([])}
                    className="mt-3 w-full px-3 py-1 bg-red-500/20 border border-red-500/50 text-white text-sm rounded hover:bg-red-500/30 transition-colors cursor-pointer"
                  >
                    Clear Weak Points
                  </button>
                </div>
              </div>
            )}

            {/* Validation Popups */}
            <div className="fixed top-20 right-6 z-30 pointer-events-none space-y-1">
              {validationPopups.map((popup) => (
                <div
                  key={popup.id}
                  className={`px-2 py-1.5 rounded-md shadow-lg border backdrop-blur-sm animate-slide-in ${
                    popup.type === 'success' 
                      ? 'bg-green-500/20 border-green-500/50 text-green-100' 
                      : 'bg-red-500/20 border-red-500/50 text-red-100'
                  }`}
                >
                  <div className="font-semibold text-sm">{popup.message}</div>
                  <div className="text-xs opacity-75">{popup.connection}</div>
                </div>
              ))}
            </div>

            {/* Hint Popups */}
            <div className="fixed top-20 left-6 z-30 pointer-events-none space-y-2 max-w-md">
              {hintPopups.map((popup) => (
                <div
                  key={popup.id}
                  className="px-4 py-3 rounded-lg shadow-lg border-2 backdrop-blur-sm animate-slide-in bg-blue-500/20 border-blue-500/50 text-blue-100"
                >
                  <div className="font-semibold flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                    </svg>
                    Hint: {popup.word}
                  </div>
                  <div className="text-sm mt-2 text-blue-50">{popup.hint}</div>
                </div>
              ))}
            </div>

            {/* Hover Info */}
            {hoverInfo && (
              <div className="fixed bottom-52 right-6 bg-black/90 border-2 border-gray-700 rounded-lg px-4 py-2 text-sm text-white shadow-lg pointer-events-none z-20 backdrop-blur-sm">
                <span className="font-semibold text-yellow-400">{hoverInfo.type === 'node' ? 'Node' : 'Connection'}:</span> {hoverInfo.value}
              </div>
            )}

            {/* Canvas Area */}
            <TransformComponent
              wrapperStyle={{ width: '100vw', height: '100vh' }}
              contentStyle={{ width: '100%', height: '100%' }}
            >
              <div className="w-full h-full flex items-center justify-center p-8">
                <div 
                  className="relative bg-transparent"
                  style={{ width: `${gridWidth}px`, height: `${gridHeight}px` }}
                >
                  <svg width={gridWidth} height={gridHeight} className="absolute inset-0">
                    <defs>
                      <filter id="holographicGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    
                    {/* Draw connections */}
                    {gameData.connections.map((conn, idx) => {
                      const [fromRow, fromCol] = conn.from_cell;
                      const [toRow, toCol] = conn.to_cell;
                      
                      const centerFromX = (fromCol + 0.5) * cellSize;
                      const centerFromY = (fromRow + 0.5) * cellSize;
                      const centerToX = (toCol + 0.5) * cellSize;
                      const centerToY = (toRow + 0.5) * cellSize;
                      
                      const dx = centerToX - centerFromX;
                      const dy = centerToY - centerFromY;
                      const dist = Math.sqrt(dx * dx + dy * dy);
                      const unitX = dx / dist;
                      const unitY = dy / dist;
                      
                      const x1 = centerFromX + unitX * nodeRadius;
                      const y1 = centerFromY + unitY * nodeRadius;
                      const x2 = centerToX - unitX * nodeRadius;
                      const y2 = centerToY - unitY * nodeRadius;
                      
                      const midX = (centerFromX + centerToX) / 2;
                      const midY = (centerFromY + centerToY) / 2;
                      
                      const active = isConnectionActive(conn);
                      const validated = validatedConnections.has(getConnectionKey(conn));
                      const canValidate = canValidateConnection(conn);
                      const isVertical = fromCol === toCol;
                      
                      const textX = isVertical ? midX + 15 : midX;
                      const textY = isVertical ? midY + 5 : midY - 10;
                      
                      return (
                        <g key={idx}>
                          <line
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={validated ? '#eab308' : 'white'}
                            strokeWidth="6"
                            opacity={active ? 1 : 0.2}
                            className={canValidate ? "hover:stroke-yellow-400 transition-colors cursor-pointer" : ""}
                            onClick={() => canValidate && validateSingleConnection(conn)}
                            onMouseEnter={() => active && setHoverInfo({ type: 'connection', value: conn.connection })}
                            onMouseLeave={() => setHoverInfo(null)}
                          />
                          {active && (
                            <text
                              x={textX}
                              y={textY}
                              textAnchor={isVertical ? "start" : "middle"}
                              fontSize="16"
                              fill={validated ? '#eab308' : '#fff'}
                              className="pointer-events-none select-none font-medium"
                            >
                              {conn.connection.slice(0, 10)}
                              {conn.connection.length > 10 && '...'}
                            </text>
                          )}
                        </g>
                      );
                    })}

                    {/* Draw nodes */}
                    {gameData.cells.map((cell, idx) => {
                      const active = isNodeActive(cell.row, cell.col);
                      const given = isGiven(cell.row, cell.col);
                      const word = getCellWord(cell.row, cell.col);
                      const isSelected = selectedCell?.row === cell.row && selectedCell?.col === cell.col;
                      
                      return (
                        <g key={idx}>
                          <circle
                            cx={(cell.col + 0.5) * cellSize}
                            cy={(cell.row + 0.5) * cellSize}
                            r={nodeRadius}
                            fill={isSelected ? 'rgba(234, 179, 8, 0.2)' : (given ? 'rgba(234, 179, 8, 0.3)' : 'rgba(0, 0, 0, 0.75)')}
                            stroke={given ? '#eab308' : 'white'}
                            strokeWidth={5}
                            opacity={active ? 1 : 0.2}
                            filter={given ? 'url(#holographicGlow)' : undefined}
                            className={active && !given ? "cursor-pointer hover:fill-yellow-900 transition-colors" : ""}
                            onClick={() => handleCellClick(cell.row, cell.col)}
                            onMouseEnter={() => active && word && setHoverInfo({ type: 'node', value: word })}
                            onMouseLeave={() => setHoverInfo(null)}
                          />
                          {word && (
                            <text
                              x={(cell.col + 0.5) * cellSize}
                              y={(cell.row + 0.5) * cellSize + 6}
                              textAnchor="middle"
                              fontSize="20"
                              fill="white"
                              className="pointer-events-none select-none font-semibold"
                            >
                              {word.slice(0, 12)}
                              {word.length > 12 && '...'}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </TransformComponent>

            {/* Sticky Controls at Bottom Right */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-4 w-96 z-20 pointer-events-none">
              {/* Input Field */}
              <div className="bg-black/90 border-2 border-gray-700 shadow-lg p-4 rounded-lg pointer-events-auto backdrop-blur-sm">
                {selectedCell ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your guess..."
                        className="flex-1 px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/60"
                      />
                      <button
                        onClick={handleSend}
                        className="px-2 py-2 bg-yellow-500/40 border-2 border-yellow-400/80 text-white rounded hover:bg-yellow-700/80 transition-colors cursor-pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-white/70 py-2">
                    Click on an active node to guess
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pointer-events-auto">
                <button
                  onClick={handleClear}
                  className="flex-1 px-4 py-3 bg-black/80 text-white rounded-lg transition-all duration-150 shadow-lg border-2 border-gray-700 cursor-pointer transform hover:scale-105 backdrop-blur-sm"
                >
                  Clear
                </button>
                <button
                  onClick={handleGetHint}
                  disabled={!selectedCell || generatingHint}
                  className="flex-1 px-4 py-3 bg-blue-500/40 border-2 border-blue-400/80 text-white rounded-lg transition-all duration-150 shadow-lg cursor-pointer transform hover:scale-105 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                  {generatingHint ? 'Getting Hint...' : 'Hint'}
                </button>
                <button
                  onClick={handleValidateBoard}
                  disabled={validatingConnection}
                  className="flex-1 px-4 py-3 bg-yellow-500/40 border-2 border-yellow-400/80 text-white rounded-lg transition-all duration-150 shadow-lg cursor-pointer transform hover:scale-105 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {validatingConnection ? 'Validating...' : 'Validate Board'}
                </button>
              </div>
            </div>
          </>
        )}
      </TransformWrapper>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
