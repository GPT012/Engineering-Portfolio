import chess
import chess.polyglot
import struct

# Create a small dummy polyglot book with just a few moves
entries = []

board = chess.Board()
# starting position -> e4
key = chess.polyglot.zobrist_hash(board)
move = chess.Move.from_uci("e2e4")
# Polyglot move encoding:
# to_square: bits 0-5
# from_square: bits 6-11
# promotion: bits 12-14
to_sq = move.to_square
from_sq = move.from_square
prom = 0 if move.promotion is None else move.promotion - 1
raw_move = to_sq | (from_sq << 6) | (prom << 12)
entries.append((key, raw_move, 100, 0))

# starting position -> d4
move = chess.Move.from_uci("d2d4")
raw_move = move.to_square | (move.from_square << 6) | (0 << 12)
entries.append((key, raw_move, 50, 0))

entries.sort(key=lambda e: e[0])

with open('human.bin', 'wb') as f:
    for key, raw_move, weight, learn in entries:
        f.write(struct.pack('>QHHI', key, raw_move, weight, learn))
print("human.bin generated")
