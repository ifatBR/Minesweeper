'use strict';

function showHint(elHintButton) {
    if (gGame.isShowHint || !gGame.isOn) return;
    // playSound('../sounds/ding.wav')
    playSound('ding-sound');
    elHintButton.classList.add('highligt-text');
    elHintButton.innerText = '❓';
    gGame.isShowHint = true;
    showMsgModal('Choose cell to reveal');
}

function revealHintCells(cellI, cellJ) {
    if (gBoard[cellI][cellJ].isShown) return;

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gLevel.size) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gLevel.size) continue;
            var elCurrCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
            elCurrCell.classList.add('hint-cell');
            if (gBoard[i][j].isMarked) elCurrCell.classList.remove('marked');
            revealCell(elCurrCell, i, j, false);
        }
    }
    // playSound('../sounds/magic2.mp3');
    playSound('magic2-sound');

    setTimeout(hideHint, 1000);
}

function hideHint() {
    gGame.isShowHint = false;
    var elHintCells = document.querySelectorAll('.hint-cell');

    for (var i = 0; i < elHintCells.length; i++) {
        var elCurrCell = elHintCells[i];

        var currCellI = +elCurrCell.dataset.i;
        var currCellJ = +elCurrCell.dataset.j;
        var currCell = gBoard[currCellI][currCellJ];

        elCurrCell.classList.remove('hint-cell');

        if (currCell.isShown) continue;
        elCurrCell.innerText = EMPTY;
        if (currCell.isMarked) {
            elCurrCell.classList.add('marked');
            elCurrCell.innerText = MARKED;
        }
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

function compareScore(newScore) {
    var currBestScore = window.localStorage.getItem(gLvlBestScoreKey);

    if (!currBestScore || newScore < currBestScore) {
        window.localStorage.setItem(gLvlBestScoreKey, newScore + '');
    }
}

function updateBestScore() {
    var currBestScore = window.localStorage.getItem(gLvlBestScoreKey);

    var elBestScore = document.querySelector('.best-score span');
    elBestScore.innerText = currBestScore ? fixTimeFormat(currBestScore) : 0;
}

function expandShown(cellI, cellJ) {
    var clickedCell = gBoard[cellI][cellJ];
    if (clickedCell.minesAroundCount > 0) return [];

    var cellsOpen = [];
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gLevel.size) continue;

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gLevel.size) continue;

            var currCell = gBoard[i][j];
            if (currCell.isMine || currCell.isShown || currCell.isMarked) continue;

            gGame.shownCount++;
            var elCurrCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
            revealCell(elCurrCell, i, j, true);

            cellsOpen.push({ i, j });
            var cellsOpenRecurs = expandShown(i, j);
            cellsOpen = cellsOpen.concat(cellsOpenRecurs);
        }
    }
    return cellsOpen;
}

function undo() {
    if (!gUndos || !gGame.isOn) return;
    // playSound('../sounds/swoosh.wav');
    playSound('woosh-sound');
    var lastSteps = gUndos[0].length ? gUndos.pop() : gUndos;
    for (var i = 0; i < lastSteps.length; i++) {
        var pos = lastSteps[i];
        var cell = gBoard[pos.i][pos.j];
        cell.isShown = false;

        var elCell = document.querySelector(`[data-i="${pos.i}"][data-j="${pos.j}"]`);
        elCell.classList.add('closed-cell');
        if (cell.isMarked) elCell.classList.remove('marked');
        if (cell.isMine) {
            elCell.classList.remove('exploded');
            gGame.lives++;
            updateLives();
        }

        elCell.innerText = '';
    }
}

function safeClick() {
    if (!gGame.safeClicks || !gGame.isOn) return;
    if (!gTimerInterval) {
        showMsgModal('First Click is Always Safe');
        return;
    }

    // playSound('../sounds/magic.wav');
    playSound('magic-sound');
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
    setTimeout(hideMsgModal, 1500, elMsg);
}

function hideMsgModal(elMsg) {
    elMsg.classList.add('hidden-modal');
}

function updateSafeClick() {
    var elSafeSpan = document.querySelector('.safe-click span');
    elSafeSpan.innerText = gGame.safeClicks;
}

function manualyPlacMines(elButton) {
    if (gTimerInterval || !gGame.isOn) return;

    // playSound('../sounds/click.wav');
    playSound('click-sound');

    if (gManualMode.isOn || gManualMode.minesCount < gLevel.mines) {
        gManualMode = resetManualMode(gLevel);
        showMsgModal('Manual Placement Cacelled');
        return;
    }

    elButton.classList.add('pressed');
    var elBoard = document.querySelector('.board');
    elBoard.classList.add('mines-mode');
    gManualMode.isOn = true;
}

function collectMinesPositions(i, j) {
    var isExist = checkIfPosExist(i, j);
    if (isExist) return;

    // playSound('../sounds/boop.wav');
    playSound('boop-sound');

    gManualMode.minesCount--;
    gManualMode = updateManualMinesButton(gManualMode);

    gManualMode.positions.push({ i, j });
    gManualMode.isOn = gManualMode.minesCount > 0;

    if (!gManualMode.isOn) {
        turnOffManualHighlights();
        setTimeout(showMsgModal, 200, "Great! Let's Play!");
    }
}

function checkIfPosExist(posI, posJ) {
    var positions = gManualMode.positions;
    for (var i = 0; i < positions.length; i++) {
        if (positions[i].i === posI && positions[i].j === posJ) {
            setTimeout(showMsgModal, 50, 'Position already taken!');

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
}

function updateManualMinesButton(manualMode) {
    var elManualButtonSpan = document.querySelector('.manual-mines span');
    elManualButtonSpan.innerText = manualMode.minesCount;

    return manualMode;
}

function resetManualMode(level) {
    var manualMode = {
        minesCount: level.mines,
        isOn: false,
        positions: [],
    };
    manualMode = updateManualMinesButton(manualMode);
    turnOffManualHighlights();
    return manualMode;
}
