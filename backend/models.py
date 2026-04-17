from pydantic import BaseModel, Field
from typing import List, Optional


class Cell(BaseModel):
    """Single cell in the grid"""
    row: int
    col: int
    word: Optional[str] = None
    is_given: bool = False


class ConnectionBetweenCells(BaseModel):
    """Connection between two adjacent cells"""
    from_cell: tuple[int, int] = Field(..., description="(row, col)")
    to_cell: tuple[int, int] = Field(..., description="(row, col)")
    connection: str


class GameBoard(BaseModel):
    """Complete game board structure"""
    rows: int
    cols: int
    cells: List[Cell]
    connections: List[ConnectionBetweenCells]
    category: Optional[str] = None


class GenerateBoardRequest(BaseModel):
    """Request to generate a board"""
    num_chains: int = Field(..., ge=2, le=10, description="Number of word chains (2-10)")
    grid_size: int = Field(15, ge=10, le=20, description="Grid size (10-20)")
    connection_types: Optional[List[str]] = None
    category: Optional[str] = None
    use_templates: Optional[bool] = Field(False, description="Use preloaded chain templates")
    language: Optional[str] = None
    language_level: Optional[str] = None


class ValidateConnectionRequest(BaseModel):
    """Request to validate a single connection"""
    word1: str
    word2: str
    connection: str


class ValidateBoardRequest(BaseModel):
    """Request to validate entire board"""
    board: GameBoard


class ValidationResult(BaseModel):
    """Result of validation"""
    is_valid: bool
    reason: Optional[str] = None


class BoardValidationResult(BaseModel):
    """Result of board validation"""
    is_valid: bool
    invalid_connections: List[dict] = []


class HintRequest(BaseModel):
    """Request to get a hint for a word"""
    word: str
    language: str = "English"
    language_level: str = "B1"


class HintResult(BaseModel):
    """Result containing a hint for a word"""
    word: str
    hint: str
