function gameBoard() {
    let board = [];
    const rows = 3;
    const columns = 3;

    const resetBoard = () => {
        for (let i = 0; i < rows; i++) {
            board[i] = [];
            for (let j = 0; j < columns; j++) {
                board[i][j] = Cell();
            }   
        }
    };
    resetBoard(); //initial board creation

    const getBoard = () => board;

    const boardStates = {
        getRightToLeftDiagonal() {
            return board.reduce((accumulator, currentRow, index) => {
                accumulator.push(currentRow[(columns - 1) - index]);
                return accumulator;
                }, []);
        },
        getLeftToRightDiagonal() {
            return board.reduce((accumulator, currentRow, index) => {
                accumulator.push(currentRow[index]);
                return accumulator;
            }, []);
        },
        getFlippedBoard() { // for vertical win checking
            let verticalBoard = [];
            for (let i = 0; i < columns; i++) {
                verticalBoard[i] = []; 
            }
            for (let i = 0; i < columns; i++) {
                for (let j = 0; j < rows; j++) {
                    verticalBoard[j][i] = board[i][j];
                }
            }
            return verticalBoard;   
        }
    }; 

    const printBoard = () => console.log(board.map(row => row.map(elem => elem.getValue())));

    const dropToken = (playerToken, selectedRow, selectedColumn) => {
        if( !(selectedRow >= 0 && selectedRow <= 2) || !(selectedColumn >= 0 && selectedColumn <= 2) ) {
            throw new Error('Invalid input! Row and column positions must be between 0 and 2');
        }

        const dropTarget = board[selectedRow][selectedColumn];

        if (dropTarget.getValue() !== 0) return 'taken';
            
        dropTarget.setValue(playerToken);
    };

    return { resetBoard, printBoard, dropToken, getBoard, boardStates };
};

function Cell() {
    let value = 0;
    let winningCell = 0;

    const setValue = (data) => value = data;
    const getValue = () => value;

    const setWinningCell = () => winningCell = 1;
    const isWinningCell = () => winningCell;

    return { setValue, getValue, setWinningCell, isWinningCell};
}

const game = (function (playerOneName = 'P1', playerTwoName = 'P2') {
    const board = gameBoard();
    boardStates = board.boardStates;
    currentBoard = board.getBoard;

    const players = [
        {
            name: playerOneName,
            token: 'X',
            roundWins: 0,
        },
        {
            name: playerTwoName,
            token: 'O',
            roundWins: 0,
        }
    ];

    const gameState = {
            winner: 0,
            tie: 0,
            text: "",
    };

    const getGameState = () => gameState;


    let activePlayer = players[0];

    const switchPlayer = () => {
        activePlayer === players[0] ?
        activePlayer = players[1] :
        activePlayer = players[0];
    };

    const getActivePlayer = () => activePlayer;

    // const getPlayerName = (player) => players[player].name;

    const getPlayerData = (player, property) => players[player][property];
    const setPlayerName = (player, name) => players[player].name = name;

    const resetGame = () => {
        board.resetBoard();
        gameState.winner = 0;
        gameState.tie = 0;
        gameState.text = "";
        activePlayer = players[0];
    };

    const quitGame = () => {
        resetGame();
        players.forEach(player => player.roundWins = 0);
        setPlayerName(0, 'P1'); // reset player names when quitting the game
        setPlayerName(1, 'P2');
    }

    const playRound = (row, column) => {
        if (gameState.winner === 1) {
            // console.log(`Game is over. ${activePlayer.name} won. Use 'game.resetGame()' to start a new game`); //console version
            gameState.text = `Game is over. ${activePlayer.name} won. In order to play again, press the "Next round" button`;

            board.printBoard(); // for testing
            return;
        } else if (gameState.tie === 1) {
            // console.log(`Game ended in a tie! Use 'game.resetGame()' to start a new game`); //console version
            gameState.text = `Game ended in a tie. In order to play again, press the "Next round" button`;
            board.printBoard(); // for testing
            return;
        }

        // console.log(`${activePlayer.name}'s turn.`) // console version

        if (board.dropToken(activePlayer.token, row, column) === 'taken') {
            // console.log('Cell is taken. Please select a different cell'); // console version
            gameState.text = 'Cell is taken. Please select a different cell.';
            return;
        }

        gameState.text = "";
        board.printBoard(); // for testing
        
        if (checkForWinner()) {
            gameState.winner = 1; 

            winner = checkForWinner();
            winner.cellCombination.forEach(cell => cell.setWinningCell());
            const winnerName = (players.find(elem => elem.token === winner.winnerToken)).name; // or activePlayer.name 
            activePlayer.roundWins++;

            // console.log(`${winnerName} wins!!!`); // console version
            gameState.text = `${winnerName} wins!!!`;

            return;
        };

        console.log(players);

        if (checkForTie()) {
            gameState.tie = 1;

            // console.log(`It's a tie!. Use .resetGame() to start a new game.`); // console version
            gameState.text = `It's a tie!`;

            return;
        };

        switchPlayer();
    };

    const checkForTie = () => {
        const availableCells = currentBoard()
            .map((row) => row.filter(elem => elem.getValue() === 0)) // to be moved in a tie checker function
            .filter((row) => row.length > 0);

        if (availableCells.length < 1) {
            return true;
        }

        return false;
    };

    const checkForWinner = function () {
        for (let i = 0; i < currentBoard().length; i++) {
           if (runWinCondition(currentBoard()[i])) return runWinCondition(currentBoard()[i]); // horizontal win check
        }

        for (let i = 0; i < currentBoard()[0].length; i++) { // using currentBoard()[0].length to get the columns number, because the number of columns will be equal to the number of arrays (rows) of the board after 'flipping' in order to check vertical win conditions 
            // check vertical win conditions
            if (runWinCondition(boardStates.getFlippedBoard()[i])) return runWinCondition(boardStates.getFlippedBoard()[i]);
         } 

        // check diagonal win conditions
        if (runWinCondition(boardStates.getLeftToRightDiagonal())) return runWinCondition(boardStates.getLeftToRightDiagonal()); 

        if (runWinCondition(boardStates.getRightToLeftDiagonal())) return runWinCondition(boardStates.getRightToLeftDiagonal());

        return false;
    };

    const runWinCondition = (cellCombination) => {
        const cellCombinationString = cellCombination.map(value => value.getValue()).join('');
        const regex = /([^0])\1\1/; // RegEx that matches any char that repeats itself three times in a row except 0
        const match = regex.exec(cellCombinationString);
    
        // if (match) return match[1];
        if (!match) return false;
        
        return { winnerToken: match[1], cellCombination };
    };

    return { getPlayerData, setPlayerName, playRound, getActivePlayer, getBoard: board.getBoard, resetGame, quitGame, getGameState };
})(); 


//UI Version
const gameScreenController = (() => {
    // const game = gameController();
    const main = document.querySelector('main');
    const boardDiv = main.querySelector('div.board');
    const resetBtn = main.querySelector('.reset-btn');
    const quitBtn = main.querySelector('.quit-btn');
    const openModalBtn = main.querySelector('.open-modal')
    const modal = main.querySelector('.modal');
    const gameText = main.querySelector('h3.game-text')
    const p1turn = main.querySelector('p.p1turn');
    const p2turn = main.querySelector('p.p2turn');
    const p1score = main.querySelector('.p1score');
    const p2score = main.querySelector('.p2score');

    const displayPlayersNames = () => { 
        p1turn.textContent = game.getPlayerData(0, 'name');
        p2turn.textContent = game.getPlayerData(1, 'name');
    };

    const updateScore = () => {
        p1score.textContent = game.getPlayerData(0, 'roundWins');
        p2score.textContent = game.getPlayerData(1, 'roundWins');
    };

    const updateBoardScreen = () => {
        const board = game.getBoard();
        const gameState = game.getGameState();
        const activePlayer = game.getActivePlayer();

        boardDiv.replaceChildren();
        gameText.textContent = gameState.text;
        resetBtn.textContent = 'Reset board'; // default text content will change when a round ends (game has a winner or ended i a tie); this will reset back to default
        
        if (activePlayer.token === game.getPlayerData(0, 'token')) {
            p2turn.classList.remove('active-player-text');
            p1turn.classList.add('active-player-text');
        } else if (activePlayer.token === game.getPlayerData(1, 'token')) {
            p1turn.classList.remove('active-player-text');
            p2turn.classList.add('active-player-text');
        }

        if (gameState.winner || gameState.tie) {
            updateScore();
            resetBtn.textContent = 'Next round'; 
        }

        board.forEach((row, rowIndex) => {
            row.forEach((cell, columnIndex) => {
                const button = document.createElement('button');
                button.dataset.row = rowIndex;
                button.dataset.column = columnIndex;
                if (cell.getValue()) button.textContent = cell.getValue();
                boardDiv.appendChild(button);

                if (cell.isWinningCell()) button.classList.add('winning-cell'); 
            })
        });
    };

    const clickHandlerBoard = (e) => {
        if (!e.target.dataset.column || !e.target.dataset.row) return; // to avoid executing when clicking the gaps that separates the buttons;

        const selectedRow = e.target.dataset.row;
        const selectedColumn = e.target.dataset.column;
        game.playRound(selectedRow, selectedColumn);
    
        updateBoardScreen();
    };

    const clickHandlerResetBtn = () => {
        game.resetGame();
        updateBoardScreen();
    };

    const clickHandlerQuitBtn = () => {
        main.style.display = 'none';
        game.quitGame();
        startScreenController.renderStartScreen();
    };

    const clickHandlerModalBtn = () => {
        modal.showModal();
    };

    const renderGameScreen = () => {
        main.style.display = 'block';
        displayPlayersNames(); // this will be called after the startScreenController sets the players names on the game object in order to get the latest version of the names;
        updateScore();
        updateBoardScreen();
    };

    openModalBtn.addEventListener('click', clickHandlerModalBtn);
    resetBtn.addEventListener('click', clickHandlerResetBtn);
    quitBtn.addEventListener('click', clickHandlerQuitBtn);
    boardDiv.addEventListener('click', clickHandlerBoard);
    
    return { renderGameScreen };
})();

const startScreenController = (() => {
    const header = document.querySelector('header');
    const nameSelectForm = document.querySelector('.name-select-form');
    const p1nameInput = document.querySelector('input[name="p1name"]'); 
    const p2nameInput = document.querySelector('input[name="p2name"]');
    const startBtn = document.querySelector('.start-btn');
    p1nameInput.placeholder = game.getPlayerData(0, 'name');
    p2nameInput.placeholder = game.getPlayerData(1, 'name');

    const clickHandlerStartBtn = () => {
        if (p1nameInput.value) game.setPlayerName(0, p1nameInput.value);
        if (p2nameInput.value) game.setPlayerName(1, p2nameInput.value);
        nameSelectForm.reset();
        header.style.display = 'none';
        gameScreenController.renderGameScreen();
    };

    const renderStartScreen = () => {
        header.style.display = 'block';
    };

    startBtn.addEventListener('click', clickHandlerStartBtn);

    return { renderStartScreen }
})();

