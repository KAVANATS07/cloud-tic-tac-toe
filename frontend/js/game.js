const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const newGameButton = document.getElementById("new-game");

const xScoreText = document.getElementById("x-score");
const oScoreText = document.getElementById("o-score");

let player = null;
let playerId = null;

let xScore = 0;
let oScore = 0;
let lastWinner = null;

// Join the game
async function joinGame() {
    try {
        const response = await fetch("http://localhost:5000/join", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                player_id: playerId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            statusText.textContent = data.message;
            disableBoard();
            return;
        }

        player = data.player;
        playerId = data.player_id;

        console.log("Joined as Player " + player);

        await loadGame();

    } catch (error) {
        statusText.textContent =
            "Unable to connect to game server";

        console.error(error);
    }
}


// Get game state
async function loadGame() {
    try {
        const response = await fetch(
            "http://localhost:5000/game"
        );

        const game = await response.json();

        updateBoard(game);

    } catch (error) {
        statusText.textContent =
            "Unable to connect to game server";

        console.error(error);
    }
}


// Make a move
async function makeMove(position) {

   if (!player || !playerId) {
        return;
    }   
    try {
        const response = await fetch(
            "http://localhost:5000/move",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    position: position,
                    player_id: playerId
                })
            }
        );

        const game = await response.json();

        if (!response.ok) {
            statusText.textContent = game.message;
            return;
        }

        updateBoard(game);

    } catch (error) {
        statusText.textContent =
            "Unable to connect to game server";

        console.error(error);
    }
}


// Reset game
async function resetGame() {

    try {
        const response = await fetch(
            "http://localhost:5000/reset",
            {
                method: "POST"
            }
        );

        const game = await response.json();

        updateBoard(game);

    } catch (error) {
        statusText.textContent =
            "Unable to reset game";

        console.error(error);
    }
}


// Update board
function updateBoard(game) {

    cells.forEach((cell, index) => {

        cell.textContent = game.board[index];

        cell.classList.remove("x", "o");

        if (game.board[index] === "X") {
            cell.classList.add("x");
        }

        if (game.board[index] === "O") {
            cell.classList.add("o");
        }

    });


    if (game.winner === "X") {

    if (lastWinner !== "X") {
        xScore++;
        xScoreText.textContent = "Wins: " + xScore;
        lastWinner = "X";
    }

    statusText.textContent = "🏆 Player X wins!";
    disableBoard();
    return;
}

if (game.winner === "O") {

    if (lastWinner !== "O") {
        oScore++;
        oScoreText.textContent = "Wins: " + oScore;
        lastWinner = "O";
    }

    statusText.textContent = "🏆 Player O wins!";
    disableBoard();
    return;
}

if (game.winner === "DRAW") {
    statusText.textContent = "🤝 It's a draw!";
    disableBoard();
    return;
}


    if (game.winner === "DRAW") {

        statusText.textContent =
            "🤝 It's a draw!";

        disableBoard();
        return;
    }


    if (!game.players.X || !game.players.O) {

        statusText.textContent =
    "You are Player " + player + " — waiting for opponent...";

        disableBoard();
        return;
    }


    if (game.current_player === player) {

        statusText.textContent =
            "Your turn — Player"+ player;

        enableBoard();

    } else {

        statusText.textContent =
            "Player" + game.current_player + "'s turn";

        disableBoard();
    }
}


// Disable board
function disableBoard() {

    cells.forEach(cell => {
        cell.disabled = true;
    });
}


// Enable board
function enableBoard() {

    cells.forEach(cell => {

        cell.disabled =
            cell.textContent !== "";

    });
}


// Cell click
cells.forEach(cell => {

    cell.addEventListener("click", () => {

        const position =
            Number(cell.dataset.position);

        makeMove(position);

    });

});


// New game
newGameButton.addEventListener("click", () => {
    resetGame();
});


// Start game
joinGame();


// Check for opponent moves every second
setInterval(loadGame, 1000);
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js")
            .then(() => {
                console.log("PWA service worker registered");
            })
            .catch(error => {
                console.error(
                    "Service worker registration failed:",
                    error
                );
            });
    });
}
