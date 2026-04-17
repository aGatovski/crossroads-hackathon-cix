from typing import List, Dict, Optional

LAYOUT_TEMPLATES: List[Dict] = [
    {
        'name': 'T-Shape (3 chains)',
        'description': 'Three chains in a T shape',
        'chains': [
            {
                'length': 6,
                'start_row': 10,
                'start_col': 6,
                'direction': 'horizontal',
                'overlap_chain_idx': None,
                'overlap_at_self': None,
                'overlap_at_parent': None
            },
            {
                'length': 6,
                'start_row': None,
                'start_col': None,
                'direction': 'vertical',
                'overlap_chain_idx': 0,
                'overlap_at_self': 0,
                'overlap_at_parent': 3
            },
            {
                'length': 5,
                'start_row': None,
                'start_col': None,
                'direction': 'horizontal',
                'overlap_chain_idx': 1,
                'overlap_at_self': 2,
                'overlap_at_parent': 4
            }
        ]
    },
    {
        'name': 'Grid Pattern (4 chains)',
        'description': 'Four chains forming a grid',
        'chains': [
            {
                'length': 7,
                'start_row': 8,
                'start_col': 5,
                'direction': 'horizontal',
                'overlap_chain_idx': None,
                'overlap_at_self': None,
                'overlap_at_parent': None
            },
            {
                'length': 7,
                'start_row': 12,
                'start_col': 5,
                'direction': 'horizontal',
                'overlap_chain_idx': None,
                'overlap_at_self': None,
                'overlap_at_parent': None
            },
            {
                'length': 6,
                'start_row': None,
                'start_col': None,
                'direction': 'vertical',
                'overlap_chain_idx': 0,
                'overlap_at_self': 0,
                'overlap_at_parent': 2
            },
            {
                'length': 6,
                'start_row': None,
                'start_col': None,
                'direction': 'vertical',
                'overlap_chain_idx': 0,
                'overlap_at_self': 0,
                'overlap_at_parent': 5
            }
        ]
    },
    {
        'name': 'Ladder (5 chains)',
        'description': 'Horizontal chains connected by vertical rungs',
        'chains': [
            {
                'length': 8,
                'start_row': 8,
                'start_col': 4,
                'direction': 'horizontal',
                'overlap_chain_idx': None,
                'overlap_at_self': None,
                'overlap_at_parent': None
            },
            {
                'length': 6,
                'start_row': None,
                'start_col': None,
                'direction': 'vertical',
                'overlap_chain_idx': 0,
                'overlap_at_self': 0,
                'overlap_at_parent': 2
            },
            {
                'length': 6,
                'start_row': None,
                'start_col': None,
                'direction': 'vertical',
                'overlap_chain_idx': 0,
                'overlap_at_self': 0,
                'overlap_at_parent': 6
            },
            {
                'length': 8,
                'start_row': None,
                'start_col': None,
                'direction': 'horizontal',
                'overlap_chain_idx': 1,
                'overlap_at_self': 2,
                'overlap_at_parent': 5
            },
            {
                'length': 8,
                'start_row': None,
                'start_col': None,
                'direction': 'horizontal',
                'overlap_chain_idx': 2,
                'overlap_at_self': 6,
                'overlap_at_parent': 5
            }
        ]
    },
    {
        'name': 'Star Pattern (6 chains)',
        'description': 'Chains radiating from center',
        'chains': [
            {
                'length': 6,
                'start_row': 10,
                'start_col': 7,
                'direction': 'horizontal',
                'overlap_chain_idx': None,
                'overlap_at_self': None,
                'overlap_at_parent': None
            },
            {
                'length': 6,
                'start_row': None,
                'start_col': None,
                'direction': 'vertical',
                'overlap_chain_idx': 0,
                'overlap_at_self': 3,
                'overlap_at_parent': 3
            },
            {
                'length': 5,
                'start_row': None,
                'start_col': None,
                'direction': 'horizontal',
                'overlap_chain_idx': 1,
                'overlap_at_self': 2,
                'overlap_at_parent': 1
            },
            {
                'length': 5,
                'start_row': None,
                'start_col': None,
                'direction': 'horizontal',
                'overlap_chain_idx': 1,
                'overlap_at_self': 2,
                'overlap_at_parent': 5
            },
            {
                'length': 5,
                'start_row': None,
                'start_col': None,
                'direction': 'vertical',
                'overlap_chain_idx': 0,
                'overlap_at_self': 2,
                'overlap_at_parent': 1
            },
            {
                'length': 5,
                'start_row': None,
                'start_col': None,
                'direction': 'vertical',
                'overlap_chain_idx': 0,
                'overlap_at_self': 2,
                'overlap_at_parent': 5
            }
        ]
    },
    {
        'name': 'Compact Grid (7 chains)',
        'chains': [
            {
                'length': 8,
                'start_row': 6,
                'start_col': 4,
                'direction': 'horizontal',
                'overlap_chain_idx': None,
                'overlap_at_self': None,
                'overlap_at_parent': None
            },
            {
                'length': 8,
                'start_row': 9,
                'start_col': 4,
                'direction': 'horizontal',
                'overlap_chain_idx': None,
                'overlap_at_self': None,
                'overlap_at_parent': None
            },
            {
                'length': 8,
                'start_row': 12,
                'start_col': 4,
                'direction': 'horizontal',
                'overlap_chain_idx': None,
                'overlap_at_self': None,
                'overlap_at_parent': None
            },
            {
                'length': 8,
                'start_row': None,
                'start_col': None,
                'direction': 'vertical',
                'overlap_chain_idx': 0,
                'overlap_at_self': 0,
                'overlap_at_parent': 2
            },
            {
                'length': 8,
                'start_row': None,
                'start_col': None,
                'direction': 'vertical',
                'overlap_chain_idx': 0,
                'overlap_at_self': 0,
                'overlap_at_parent': 5
            },
            {
                'length': 6,
                'start_row': None,
                'start_col': None,
                'direction': 'vertical',
                'overlap_chain_idx': 1,
                'overlap_at_self': 1,
                'overlap_at_parent': 3
            },
            {
                'length': 6,
                'start_row': None,
                'start_col': None,
                'direction': 'vertical',
                'overlap_chain_idx': 1,
                'overlap_at_self': 1,
                'overlap_at_parent': 6
            }
        ]
    }
]

def get_template_by_chain_count(num_chains: int) -> Optional[Dict]:
    """Returns a template that matches the requested number of chains"""
    import random
    matching = [t for t in LAYOUT_TEMPLATES if len(t['chains']) == num_chains]
    if matching:
        return random.choice(matching)
    return None
