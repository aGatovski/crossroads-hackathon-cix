import random
from typing import List, Optional, Tuple, Set
from openai import OpenAI
import os
from models import (Cell, ConnectionBetweenCells, GameBoard)
from chain_templates import get_template_by_chain_count


class BoardGenerator:
    """Generates word chain puzzle boards"""
    
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    def generate_hint(self, word: str, language: str = "English", language_level: str = "B1") -> str:
        """Generate a helpful hint for a word (translation or information)"""
        # If the word is in a foreign language, provide English translation and info
        # Otherwise, provide interesting information or context about the word
        
        if language.lower() != "english":
            prompt = f"""
                The word '{word}' is in {language} (level: {language_level}).
                Provide a helpful hint that includes:
                1. English translation
                2. A brief context or usage example
                
                Keep it concise (1-2 sentences) and helpful for learning.
            """
        else:
            prompt = f"""
                Provide a helpful hint for the word '{word}' suitable for {language_level} level learners.
                Give interesting information such as:
                - A simple definition
                - Common usage context
                - Related concepts
                
                Keep it concise (1-2 sentences) and educational.
            """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a helpful language learning assistant. Provide clear, concise hints."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=150
            )
            
            hint = response.choices[0].message.content.strip()
            return hint
        except Exception as e:
            print(f"Error generating hint: {e}")
            return f"Hint unavailable for '{word}'. Try checking a dictionary!"
        
    def generate_board(
        self, 
        num_chains: int = 5, 
        grid_size: int = 15,
        connection_types: Optional[List[str]] = None,
        category: Optional[str] = None,
        use_templates: Optional[bool] = False,
        language: str = "English",
        language_level: str = "B1"
    ) -> GameBoard:
        """Generate a game board with word chains"""
        if use_templates:
            return self._generate_board_from_template(num_chains, connection_types, category, grid_size, language, language_level)
        else:
            return self._generate_board_random(num_chains, connection_types, category, grid_size, language, language_level)
    
    def _generate_board_from_template(
        self,
        num_chains: int,
        connection_types: Optional[List[str]],
        category: Optional[str],
        grid_size: int,
        language: str,
        language_level: str
    ) -> GameBoard:
        """Generate a board using a layout template"""
        template = get_template_by_chain_count(num_chains)
        
        if not template:
            print(f"No template found for {num_chains} chains, using random generation")
            return self._generate_board_random(num_chains, connection_types, category, grid_size, language, language_level)
        
        print(f"Using template: {template['name']}")
        
        chains = []
        occupied_cells: Set[Tuple[int, int]] = set()
        all_connections = []
        used_words: Set[str] = set()  # Track used words across all chains
        
        # Process each chain in the template
        for chain_idx, chain_config in enumerate(template['chains']):
            chain_length = chain_config['length']
            direction = chain_config['direction']
            overlap_chain_idx = chain_config['overlap_chain_idx']
            
            if overlap_chain_idx is None:
                start_row = chain_config['start_row']
                start_col = chain_config['start_col']
                
                if direction == 'horizontal':
                    positions = [(start_row, start_col + i) for i in range(chain_length)]
                else:
                    positions = [(start_row + i, start_col) for i in range(chain_length)]
            else:
                parent_chain = chains[overlap_chain_idx]
                overlap_at_parent = chain_config['overlap_at_parent']
                overlap_at_self = chain_config['overlap_at_self']
                
                overlap_pos = parent_chain['positions'][overlap_at_parent]
                
                if direction == 'horizontal':
                    start_col = overlap_pos[1] - overlap_at_self
                    row = overlap_pos[0]
                    positions = [(row, start_col + i) for i in range(chain_length)]
                else:
                    start_row = overlap_pos[0] - overlap_at_self
                    col = overlap_pos[1]
                    positions = [(start_row + i, col) for i in range(chain_length)]
            
            if overlap_chain_idx is None:
                word_chain = self._generate_first_chain(chain_length, connection_types, category, language, language_level)
                # Add words from first chain to used_words
                for word in word_chain['words']:
                    used_words.add(word.lower())
            else:
                parent_chain = chains[overlap_chain_idx]
                overlap_at_parent = chain_config['overlap_at_parent']
                overlap_at_self = chain_config['overlap_at_self']
                seed_word = parent_chain['words'][overlap_at_parent]
                
                word_chain = self._generate_chain_with_seed(
                    chain_length, connection_types, category, seed_word, overlap_at_self, language, language_level, used_words
                )
            
            chains.append({
                'words': word_chain['words'],
                'connections': word_chain['connections'],
                'positions': positions,
                'direction': direction
            })
            
            for pos in positions:
                occupied_cells.add(pos)
        
        cells_dict = {}
        for chain in chains:
            for idx, pos in enumerate(chain['positions']):
                if pos not in cells_dict:
                    cells_dict[pos] = Cell(
                        row=pos[0],
                        col=pos[1],
                        word=chain['words'][idx],
                    )
        
        # Mark given cells: one per chain + two additional
        self._mark_given_cells(cells_dict, chains)
        
        for chain in chains:
            for i in range(len(chain['positions']) - 1):
                from_pos = chain['positions'][i]
                to_pos = chain['positions'][i + 1]
                
                all_connections.append(ConnectionBetweenCells(
                    from_cell=from_pos,
                    to_cell=to_pos,
                    connection=chain['connections'][i]
                ))
        
        # Calculate actual grid dimensions from cell positions
        all_rows = [cell.row for cell in cells_dict.values()]
        all_cols = [cell.col for cell in cells_dict.values()]
        actual_rows = max(all_rows) - min(all_rows) + 1 if all_rows else grid_size
        actual_cols = max(all_cols) - min(all_cols) + 1 if all_cols else grid_size
        
        # Normalize cell positions to start from (0, 0)
        min_row = min(all_rows) if all_rows else 0
        min_col = min(all_cols) if all_cols else 0
        
        # Update cell positions to be 0-indexed from top-left
        for cell in cells_dict.values():
            cell.row -= min_row
            cell.col -= min_col
        
        # Update connection positions
        for conn in all_connections:
            conn.from_cell = (conn.from_cell[0] - min_row, conn.from_cell[1] - min_col)
            conn.to_cell = (conn.to_cell[0] - min_row, conn.to_cell[1] - min_col)
        
        return GameBoard(
            rows=actual_rows,
            cols=actual_cols,
            cells=list(cells_dict.values()),
            connections=all_connections,
            category=category
        )
    
    def _generate_board_random(
        self,
        num_chains: int,
        connection_types: Optional[List[str]],
        category: Optional[str],
        grid_size: int,
        language: str,
        language_level: str
    ) -> GameBoard:
        """Generate a board with random positioning"""
        chain_length = 6
        
        chains = []
        occupied_cells: Set[Tuple[int, int]] = set()
        all_connections = []
        used_words: Set[str] = set()  # Track used words across all chains
        
        first_chain = self._generate_first_chain(chain_length, connection_types, category, language, language_level)
        
        # Add words from first chain to used_words
        for word in first_chain['words']:
            used_words.add(word.lower())

        print(first_chain)
        
        start_row = random.randint(0, grid_size - 1)
        start_col = random.randint(0, grid_size - chain_length)
        first_positions = [(start_row, start_col + i) for i in range(chain_length)]
        chains.append({
            'words': first_chain['words'],
            'connections': first_chain['connections'],
            'positions': first_positions,
            'direction': 'horizontal'
        })
        
        print(f"Chain 0 (first): positions: {first_positions[:2]}...{first_positions[-2:]}")
        
        for pos in chains[0]['positions']:
            occupied_cells.add(pos)

        chain_idx = 1  # Start at 1 since we already have the first chain
        max_attempts_per_chain = 50  # Limit attempts to find valid position
        
        while chain_idx < num_chains:
            attempts = 0
            positions = None
            selected_overlap_pos = None
            selected_overlap_idx = None
            selected_overlap_word = None
            
            # Try to find a valid position for the new chain
            while attempts < max_attempts_per_chain and positions is None:
                parent_chain = random.choice(chains)
                overlap_idx = random.randint(0, len(parent_chain['positions']) - 1)
                overlap_pos = parent_chain['positions'][overlap_idx]
                overlap_word = parent_chain['words'][overlap_idx]
                
                direction = 'vertical' if parent_chain['direction'] == 'horizontal' else 'horizontal'
                
                positions = self._calculate_positions(
                    overlap_pos, overlap_idx, chain_length, direction, occupied_cells, grid_size
                )
                
                if positions:
                    selected_overlap_pos = overlap_pos
                    selected_overlap_idx = overlap_idx
                    selected_overlap_word = overlap_word
                
                attempts += 1
            
            if positions:
                print(f"Chain {chain_idx}: Overlapping at {selected_overlap_pos} (index {selected_overlap_idx}), positions: {positions[:2]}...{positions[-2:]}")
                
                # Use the selected overlap_idx and overlap_word that correspond to the valid positions
                new_chain = self._generate_chain_with_seed(
                    chain_length, connection_types, category, selected_overlap_word, selected_overlap_idx, language, language_level, used_words
                )

                chains.append({
                    'words': new_chain['words'],
                    'connections': new_chain['connections'],
                    'positions': positions,
                    'direction': direction
                })
                
                for pos in positions:
                    occupied_cells.add(pos)

                chain_idx += 1
            else:
                # Couldn't find valid position after max attempts, stop adding chains
                print(f"Warning: Could only place {chain_idx} out of {num_chains} chains")
                break
        
        cells_dict = {}
        for chain in chains:
            for idx, pos in enumerate(chain['positions']):
                if pos not in cells_dict:
                    cells_dict[pos] = Cell(
                        row=pos[0],
                        col=pos[1],
                        word=chain['words'][idx],
                    )
        
        # Mark given cells: one per chain + two additional
        self._mark_given_cells(cells_dict, chains)
        
        for chain in chains:
            for i in range(len(chain['positions']) - 1):
                from_pos = chain['positions'][i]
                to_pos = chain['positions'][i + 1]
                
                all_connections.append(ConnectionBetweenCells(
                    from_cell=from_pos,
                    to_cell=to_pos,
                    connection=chain['connections'][i]
                ))
        
        # Calculate actual grid dimensions from cell positions
        all_rows = [cell.row for cell in cells_dict.values()]
        all_cols = [cell.col for cell in cells_dict.values()]
        actual_rows = max(all_rows) - min(all_rows) + 1 if all_rows else grid_size
        actual_cols = max(all_cols) - min(all_cols) + 1 if all_cols else grid_size
        
        # Normalize cell positions to start from (0, 0)
        min_row = min(all_rows) if all_rows else 0
        min_col = min(all_cols) if all_cols else 0
        
        print(f"Normalization: subtracting min_row={min_row}, min_col={min_col}")
        print(f"Original bounds: rows {min(all_rows)}-{max(all_rows)}, cols {min(all_cols)}-{max(all_cols)}")
        
        # Update cell positions to be 0-indexed from top-left
        for cell in cells_dict.values():
            cell.row -= min_row
            cell.col -= min_col
        
        # Update connection positions
        for conn in all_connections:
            conn.from_cell = (conn.from_cell[0] - min_row, conn.from_cell[1] - min_col)
            conn.to_cell = (conn.to_cell[0] - min_row, conn.to_cell[1] - min_col)
        
        print(f"After normalization: rows 0-{actual_rows-1}, cols 0-{actual_cols-1}")
        
        return GameBoard(
            rows=actual_rows,
            cols=actual_cols,
            cells=list(cells_dict.values()),
            connections=all_connections,
            category=category
        )
    
    def _mark_given_cells(
        self,
        cells_dict: dict,
        chains: List[dict]
    ) -> None:
        """Mark cells as given: one per chain + two additional"""
        given_positions = set()
        
        # Select one random cell from each chain
        for chain in chains:
            random_pos = random.choice(chain['positions'])
            given_positions.add(random_pos)
        
        # Select two additional random cells from all cells
        all_positions = list(cells_dict.keys())
        # Filter out already selected positions
        available_positions = [pos for pos in all_positions if pos not in given_positions]
        
        # Select up to 2 additional cells (if available)
        num_additional = min(2, len(available_positions))
        if num_additional > 0:
            additional_positions = random.sample(available_positions, num_additional)
            given_positions.update(additional_positions)
        
        # Mark all selected cells as given
        for pos in given_positions:
            if pos in cells_dict:
                cells_dict[pos].is_given = True
    
    def _generate_first_chain(
        self,
        length: int,
        connection_types: Optional[List[str]],
        category: Optional[str],
        language: str,
        language_level: str
    ) -> dict:
        """Generate a single word chain"""
        words = []
        connections = []
        used_words = set()
        
        current_word = self._generate_word_start(category, language, language_level)
        words.append(current_word)
        used_words.add(current_word.lower())
        
        for _ in range(length - 1):
            max_attempts = 10
            next_word = None
            connection_type = None
            
            for attempt in range(max_attempts):
                if connection_types:
                    connection_type = random.choice(connection_types)
                    next_word = self._generate_word_with_connection(current_word, connection_type, category, language, language_level, used_words)
                else:
                    next_word, connection_type = self._generate_word_and_connection(current_word, category, language, language_level, used_words)
                
                # Check if word is unique
                if next_word.lower() not in used_words:
                    break
                elif attempt == max_attempts - 1:
                    # Last attempt, just use it
                    print(f"Warning: Could not find unique word after {max_attempts} attempts")
            
            connections.append(connection_type)
            words.append(next_word)
            used_words.add(next_word.lower())
            current_word = next_word
        
        return {'words': words, 'connections': connections}
    
    def _generate_chain_with_seed(
        self,
        length: int,
        connection_types: Optional[List[str]],
        category: Optional[str],
        seed_word: str,
        seed_position: int,
        language: str,
        language_level: str,
        used_words: Optional[Set[str]] = None
    ) -> dict:
        """Generate chain with seed word at specific position"""
        if used_words is None:
            used_words = set()
        
        words = [None] * length
        connections = [None] * (length - 1)
        words[seed_position] = seed_word
        
        # Generate forward from seed
        for i in range(seed_position, length - 1):
            max_attempts = 10
            next_word = None
            connection_type = None
            
            for attempt in range(max_attempts):
                if connection_types:
                    connection_type = random.choice(connection_types)
                    next_word = self._generate_word_with_connection(words[i], connection_type, category, language, language_level, used_words)
                else:
                    next_word, connection_type = self._generate_word_and_connection(words[i], category, language, language_level, used_words)
                
                # Check if word is unique
                if next_word.lower() not in used_words:
                    break
                elif attempt == max_attempts - 1:
                    print(f"Warning: Could not find unique word after {max_attempts} attempts")
            
            connections[i] = connection_type
            words[i + 1] = next_word
            used_words.add(next_word.lower())
        
        # Generate backward from seed
        for i in range(seed_position - 1, -1, -1):
            max_attempts = 10
            prev_word = None
            connection_type = None
            
            for attempt in range(max_attempts):
                if connection_types:
                    connection_type = random.choice(connection_types)
                    prev_word = self._generate_word_with_connection(words[i + 1], connection_type, category, language, language_level, used_words)
                else:
                    prev_word, connection_type = self._generate_word_and_connection(words[i + 1], category, language, language_level, used_words)
                
                # Check if word is unique
                if prev_word.lower() not in used_words:
                    break
                elif attempt == max_attempts - 1:
                    print(f"Warning: Could not find unique word after {max_attempts} attempts")
            
            connections[i] = connection_type
            words[i] = prev_word
            used_words.add(prev_word.lower())
        
        return {'words': words, 'connections': connections}
    
    def _generate_word_start(self, category: Optional[str], language: str, language_level: str) -> str:
        """Generate a starting word"""
        category_text = f" in the category '{category}'" if category else ""
        prompt = f"Generate a single UNIQUE common {language} word{category_text}. Keep it fit for speakers in {language_level} level. Be creative and varied! Respond with only the word, nothing else."
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a word association expert. Always respond with exactly one UNIQUE word. Be creative and avoid common words."},
                    {"role": "user", "content": prompt}
                ],
                temperature=1.2,
                max_tokens=20
            )
            
            word = response.choices[0].message.content.strip().lower()
            word = word.split()[0] if word else "default"
            return word
        except Exception as e:
            return f"word{random.randint(1, 1000)}"
    
    def _generate_word_with_connection(
        self, 
        source_word: str, 
        connection_type: str, 
        category: Optional[str],
        language: str,
        language_level: str,
        used_words: Optional[Set[str]] = None
    ) -> str:
        """Generate a word connected to source_word via connection_type"""
        if used_words is None:
            used_words = set()
            
        category_text = f" (in category: {category})" if category else ""
        avoid_text = ""
        if used_words:
            avoid_list = list(used_words)[:20]  # Limit to avoid huge prompts
            avoid_text = f"\n\nIMPORTANT: Do NOT use any of these already used words: {', '.join(avoid_list)}"
        
        prompt = f"Given the word '{source_word}', generate a single UNIQUE {language} word connected to it through a {connection_type} relationship{category_text}. Keep it fit for speakers in {language_level} level.{avoid_text}\n\nRespond with only the word, nothing else."

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a word association expert. Always respond with exactly one UNIQUE word that hasn't been used before."},
                    {"role": "user", "content": prompt}
                ],
                temperature=1.0,
                max_tokens=20
            )
            
            word = response.choices[0].message.content.strip().lower()
            word = word.split()[0] if word else "default"
            return word
        except Exception as e:
            return f"word{random.randint(1, 1000)}"
    
    def _generate_word_and_connection(
        self, 
        source_word: str, 
        category: Optional[str],
        language: str,
        language_level: str,
        used_words: Optional[Set[str]] = None
    ) -> Tuple[str, str]:
        """Generate both a connected word and the connection type"""
        if used_words is None:
            used_words = set()
            
        category_text = f" (in category: {category})" if category else ""
        avoid_text = ""
        if used_words:
            avoid_list = list(used_words)[:20]
            avoid_text = f"\n\nIMPORTANT: The word must be UNIQUE. Do NOT use any of these already used words: {', '.join(avoid_list)}"
        
        prompt = f"""
            Given the word '{source_word}', generate a UNIQUE related {language} word and describe their connection IN {language}{category_text}.
            Keep them fit for speakers in {language_level} level.{avoid_text}

            Return ONLY in this JSON format:
            {{"word": "the_related_word", "connection": "type_of_connection_in_{language}"}}

            The connection should be in {language}. Examples of connections: synonym, antonym, category, part-of, used-for, etc.
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": f"You are a word association expert. Always respond with valid JSON. Generate UNIQUE words and connections in {language}."},
                    {"role": "user", "content": prompt}
                ],
                temperature=1.0,
                max_tokens=100,
                response_format={"type": "json_object"}
            )
            
            import json
            result = json.loads(response.choices[0].message.content)
            word = result.get("word", "default").strip().lower()
            connection = result.get("connection", "association").strip().lower()
            return word, connection
        except Exception as e:
            return f"word{random.randint(1, 1000)}", "association"
    
    def _calculate_positions(
        self,
        overlap_pos: Tuple[int, int],
        overlap_idx: int,
        chain_length: int,
        direction: str,
        occupied: Set[Tuple[int, int]],
        grid_size: int
    ) -> Optional[List[Tuple[int, int]]]:
        """Calculate positions for a chain that must overlap at overlap_pos"""
        
        positions = []
        
        if direction == 'horizontal':
            start_col = overlap_pos[1] - overlap_idx
            row = overlap_pos[0]
            
            for i in range(chain_length):
                pos = (row, start_col + i)
                positions.append(pos)
        else:  # vertical
            start_row = overlap_pos[0] - overlap_idx
            col = overlap_pos[1]
            
            for i in range(chain_length):
                pos = (start_row + i, col)
                positions.append(pos)
        
        # Verify the overlap position is correct
        if positions[overlap_idx] != overlap_pos:
            return None
        
        # Check for conflicts (excluding the overlap position itself)
        conflicts = [p for p in positions if p in occupied and p != overlap_pos]
        if conflicts:
            return None
        
        # Check if all positions are within grid bounds
        for row, col in positions:
            if row < 0 or row >= grid_size or col < 0 or col >= grid_size:
                return None
        
        return positions
