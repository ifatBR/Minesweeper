function getRandomIntEx(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  var diff = max - min;
  var randNum = Math.floor(Math.random() * diff) + min;
  return randNum;
}

function getRandomIntImp(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  var diff = max - min +1;
  var randNum = Math.floor(Math.random() * diff) + min;
  return randNum;
}

function isPrime(num) {
  var divider = 2;
  var limit = Math.sqrt(num);
  while (divider < limit) {
    if (num % divider === 0) return true;
    divider++;
  }
  return true;
}

function bubbleSortNums(nums){
  var numsCopy = nums.slice();
  var numsLen = numsCopy.length;
  var swapped;

  do{
      swapped = false;
      for (var i=0; i<numsLen; i++){
          if(numsCopy[i] >numsCopy[i+1]){
              var temp = numsCopy[i];
              numsCopy[i]=numsCopy[i+1];
              numsCopy[i+1]=temp;
              swapped = true;
          }
      }
  } while (swapped);
  return numsCopy;
}


function isMatSquare(mat){
  for (var i = 0; i < mat.len; i++) {
    if (mat[i].length !== mat.length) return false;
  }
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getTime() {
  return new Date().toString().split(' ')[4];
}