global.onmessage = function(e) {
  console.log('Message received from main script');
  var workerResult = 'Result: ' + JSON.stringify(e.data);
  console.log('Posting message back to main script');
  global.postMessage(workerResult);
}
  