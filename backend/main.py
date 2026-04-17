from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models import (
    GenerateBoardRequest, ValidateConnectionRequest, ValidateBoardRequest,
    GameBoard, ValidationResult, BoardValidationResult, HintRequest, HintResult
)
from game_logic import BoardGenerator
from connection_validator import ConnectionValidator

load_dotenv()

app = FastAPI(title="Word Chain Puzzle API")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

board_generator = BoardGenerator()
validator = ConnectionValidator()


@app.get("/")
def root():
    return {"message": "Word Chain Puzzle API"}


@app.post("/api/board/generate", response_model=GameBoard)
def generate_board(request: GenerateBoardRequest):
    """Generate a game board with word chains and connections"""
    try:
        board = board_generator.generate_board(
            num_chains=request.num_chains,
            grid_size=request.grid_size,
            connection_types=request.connection_types,
            category=request.category,
            use_templates=request.use_templates,
            language=request.language,
            language_level=request.language_level
        )
        return board
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/connection/validate", response_model=ValidationResult)
def validate_connection(request: ValidateConnectionRequest):
    """Check if two words are connected by given relationship"""
    try:
        result = validator.validate_connection(
            word1=request.word1,
            word2=request.word2,
            connection=request.connection
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/board/validate", response_model=BoardValidationResult)
def validate_board(request: ValidateBoardRequest):
    """Validate all connections in a board"""
    try:
        result = validator.validate_board(request.board)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/hint/generate", response_model=HintResult)
def generate_hint(request: HintRequest):
    """Generate a hint for a word"""
    try:
        hint = board_generator.generate_hint(
            word=request.word,
            language=request.language,
            language_level=request.language_level
        )
        return HintResult(word=request.word, hint=hint)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
