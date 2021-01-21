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
