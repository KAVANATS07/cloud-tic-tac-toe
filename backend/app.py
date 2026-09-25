from flask import Flask, jsonify, request
from flask_cors import CORS
from game import TicTacToe
import uuid

app = Flask(__name__)
CORS(app)

game = TicTacToe()

players = {}


@app.route("/")
def home():
    return "Cloud Tic-Tac-Toe Server is Running!"


@app.route("/join", methods=["POST"])
def join_game():

    data = request.get_json(silent=True) or {}

    existing_player_id = data.get("player_id")

    # Check if this browser is already a player
    if existing_player_id:

        if players.get("X") == existing_player_id:
            return jsonify({
                "success": True,
                "player": "X",
                "player_id": existing_player_id
            })

        if players.get("O") == existing_player_id:
            return jsonify({
                "success": True,
                "player": "O",
                "player_id": existing_player_id
            })

    # Create a new player
    player_id = str(uuid.uuid4())

    if "X" not in players:
        players["X"] = player_id
        player = "X"

    elif "O" not in players:
        players["O"] = player_id
        player = "O"

    else:
        return jsonify({
            "success": False,
            "message": "Game is full"
        }), 403

    return jsonify({
        "success": True,
        "player": player,
        "player_id": player_id
    })


@app.route("/game", methods=["GET"])
def get_game():

    return jsonify({
        "board": game.board,
        "current_player": game.current_player,
        "winner": game.winner,
        "players": {
            "X": "X" in players,
            "O": "O" in players
        }
    })


@app.route("/move", methods=["POST"])
def make_move():

    data = request.get_json(silent=True) or {}

    position = data.get("position")
    player_id = data.get("player_id")

    player = None

    if players.get("X") == player_id:
        player = "X"

    elif players.get("O") == player_id:
        player = "O"

    if player is None:
        return jsonify({
            "success": False,
            "message": "Invalid player"
        }), 403

    if player != game.current_player:
        return jsonify({
            "success": False,
            "message": "Not your turn"
        }), 403

    if not isinstance(position, int):
        return jsonify({
            "success": False,
            "message": "Invalid position"
        }), 400

    success = game.make_move(position)

    if not success:
        return jsonify({
            "success": False,
            "message": "Invalid move"
        }), 400

    return jsonify({
    "success": True,
    "board": game.board,
    "current_player": game.current_player,
    "winner": game.winner,
    "players": {
        "X": "X" in players,
        "O": "O" in players
    }
})


@app.route("/reset", methods=["POST"])
def reset_game():

    game.reset()

    return jsonify({
    "success": True,
    "board": game.board,
    "current_player": game.current_player,
    "winner": game.winner,
    "players": {
        "X": "X" in players,
        "O": "O" in players
    }
})


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
