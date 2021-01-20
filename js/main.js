'use strict';

const MINE = '@';
const EMPTY = '';
const LIVES = 3;

var gBoard;
var gGame;
var gLevel = { size: 4, mines: 2 };
var gTimerInterval;

//TODO- Further tasks:
//1. FIRST CLICK is never a Mine- place the mines and counts after first click VV :)

//2. LIVES- add support for 3 lives
//when a mine is clicked there's an indication to the user that a mine was clicked(need clarification)
//live counter decreases, user can keep on playing. until it's zero-
//**add lives property to the gGame element. VV :)

//3. SMILEY - add a smiley icon (can switch the image)
//types: Normal, Dead, Win
//Clicking the smiley is a reset button. VV :)

// V
function initGame() {
    //TODO: called when page loads, V
    //TODO: calls build board V
    //ToDO: calls render board V
    //TODO: reset timer in DOM. V
    //TODO: reset gGame: isOn=true, shownCount=0, markedCount=0,secsPassed=0; V
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: LIVES,
    };

    clearInterval(gTimerInterval);
    gTimerInterval = null;

    gBoard = buildBoard();
    renderBoard(gBoard);
    resetTimer();
    var elSmiley = document.querySelector('.smiley');
    elSmiley.innerText = '🙂';
}

function buildBoard() {
    //TODO: Sets mines at random locations V
    //(later use a placeMines function) V
    //TODO: calls setMinesNegsCount() V
    //TODO: returns the created board V
    var board = [];
    for (var i = 0; i < gLevel.size; i++) {
        board.push([]);

        for (var j = 0; j < gLevel.size; j++) {
            var cellObject = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            };
            board[i].push(cellObject);
        }
    }

    return board;
}

// Old version- without first cell always empty
// function buildBoard() {
//     //TODO: Sets mines at random locations V
//     //(later use a placeMines function) V
//     //TODO: calls setMinesNegsCount() V
//     //TODO: returns the created board V
//     var board = [];
//     for (var i = 0; i < gLevel.size; i++) {
//         board.push([]);

//         for (var j = 0; j < gLevel.size; j++) {
//             var cellObject = {
//                 minesAroundCount: 0,
//                 isShown: false,
//                 isMine: false,
//                 isMarked: false,
//             };
//             board[i].push(cellObject);
//         }
//     }

//     board = placeMinesRandomly(board);

//     // board[3][2] = {
//     //     minesAroundCount: 0,
//     //     isShown: false,
//     //     isMine: true,
//     //     isMarked: false,
//     // };
//     // board[1][1] = {
//     //     minesAroundCount: 0,
//     //     isShown: false,
//     //     isMine: true,
//     //     isMarked: false,
//     // };

//     var board = setMinesNegsCount(board);
//     return board;
// }

// V
function placeMinesRandomly(board, firstCellI, firstCellJ) {
    var firstCellClearanceIdxs = getFirstCellClearanceIdxs(firstCellI, firstCellJ);
    for (var i = 0; i < gLevel.mines; i++) {
        do {
            var randI = getRandomIntEx(0, gLevel.size);
            var randJ = getRandomIntEx(0, gLevel.size);
            var idxStr = `${randI}-${randJ}`;
            var isInsideClearance = firstCellClearanceIdxs.indexOf(idxStr) !== -1;
        } while (board[randI][randJ].isMine || isInsideClearance);
        // } while (board[randI][randJ].isMine);

        board[randI][randJ] = {
            minesAroundCount: 0,
            isShown: false,
            isMine: true,
            isMarked: false,
        };
        renderMineCell(randI, randJ);
    }
    return board;
}

function getFirstCellClearanceIdxs(cellI, cellJ) {
    var firstCellClearanceIdxs = [];
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gLevel.size) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gLevel.size) continue;

            firstCellClearanceIdxs.push(`${i}-${j}`);
        }
    }
    // console.log('first vlearances', firstCellClearanceIdxs);
    return firstCellClearanceIdxs;
}

//old version - not verifying an emty cell here

// function placeMinesRandomly(board) {
//     for (var i = 0; i < gLevel.mines; i++) {
//         var randI = getRandomIntEx(0, gLevel.size);
//         var randJ = getRandomIntEx(0, gLevel.size);

//         while (board[randI][randJ].isMine) {
//             randI = getRandomIntEx(0, gLevel.size);
//             randJ = getRandomIntEx(0, gLevel.size);
//         }

//         board[randI][randJ] = {
//             minesAroundCount: 0,
//             isShown: false,
//             isMine: true,
//             isMarked: false,
//         };
//     }
//     return board;
// }

// V
function setMinesNegsCount(board) {
    //TODO: count the mines around each cell and sets the minesAroundCount // V

    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            if (board[i][j].isMine) continue;
            board[i][j].minesAroundCount = countMines(board, i, j);
        }
    }
    return board;
}

// V
function countMines(board, cellI, cellJ) {
    var minesCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gLevel.size) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gLevel.size) continue;
            if (board[i][j].isMine) minesCount++;
        }
    }
    return minesCount;
}

//CSS !!!!!!!!!!!!!!
function renderBoard(board) {
    //TODO: render the board as a table to the page // V
    //TODO: check each cell for isMine and add a class accordingly // V
    var elBoard = document.querySelector('.board');
    var elBoardTable = elBoard.querySelector('tBody');

    // console.log('elBoard',elBoard);
    var strHtml = '';
    for (var i = 0; i < gLevel.size; i++) {
        strHtml += '<tr>\n';
        for (var j = 0; j < gLevel.size; j++) {
            var cellContent = 'H'; //later change to empty string and picture- ''    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            var cellClasses = 'hidden-cell ';
            strHtml += `\t<td class="${cellClasses}" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this, event, ${i}, ${j})" data-i="${i}" data-j="${j}">${cellContent}</td>\n`;
        }
        strHtml += '</tr>\n';
    }
    // console.log('strHtml',strHtml);
    elBoardTable.innerHTML = strHtml;
    // console.log('elBoard',elBoard);
}

// V
function cellClicked(elCell, i, j) {
    //TODO: called when a cell(td) is clicked. V
    //TODO: If first cell, start setInterval(runTimer,1000). V
    //TODO: cell.isShown = true;  V
    //TODO: check if the cell is showen or flagged -> return V
    //TODO: then check content:  reveal anyways and if mine - explodeAllMines()  V
    //TODO: update gGame properties  V
    var currCell = gBoard[i][j];
    if (!gGame.isOn) return;
    if (gGame.shownCount === 0 && !gTimerInterval) {
        firstCellClickedActions(i, j);
    }

    if (currCell.isMarked || currCell.isShown) return;

    
    currCell.isShown = true;
    // console.log('gBoard[i][j]',gBoard[i][j]);
    var cellContent = returnCellContent(i, j);
    elCell.innerText = cellContent;
    elCell.classList.remove('hidden-cell');

    if (currCell.isMine) {
        mineStepped(elCell, i, j);
    } else {
        gGame.shownCount++;
        if (currCell.minesAroundCount === 0) expandShown(i, j);
        checkGameOver();
    }
    // console.clear();
    // console.log(gBoard);
}

function firstCellClickedActions(i, j) {
    gTimerInterval = setInterval(runTimer, 1000);

    gBoard = placeMinesRandomly(gBoard, i, j);
    gBoard = setMinesNegsCount(gBoard);
}

function mineStepped(elCell, i, j) {
    gGame.lives--;

    elCell.classList.add('exploded');
    checkLives(elCell, i, j);
    showBoomModal();

    var elLives = document.querySelector('.lives span');
    elLives.innerText = gGame.lives;

    
}

function checkLives(elCell, i, j) {
    if(gLevel.mines === LIVES-gGame.lives) gameOver('🤕');

    if (gGame.lives === 0) explodeAllMines(elCell, i, j);
}

//CSS!!!!!
function showBoomModal() {
    gGame.isOn = false;
    var elBoom = document.querySelector('.boom');
    elBoom.classList.remove('hidden-modal');
    setTimeout(hideBoomModal, 1000, elBoom);
}

function hideBoomModal(elBoom) {
    if (gGame.lives) gGame.isOn = true;

    elBoom.classList.add('hidden-modal');
}
// some TODO LATER!!!!! & possible efficiency upgrade
function explodeAllMines(elCell, i, j) {
    // !!!!!!!Some updates later
    //TODO: set game.isOn = false V
    //TODO: reveal all mines on the board V
    //TODO: mark the one that was clicked. V
    //TODO: Stop timerInterval V
    //TODO Later: kill the smiley.---------TODO Later  !!!!!!!!!!!!!!!!!!!!!!

    var elMines = document.querySelectorAll('.mine');
    // console.log('elMines', elMines);
    for (var i = 0; i < elMines.length; i++) {
        var elMine = elMines[i];
        elMine.classList.remove('hidden-cell', 'marked');
        elMine.innerText = MINE;
        var mineI = elMine.dataset.i; // check if can make it in a different way !!!!!!!!!!!!!!
        var mineJ = elMine.dataset.j; // check if can make it in a different way !!!!!!!!!!!!!!
        gBoard[mineI][mineJ].isShown = true;
    }

    gameOver('🤕');
}

// CSS !!!!!!!!!
function cellMarked(elCell, event, i, j) {
    //TODO: Marks a cell with a flag
    //TODO: if not marked - cell.isMarked = true, if marked - cell.isMarked = false
    //Toggle a class '.marked'
    //TODO: check how to find out right click
    //TODO: check how to hide the default menu
    //TODO: start timer if not running already
    event.preventDefault();
    gBoard[i][j].isMarked = !gBoard[i][j].isMarked;
    elCell.classList.toggle('marked');
    gGame.markedCount = gBoard[i][j].isMarked ? ++gGame.markedCount : --gGame.markedCount;
    elCell.innerText = 'M';
    checkGameOver();
}

// some TODO LATER !!!!!!!!!!!!!!!!!
function checkGameOver() {
    // TODO: check if gGame.shownCount === gLevel.Size-gLevel.Mines  V
    //TODO: if yes- set game.isOn = false; V
    //TODO Later: set smiley to happy
    var isAllCellsShown = gGame.shownCount === gLevel.size ** 2 - gLevel.mines;
    var livesUsed = (LIVES-gGame.lives);
    var isAllMinesMarked = gGame.markedCount + livesUsed === gLevel.mines;

    // console.log('game shown Count',gGame.shownCount)
    // console.log('game mark Count',gGame.markedCount)
    if (isAllCellsShown && isAllMinesMarked) {
        var smiley = '🤩';
        gameOver(smiley);
    }
}

function gameOver(smiley) {
    gGame.isOn = false;
    clearInterval(gTimerInterval);
    gTimerInterval = null;

    var elSmiley = document.querySelector('.smiley');
    elSmiley.innerText = smiley;
}
// V
function resetTimer() {
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = '000';
}

// V
function runTimer() {
    //TODO: add 1 to game.secsPassed V
    //TODO: update the timer in the DOM V
    var currTime = ++gGame.secsPassed;
    if (gGame.secsPassed < 100) currTime = '0' + currTime;
    if (gGame.secsPassed < 10) currTime = '0' + currTime;

    var elTimer = document.querySelector('.timer');
    elTimer.innerText = currTime;
}

// V - Can expand it later as a bonus
function expandShown(cellI, cellJ) {
    // console.log('expand shown i,j', cellI,cellJ);

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gLevel.size) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gLevel.size) continue;
            // console.log('i,j', i, ',', j);
            var currCell = gBoard[i][j];
            if (currCell.isMine || currCell.isShown || currCell.isMarked) continue;
            gGame.shownCount++;
            gBoard[i][j].isShown = true;

            var cellContent = returnCellContent(i, j);
            var elCurrCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
            elCurrCell.innerText = cellContent;
            elCurrCell.classList.remove('hidden-cell');

            // console.log('cell',i,'-',j,'content:',cellContent);
            // console.log('elCurrCell',elCurrCell);
            // console.log('----------------------------------');
        }
    }
    //TODO: when a user clicks an empty cell, open all it's neighboars.
    //***TODO Bonus: expand all empty cells connected.
}

// V
function changeLevel(lvlIdx) {
    var levels = [
        { size: 4, mines: 2 },
        { size: 8, mines: 12 },
        { size: 12, mines: 30 },
    ];
    gLevel = levels[lvlIdx];
    console.log('chose level', gLevel);
    initGame();
}

// V
function returnCellContent(i, j) {
    var currCell = gBoard[i][j];
    if (currCell.isMine) return MINE;
    else if (currCell.minesAroundCount > 0) return currCell.minesAroundCount;
    else return '';
}

function renderMineCell(i, j) {
    var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
    elCell.classList.add('mine');
}
