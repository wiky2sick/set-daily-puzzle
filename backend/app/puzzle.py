from __future__ import annotations

import itertools
import json
import random
from dataclasses import dataclass
from typing import List, Tuple, Set

Card = str  # 4 chars, each '0'..'2'


def all_cards() -> List[Card]:
    # 3^4 = 81 cards, encoded as "scsh" digits (shape,color,shading,count)
    cards: List[Card] = []
    for a in range(3):
        for b in range(3):
            for c in range(3):
                for d in range(3):
                    cards.append(f"{a}{b}{c}{d}")
    return cards


def is_set(c1: Card, c2: Card, c3: Card) -> bool:
    for i in range(4):
        vals = {c1[i], c2[i], c3[i]}
        if len(vals) == 2:  # two same, one different
            return False
    return True


def set_signature(cards: List[Card]) -> str:
    # order-independent canonical signature
    return "|".join(sorted(cards))


def count_sets_on_board(board: List[Card]) -> Tuple[int, Set[str]]:
    sigs: Set[str] = set()
    for a, b, c in itertools.combinations(board, 3):
        if is_set(a, b, c):
            sigs.add(set_signature([a, b, c]))
    return (len(sigs), sigs)


@dataclass(frozen=True)
class GeneratedPuzzle:
    date: str
    seed: str
    board: List[Card]
    total_sets: int


def generate_daily_puzzle(
    date_str: str,
    min_sets: int = 6,
    max_sets: int = 12,
    board_sizes: List[int] | None = None,
    max_attempts_per_size: int = 2000,
) -> GeneratedPuzzle:
    """
    Deterministic-ish by date seed. We still may loop attempts, but the RNG is seeded
    so the output remains stable for the same date_str and parameters.
    """
    if board_sizes is None:
        board_sizes = [12, 15, 18]

    seed = date_str
    rng = random.Random(seed)
    deck = all_cards()

    for size in board_sizes:
        # Try multiple draws from seeded RNG; deterministic due to seeded generator.
        for _ in range(max_attempts_per_size):
            rng.shuffle(deck)
            board = deck[:size]
            total, _ = count_sets_on_board(board)
            if min_sets <= total <= max_sets:
                return GeneratedPuzzle(date=date_str, seed=seed, board=board, total_sets=total)

    # Fallback: return best effort (closest to target range)
    best_board: List[Card] = deck[:12]
    best_total, _ = count_sets_on_board(best_board)
    best_score = min(abs(best_total - min_sets), abs(best_total - max_sets))

    for size in board_sizes:
        for _ in range(300):
            rng.shuffle(deck)
            board = deck[:size]
            total, _ = count_sets_on_board(board)
            score = min(abs(total - min_sets), abs(total - max_sets))
            if score < best_score:
                best_score = score
                best_total = total
                best_board = board

    return GeneratedPuzzle(date=date_str, seed=seed, board=best_board, total_sets=best_total)


def board_to_json(board: List[Card]) -> str:
    return json.dumps(board)


def board_from_json(board_json: str) -> List[Card]:
    return list(json.loads(board_json))
