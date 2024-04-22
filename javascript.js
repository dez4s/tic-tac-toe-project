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

    return { setValue, getValue };
}

function gameController(playerOneName = 'P1', playerTwoName = 'P2') {
    const board = gameBoard();
    currentBoard = board.getBoard();
    boardStates = board.boardStates;

    const players = [
        {
            name: playerOneName,
            token: 'X',
        },
        {
            name: playerTwoName,
            token: 'O',
        }
    ];

    const gameResult = {
            winner: 0,
            tie: 0,
            text: "",
        }

    const getGameResult = () => gameResult;

    let activePlayer = players[0];

    const switchPlayer = () => {
        activePlayer === players[0] ?
        activePlayer = players[1] :
        activePlayer = players[0];
    };

    const getActivePlayer = () => activePlayer;

    const setPlayerName = (player, name) => players[player].name = name;

    const restartGame = () => {
        board.resetBoard();
        gameResult.winner = 0;
        gameResult.tie = 0;
        activePlayer = players[0]
    };

    const playRound = (row, column) => {
        if (gameResult.winner === 1) {
            console.log(`Game is over. ${activePlayer.name} won. Use 'game.restartGame()' to start a new game`);

            board.printBoard(); // for testing
            return;
        } else if (gameResult.tie === 1) {
            console.log(`Game ended in a tie! Use 'game.restartGame()' to start a new game`);

            board.printBoard(); // for testing
            return;
        }

        console.log(`${activePlayer.name}'s turn.`)

        if (board.dropToken(activePlayer.token, row, column) === 'taken') {
            console.log('Cell is taken. No action needed');
            return;
        }

        board.printBoard(); // for testing
        
        if (checkForWinner()) {
            gameResult.winner = 1; 

            winner = checkForWinner();
            winner.cellCombination.forEach(cell => cell.setWinningCell = 1);
            const winnerName = (players.find(elem => elem.token === winner.winnerToken)).name; // or activePlayer.name 

            console.log(`${winnerName} wins!!!`);

            return;
        };

        if (checkForTie()) {
            gameResult.tie = 1;
            console.log(`It's a tie!. Use .restartGame() to start a new game.`);
            return;
        };

        switchPlayer();
    }

    const checkForTie = () => {
        const availableCells = currentBoard
            .map((row) => row.filter(elem => elem.getValue() === 0)) // to be moved in a tie checker function
            .filter((row) => row.length > 0);

        if (availableCells.length < 1) {
            return true;
        }

        return false;
    }

    const checkForWinner = function () {
        for (let i = 0; i < currentBoard.length; i++) {
           if (runWinCondition(currentBoard[i])) return runWinCondition(currentBoard[i]); // horizontal win check
        }

        for (let i = 0; i < currentBoard[0].length; i++) { // using currentBoard[0].length to get the columns number, because the columns will become rows and if columns number will be bigger the loop increases the number of iterations
            if (runWinCondition(boardStates.getFlippedBoard()[i])) return runWinCondition(boardStates.getFlippedBoard()[i]);
         } // check vertical win conditions

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
    }

    return { setPlayerName, playRound, getActivePlayer, getBoard: board.getBoard, restartGame };
} 



// UI Version
// const screenController = (() => {
//     const game = gameController();

//     game.playRound(1, 1);
//     game.playRound(1, 1);
// })();

////////////////////////////////////////////////////
// Console version
const game = gameController();

// const p1name = prompt('Player 1 name: ', 'P1');
// const p2name = prompt('Player 2 name: ', 'P2');

// console.log(p1name, p2name)

// if (p1name) game.setPlayerName(0, p1name);
// if (p2name) game.setPlayerName(1, p2name);

// horizontal win check
// game.playRound(2, 1);
// game.playRound(0, 0);
// game.playRound(2, 0);
// game.playRound(0, 1);
// game.playRound(2, 2);
// game.playRound(1, 0);

//diagonal win check
game.playRound(2, 1);
game.playRound(0, 0);
game.playRound(2, 0);
game.playRound(1, 1);
game.playRound(0, 2);
game.playRound(2, 2);

//vertical win check
// game.playRound(0, 0);
// game.playRound(0, 0);
// game.playRound(1, 1);
// game.playRound(0, 1);
// game.playRound(1, 2);
// game.playRound(2, 0);
// game.playRound(0, 2);
// game.playRound(2, 1);
// game.playRound(2, 2);
// game.playRound(2, 1);

// last move win test suite
// game.playRound(0, 0);
// game.playRound(0, 0);
// game.playRound(1, 1);
// game.playRound(0, 1);
// game.playRound(1, 2);
// game.playRound(2, 2);
// game.playRound(2, 1);
// game.playRound(1, 0);
// game.playRound(0, 2);
// game.playRound(2, 0);

// Game tie test suite
// game.playRound(0, 2);
// game.playRound(1, 2);
// game.playRound(0, 1);
// game.playRound(1, 1);
// game.playRound(2, 0);
// game.playRound(0, 0);
// game.playRound(2, 2);
// game.playRound(2, 1);
// game.playRound(1, 0);

//////////////////////////////////////////////
// algorithms used for checking win conditions
//
// const board = [
//     ['o', 'o', 'x'],
//     ['x', 'x', 0],
//     [0, 0, 'o'],
// ];

// let verticalWinCheckBoard = board.map((row) => []);

// for (let i = 0; i < board.length; i++) {
//         for (let j = 0; j < board.length; j++) {
//             verticalWinCheckBoard[j][i] = board[i][j];
//         }
// }   

// console.log(verticalWinCheckBoard);

// [0][0] => [0][0]
// [0][1] => [1][0]
// [0][2] => [2][0]

// [1][0] => [0][1]
// [1][1] => [1][1]
// [1][2] => [2][1]

// const checkForWinner = function () {
//     const diagBoardLeft = 
//     board
//      .reduce((accumulator, currentRow, index) => {
//         accumulator.push(currentRow[index]);
//         return accumulator;
//      }, []);

//     const diagBoardRight = 
//     board
//      .reduce((accumulator, currentRow, index) => {
//         accumulator.push(currentRow[(board[0].length - 1) - index]);
//         return accumulator;
//      }, []);

//      board.forEach(row => runWinCondition(row));

// };


// function runWinCondition(cellCombination) {
//     let winner = 0;

//     const cellCombinationString = cellCombination.map(value => value.getValue()).join('');

//     const regex = /([^0])\1\1/; // RegEx that matches any char that repeats itself three times in a row except 0

//     const match = regex.exec(cellCombinationString);

//     if (match) return match[1];

//     return false;
// }


// console.log(diagBoardLeft, diagBoardRight);
    
//backup
// const stringBoard = 
//     board
//     .map(row => row.join(''))
//     .reduce((accumulator, currentRow) => accumulator + "|" + currentRow);
// const diagonalStringLeft = 
//     board
//     .reduce((accumulator, currentRow, index) => accumulator + currentRow[index], []);
// const diagonalStringRight = 
//     board
//     .reduce((accumulator, currentRow, index) => accumulator + currentRow[(board[0].length - 1) - index], []);