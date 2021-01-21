'use strict';

var gUndos;
//TODO- BONUSES:
//1. Hints - 3 hints VV :)
//when clicked:
// a.changed color
//b.the next hidden cell clicked - the cell and all it's negs are revealed for 1 sec

//c.The hint dissappears.maybe an object with isOn and isUsed, class= .hidden after use

//2. Keep best score in the local storage and present it on the page  VV :)

//3.recursive expend VV :)

//V
function showHint(elHintButton) {
    if (gGame.isShowHint || !gGame.isOn) return;
    elHintButton.classList.add('highligt-text');
    elHintButton.innerText = '❓';
    // elHintButton.classList.add('highligt-text', 'clicked-hint');
    gGame.isShowHint = true;
}

function revealHintCells(cellI, cellJ) {
    //TODO: add a check when cell clicked- gGame.isShowHint if true  this function and return (can't have normal click action here)
    var currCell = gBoard[cellI][cellJ];
    if (currCell.isShown) return;

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gLevel.size) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gLevel.size) continue;
            var elCurrCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
            elCurrCell.classList.add('hint-cell');
            revealCell(elCurrCell, i, j, false);
        }
    }
    setTimeout(hideHint, 1000);
}

// V
function hideHint() {
    gGame.isShowHint = false;
    var elHintCells = document.querySelectorAll('.hint-cell');

    for (var i = 0; i < elHintCells.length; i++) {
        var elCurrCell = elHintCells[i];

        var currCellI = elCurrCell.dataset.i;
        var currCellJ = elCurrCell.dataset.j;
        var currCell = gBoard[currCellI][currCellJ];

        elCurrCell.classList.remove('hint-cell');

        if (currCell.isShown) continue;
        elCurrCell.innerText = EMPTY;
        elCurrCell.classList.add('closed-cell');
    }

    var elHintButton = document.querySelector('.highligt-text');
    elHintButton.classList.remove('highligt-text');
    elHintButton.classList.add('invisible');
}

function resetHints() {
    var elHints = document.querySelectorAll('.hint');
    for (var i = 0; i < elHints.length; i++) {
        elHints[i].classList.remove('invisible', 'highligt-text');
        elHints[i].innerText = '❔';
    }
}

//V
function compareScore(newScore) {
    var currBestScore = window.localStorage.getItem(gLvlBestScore);

    if (!currBestScore || newScore < currBestScore) {
        window.localStorage.setItem(gLvlBestScore, newScore + '');
    }
}

function updateBestScore() {
    var currBestScore = window.localStorage.getItem(gLvlBestScore);

    var elBestScore = document.querySelector('.best-score span');
    elBestScore.innerText = currBestScore ? fixTimeFormat(currBestScore) : 0;
}

//V test with undos - not working yet !!!!!
function expandShown(cellI, cellJ) {
    var cellsOpen = [];
    var centralCell = gBoard[cellI][cellJ];
    if (centralCell.minesAroundCount > 0) return;

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gLevel.size) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gLevel.size) continue;

            var currCell = gBoard[i][j];
            if (currCell.isMine || currCell.isShown || currCell.isMarked) continue;

            gGame.shownCount++;
            gBoard[i][j].isShown = true;

            var cellContent = returnCellContent(i, j);
            var elCurrCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
            elCurrCell.innerText = cellContent;
            elCurrCell.classList.remove('closed-cell');

            cellsOpen.push({ i, j });
            var cellsOpenRecurs = expandShown(i, j);
            // console.log('cells open recurs', cellsOpenRecurs)
        }
    }

    return cellsOpenRecurs ? cellsOpen.concat(cellsOpenRecurs) : cellsOpen;
}

//Second version - resursion works
// function expandShown(cellI, cellJ) {
//     var centralCell = gBoard[cellI][cellJ];
//     if (centralCell.minesAroundCount > 0) return;

//     for (var i = cellI - 1; i <= cellI + 1; i++) {
//         if (i < 0 || i >= gLevel.size) continue;
//         for (var j = cellJ - 1; j <= cellJ + 1; j++) {
//             if (j < 0 || j >= gLevel.size) continue;

//             var currCell = gBoard[i][j];
//             if (currCell.isMine || currCell.isShown || currCell.isMarked) continue;

//             gGame.shownCount++;
//             gBoard[i][j].isShown = true;

//             var cellContent = returnCellContent(i, j);
//             var elCurrCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
//             elCurrCell.innerText = cellContent;
//             elCurrCell.classList.remove('closed-cell');

//             expandShown(i, j);
//         }
//     }
// }

//first version copy-  only 1st gn negs
// function expandShown(cellI, cellJ) {
//     // console.log('expand shown i,j', cellI,cellJ);

//     for (var i = cellI - 1; i <= cellI + 1; i++) {
//         if (i < 0 || i >= gLevel.size) continue;
//         for (var j = cellJ - 1; j <= cellJ + 1; j++) {
//             if (j < 0 || j >= gLevel.size) continue;
//             // console.log('i,j', i, ',', j);
//             var currCell = gBoard[i][j];
//             if (currCell.isMine || currCell.isShown || currCell.isMarked) continue;
//             gGame.shownCount++;
//             // console.log('game shown count', gGame.shownCount);
//             // console.log(('is currcell shown', currCell.isShown));
//             gBoard[i][j].isShown = true;
//             // console.log(('is gBoard[i][j] shown', currCell.isShown));

//             var cellContent = returnCellContent(i, j);
//             var elCurrCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
//             elCurrCell.innerText = cellContent;
//             elCurrCell.classList.remove('closed-cell');

//             // console.log('cell',i,'-',j,'content:',cellContent);
//             // console.log('elCurrCell',elCurrCell);
//             // console.log('----------------------------------');
//         }
//     }
//     //TODO: when a user clicks an empty cell, open all it's neighboars.
//     //***TODO Bonus: expand all empty cells connected.
// }

// not working yet !!!!!
function undo() {
    var lastSteps = gUndos.pop();
    // console.log('last steps', lastSteps);
    for (var i = 0; i < lastSteps.length; i++) {
        var pos = lastSteps[i];
        // console.log('pos', pos);
        var cell = gBoard[pos.i][pos.j];
        cell.isShown = false;

        var elCell = document.querySelector(`[data-i="${pos.i}"][data-j="${pos.j}"]`);
        elCell.classList.add('closed-cell');
        elCell.innerText = '';
    }
}

function safeClick() {
    //TODO: if first click - modal first click is always safe V
    //TODO: find all safe cells V
    //choose one randomly V
    //highlight cell in yellow for 1 sec V
    //add safe clicks count to gGame V
    //decrease safe clicks count V
    if (!gGame.safeClicks || !gGame.isOn) return;
    if (!gTimerInterval) {
        showMsgModal('First Click is Always Safe');
        return;
    }

    gGame.isOn = false;
    gGame.safeClicks--;
    updateSafeClick();

    var safeCells = findAllSafeCells();
    if (safeCells.length === 0) return;

    var randIdx = getRandomIntEx(0, safeCells.length);
    var pos = safeCells[randIdx];
    var elCell = document.querySelector(`[data-i="${pos.i}"][data-j="${pos.j}"]`);
    elCell.classList.add('safe-mark');

    setTimeout(finishSafeClick, 1000, elCell);
}

function finishSafeClick(elCell) {
    gGame.isOn = true;
    elCell.classList.remove('safe-mark');
}

function findAllSafeCells() {
    var safeCells = [];
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            if (gBoard[i][j].isMine || gBoard[i][j].isShown) continue;
            safeCells.push({ i, j });
        }
    }
    return safeCells;
}

function showMsgModal(msg) {
    var elMsg = document.querySelector('.msg');
    elMsg.innerText = msg;
    elMsg.classList.remove('hidden-modal');
    setTimeout(hideMsgModal, 1200, elMsg);
}

function hideMsgModal(elMsg) {
    elMsg.classList.add('hidden-modal');
}

function updateSafeClick() {
    var elSafeSpan = document.querySelector('.safe-click span');
    elSafeSpan.innerText = gGame.safeClicks;
}

function manualyPlacMines(elButton) {
    //Todo: create gManualMode{minesCount:gLevel.mines, isOn:false, positions:[]}
    //TODO: add a condition in cellClicked() that changes first cell actions accordingly
    //check if there are actions in it we might miss
    //TODO: gMinesCounter = gLevel.mines;
    //add gIsManualOn;
    //Todo: collect the clicked positions
    //decrease gMinesCounter
    //when the counter ===0 continue as usual, only first click actions checks if positions.len>0 then works with the array

    
    if (gManualMode.isOn) {
        gManualMode.isOn = false;
        turnOffManualHighlights();
        
        return;
    }
    elButton.classList.add('pressed');
    var elBoard = document.querySelector('.board');
    elBoard.classList.add('mines-mode');
    gManualMode.isOn = true;

    // game.isOn = !gManualMode.isOn; will prevent cellClicked from running

    //
}

function collectMinesPositions(i, j, manualMode) {
    //TODO: add check if position already exists if so, show modal

    var isExist = checkIfPosExist(i, j);
    if (isExist) return;

    manualMode.minesCount--;
    updateManualMinesCount()
    
    manualMode.positions.push({ i, j });
    manualMode.isOn = manualMode.minesCount > 0;

    if (!manualMode.isOn) turnOffManualHighlights();
}

function checkIfPosExist(posI, posJ) {
    var positions = gManualMode.positions;
    for (var i = 0; i < positions.length; i++) {
        if (positions[i].i === posI && positions[i].j === posJ) {
            showMsgModal('Position already taken!');
            return true;
        }
    }
    return false;
}

function turnOffManualHighlights() {
    var elButton = document.querySelector('.manual-mines');
    elButton.classList.remove('pressed');
    var elBoard = document.querySelector('.board');
    elBoard.classList.remove('mines-mode');
    setTimeout(showMsgModal, 200, "Great! Let's Play!");
}

function updateManualMinesCount(){
    var elManualButtonSpan = document.querySelector('.manual-mines span');
    elManualButtonSpan.innerText = gManualMode.minesCount;
}