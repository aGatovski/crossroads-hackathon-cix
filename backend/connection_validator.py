import os
import json
from openai import OpenAI
from models import GameBoard, ValidationResult, BoardValidationResult


class ConnectionValidator:
    """Validates word connections using OpenAI"""
    
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    def validate_connection(self, word1: str, word2: str, connection: str) -> ValidationResult:
        prompt = f"""
            Determine if there is a valid '{connection}' relationship between the words '{word1}' and '{word2}'.

            Return the result in the following JSON format:
            {{
                "is_valid": true or false,
                "reason": "brief explanation"
            }}
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a linguistic expert validating word relationships."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=100,
                response_format={"type": "json_object"}
            )

            result_data = json.loads(response.choices[0].message.content)
            
            return ValidationResult(
                is_valid=result_data.get("is_valid", False), 
                reason=result_data.get("reason", "No reason provided")
            )
            
        except Exception as e:
            return ValidationResult(
                is_valid=False, 
                reason=f"Validation error: {str(e)}"
            )
    
    def validate_board(self, board: GameBoard) -> BoardValidationResult:
        """Validate all connections in a board"""
        invalid_connections = []
        
        word_map = {(cell.row, cell.col): cell.word for cell in board.cells if cell.word}
        
        for conn in board.connections:
            word1 = word_map.get(conn.from_cell)
            word2 = word_map.get(conn.to_cell)
            
            if not word1 or not word2:
                invalid_connections.append({
                    'from_cell': conn.from_cell,
                    'to_cell': conn.to_cell,
                    'reason': 'Missing word(s)'
                })
                continue
            
            result = self.validate_connection(word1, word2, conn.connection)
            
            if not result.is_valid:
                invalid_connections.append({
                    'from_cell': conn.from_cell,
                    'to_cell': conn.to_cell,
                    'word1': word1,
                    'word2': word2,
                    'connection_type': conn.connection.type,
                    'reason': result.reason
                })
        
        return BoardValidationResult(
            is_valid=len(invalid_connections) == 0,
            invalid_connections=invalid_connections
        )

