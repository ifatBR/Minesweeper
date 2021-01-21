'use strict';

const MINE = '💣';
const EMPTY = '';
const MARKED = '❕';

var gBoard;
var gGame;
var gLevel = { size: 4, mines: 2, lives: 1 };
var gTimerInterval;
var gLvlBestScore = 0;
var gUndos;
var gManualMode;


function initGame() {

    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: gLevel.lives,
        isShowHint: false,
        safeClicks: 3,
    };

    gManualMode = resetManualMode(gManualMode);

    gUndos = [];
    clearInterval(gTimerInterval);
    gTimerInterval = null;

    gBoard = buildBoard();
    renderBoard(gBoard);

    resetTimer();
    updateLives();
    updateBestScore();
    updateSafeClick();
    resetHints();
    resetSmiley();
    

}

function buildBoard() {

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

function placeMinesRandomly(board, firstCellI, firstCellJ) {
    var firstCellClearanceIdxs = getFirstCellClearanceIdxs(firstCellI, firstCellJ);
    for (var i = 0; i < gLevel.mines; i++) {
        do {
            var randI = getRandomIntEx(0, gLevel.size);
            var randJ = getRandomIntEx(0, gLevel.size);
            var idxStr = `${randI}-${randJ}`;
            var isInsideClearance = firstCellClearanceIdxs.indexOf(idxStr) !== -1;
        } while (board[randI][randJ].isMine || isInsideClearance);

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

function placeMinesByList(board, positions) {
    for (var i = 0; i < positions.length; i++) {
        var cellI = positions[i].i;
        var cellJ = positions[i].j;
        board[cellI][cellJ] = {
            minesAroundCount: 0,
            isShown: false,
            isMine: true,
            isMarked: false,
        };
        renderMineCell(cellI, cellJ);
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
    return firstCellClearanceIdxs;
}

function setMinesNegsCount(board) {

    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            if (board[i][j].isMine) continue;
            board[i][j].minesAroundCount = countMines(board, i, j);
        }
    }
    return board;
}

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

function renderBoard() {
    var elBoard = document.querySelector('.board');
    var elBoardTable = elBoard.querySelector('tBody');

    var strHtml = '';
    for (var i = 0; i < gLevel.size; i++) {
        strHtml += '<tr>\n';
        for (var j = 0; j < gLevel.size; j++) {
            var cellClasses = 'closed-cell ';
            strHtml += `\t<td class="${cellClasses}" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this, event, ${i}, ${j})" data-i="${i}" data-j="${j}"></td>\n`;
        }
        strHtml += '</tr>\n';
    }

    elBoardTable.innerHTML = strHtml;
}

function cellClicked(elCell, i, j) {
    var currCell = gBoard[i][j];
    elCell.classList.add('clicked');

    if (!gGame.isOn) return;

    if (gManualMode.isOn) {
        collectMinesPositions(i, j);
        return;
    }

    if (!gTimerInterval) {
        firstCellClickedActions(i, j);
    }

    if (gGame.isShowHint) {
        revealHintCells(i, j);
        return;
    }

    if (currCell.isMarked || currCell.isShown) return;

    revealCell(elCell, i, j, true);
    var currUndos = [{ i, j }];

    if (currCell.isMine) {
        mineClicked(elCell, i, j);
    } else {
        gGame.shownCount++;

        if (currCell.minesAroundCount === 0) {
            currUndos = currUndos.concat(expandShown(i, j));
        }

        checkGameOver();
    }
    gUndos.push(currUndos);
}

function firstCellClickedActions(i, j) {
    if (!gManualMode.minesCount) gBoard = placeMinesByList(gBoard, gManualMode.positions);
    else gBoard = placeMinesRandomly(gBoard, i, j);

    gBoard = setMinesNegsCount(gBoard);
    gTimerInterval = setInterval(runTimer, 1000);
}

function revealCell(elCell, i, j, isChangeStat) {
    if (isChangeStat) gBoard[i][j].isShown = true;

    var cellContent = returnCellContent(i, j);
    elCell.innerText = cellContent;
    elCell.classList.remove('closed-cell');
}

function mineClicked(elCell, i, j) {
    looseLife();
    elCell.classList.add('exploded');
    var isMoreLives = checkLives(elCell, i, j);
    showBoomModal(isMoreLives);
}

function checkLives(elCell, i, j) {
    if (!gGame.lives) {
        explodeAllMines(elCell, i, j);
        return false;
    }

    return true;
}

function showBoomModal(isMoreLives) {
    gGame.isOn = false;
    var elBoom = document.querySelector('.boom');
    elBoom.classList.remove('hidden-modal');
    gGame.isOn = isMoreLives;

    setTimeout(hideBoomModal, 500, elBoom);
}

function hideBoomModal(elBoom, isMoreLives) {
    elBoom.classList.add('hidden-modal');
}

function explodeAllMines() {
    var elMines = document.querySelectorAll('.mine');

    for (var i = 0; i < elMines.length; i++) {
        var elMine = elMines[i];
        elMine.classList.remove('closed-cell', 'marked');
        elMine.innerText = MINE;
        var mineI = +elMine.dataset.i;
        var mineJ = +elMine.dataset.j;
        gBoard[mineI][mineJ].isShown = true;
    }

    gameOver(false);
}

function cellMarked(elCell, event, i, j) {
    event.preventDefault();
    var currCell = gBoard[i][j];
    if (gManualMode.isOn || currCell.isShown) return;

    gUndos.push([{ i, j }]);
    if (!gTimerInterval) firstCellClickedActions(i, j);
    currCell.isMarked = !currCell.isMarked;
    elCell.classList.toggle('marked');
    gGame.markedCount = currCell.isMarked ? ++gGame.markedCount : --gGame.markedCount;
    elCell.innerText = currCell.isMarked ? MARKED : '';
    checkGameOver();
}

function checkGameOver() {

    var isAllCellsShown = gGame.shownCount === gLevel.size ** 2 - gLevel.mines;
    var livesUsed = gLevel.lives - gGame.lives;
    var isAllMinesMarked = gGame.markedCount + livesUsed === gLevel.mines;

    if (isAllCellsShown && isAllMinesMarked) {
        compareScore(gGame.secsPassed);
        gameOver(true);
    }
}

function gameOver(isWin) {

    var chosenClass = isWin ? 'win-smiley' : 'loose-smiley';

    var elSmiley = document.querySelector('.smiley');
    elSmiley.classList.add(chosenClass);
    gGame.isOn = false;
    clearInterval(gTimerInterval);
    gTimerInterval = null;

    var elSmiley = document.querySelector('.smiley');
}

function resetTimer() {
    var elTimer = document.querySelector('.timer span');
    elTimer.innerText = '000';
}

function runTimer() {
   
    var currTime = fixTimeFormat(++gGame.secsPassed);

    var elTimer = document.querySelector('.timer span');
    elTimer.innerText = currTime;
}

function fixTimeFormat(time) {
    if (!time) return 0;
    if (time < 100) time = '0' + time;
    if (time < 10) time = '0' + time;
    return time;
}

function changeLevel(lvlIdx) {
    var levels = [
        { size: 4, mines: 2, lives: 1 },
        { size: 8, mines: 12, lives: 3 },
        { size: 12, mines: 30, lives: 3 },
    ];
    gLevel = levels[lvlIdx];
    gLvlBestScore = `lvl-${lvlIdx}-BestScore`;
    initGame();
}

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

function looseLife() {
    gGame.lives--;
    var elLives = document.querySelector('.lives');
    var elLivesLi = elLives.querySelectorAll('.live');
    var elLivesLiInvis = elLives.querySelectorAll('.invisible');

    var invisibleCount = elLivesLiInvis.length;
    elLivesLi[invisibleCount].classList.add('invisible');
}

function updateLives() {
    var elLivesLis = document.querySelectorAll('.lives li');

    for (var i = 0; i < gLevel.lives; i++) {
        elLivesLis[i].classList.remove('invisible');
    }

    for (var i = gLevel.lives; i < elLivesLis.length; i++) {
        elLivesLis[i].classList.add('invisible');
    }
}

function resetSmiley() {
    var elSmiley = document.querySelector('.smiley');
    elSmiley.classList.remove('win-smiley', 'loose-smiley');
}
