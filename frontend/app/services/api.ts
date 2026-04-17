const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Cell {
  row: number;
  col: number;
  word: string | null;
  is_given?: boolean;
}

export interface Connection {
  from_cell: [number, number];
  to_cell: [number, number];
  connection: string;
}

export interface GameBoard {
  rows: number;
  cols: number;
  cells: Cell[];
  connections: Connection[];
  category: string | null;
}

export interface GenerateBoardRequest {
  num_chains: number;
  grid_size: number;
  connection_types?: string[] | null;
  category?: string | null;
  use_templates?: boolean;
  language?: string;
  language_level?: string;
}

export interface ValidationResult {
  is_valid: boolean;
  reason?: string | null;
}

export interface BoardValidationResult {
  is_valid: boolean;
  invalid_connections: Array<{
    from_cell: [number, number];
    to_cell: [number, number];
    word1?: string;
    word2?: string;
    connection_type?: string;
    reason: string;
  }>;
}

// Map difficulty to num_chains
const difficultyToChains: Record<string, number> = {
  'Easy': 3,
  'Medium': 5,
  'Hard': 8,
};

const difficultyToSize: Record<string, number> = {
  'Easy': 10,
  'Medium': 15,
  'Hard': 20,
};


export async function generateBoard(config: {
  language: string;
  level: string;
  difficulty: string;
  category: string;
}): Promise<GameBoard> {
  const request: GenerateBoardRequest = {
    num_chains: difficultyToChains[config.difficulty] || 5,
    grid_size: difficultyToSize[config.difficulty] || 15,
    category: config.category,
    use_templates: false,
    language: config.language,
    language_level: config.level
  };

  const response = await fetch(`${API_BASE_URL}/api/board/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate board: ${response.statusText}`);
  }

  return await response.json();
}

export async function validateConnection(
  word1: string,
  word2: string,
  connection: string
): Promise<ValidationResult> {
  const response = await fetch(`${API_BASE_URL}/api/connection/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ word1, word2, connection }),
  });

  if (!response.ok) {
    throw new Error(`Failed to validate connection: ${response.statusText}`);
  }

  return await response.json();
}

export async function validateBoard(board: GameBoard): Promise<BoardValidationResult> {
  const response = await fetch(`${API_BASE_URL}/api/board/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ board }),
  });

  if (!response.ok) {
    throw new Error(`Failed to validate board: ${response.statusText}`);
  }

  return await response.json();
}

export interface HintResult {
  word: string;
  hint: string;
}

export async function generateHint(
  word: string,
  language: string = "English",
  languageLevel: string = "B1"
): Promise<HintResult> {
  const response = await fetch(`${API_BASE_URL}/api/hint/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      word, 
      language, 
      language_level: languageLevel 
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate hint: ${response.statusText}`);
  }

  return await response.json();
}

