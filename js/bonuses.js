'use strict';

//TODO- BONUSES:
//1. Hints - 3 hints
//when clicked:
// a.changed color
//b.the next hidden cell clicked - the cell and all it's negs are revealed for 1 sec

//c.The hint dissappears.maybe an object with isOn and isUsed, class= .hidden after use

function showHint(elHintButton) {
    if(gGame.isShowHint ||!gGame.isOn) return;
    elHintButton.classList.add('highligt-text', 'clicked-hint');
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
            revealCell(elCurrCell, i, j);
        }
    }
    setTimeout(hideHint, 1000);
}

//There's abug. can't choose the button by a class a former button has without qsAll and a loop.
//Need to fnd another method.
function hideHint() {
    gGame.isShowHint = false;
    var elHintCells = document.querySelectorAll('.hint-cell');

    for (var i = 0; i < elHintCells.length; i++) {
        var elCurrCell = elHintCells[i];
        
        var currCellI = elCurrCell.dataset.i;
        var currCellJ = elCurrCell.dataset.j;
        var currCell = gBoard[currCellI][currCellJ];
        
        currCell.isShown = false;
        elCurrCell.innerText = 'H';
        elCurrCell.classList.add('closed-cell');
        elCurrCell.classList.remove('hint-cell');
        
    }

    var elHintButton = document.querySelector('.clicked-hint');
    elHintButton.classList.remove('highligt-text');
    elHintButton.classList.add('invisible');
    elHintButton.classList.remove('.clicked-hint');
    console.log('elButton', elHintButton);
}

function resetHints(){
    var elHints = document.querySelectorAll('.hint');
    // console.log('-----------------------');
    for(var i = 0; i< elHints.length; i++){
        elHints[i].classList.remove('invisible', 'clicked-hint');
        // elHintsButton.innerText = '';
        // console.log('elHint', elHints[i]);
    }

}
