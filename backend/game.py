class TicTacToe:
    def __init__(self):
        self.board = [""] * 9
        self.current_player = "X"
        self.winner = None

    def make_move(self, position):
        if self.winner is not None:
            return False

        if position < 0 or position > 8:
            return False

        if self.board[position] != "":
            return False

        self.board[position] = self.current_player

        self.check_winner()

        if self.winner is None:
            self.switch_player()

        return True

    def switch_player(self):
        if self.current_player == "X":
            self.current_player = "O"
        else:
            self.current_player = "X"

    def check_winner(self):
        winning_combinations = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ]

        for combination in winning_combinations:
            a, b, c = combination

            if (
                self.board[a] != ""
                and self.board[a] == self.board[b]
                and self.board[b] == self.board[c]
            ):
                self.winner = self.board[a]
                return

        if "" not in self.board:
            self.winner = "DRAW"

    def reset(self):
        self.board = [""] * 9
        self.current_player = "X"
        self.winner = None
