var keepsHisWord;
keepsHisWord = true;
promise1 = new Promise(function(resolve, reject) {
  if (keepsHisWord) {
    resolve("The man likes to keep his word");
  } else {
    reject("The man doesnt want to keep his word");
  }
});
console.log('1: ');
console.log(promise1);

promise2 = new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve({
        message: "The man likes to keep his word",
        code: "aManKeepsHisWord"
      });
    }, 10 * 1000);
    /* reject( {
        message: "Doesnt keep his workd" , 
        code: "somethingWrong"
    });  */
  });
  console.log('\n2:');
  console.log( promise2.then( console.log) );

  promise2.then( function( result) {
    console.log( '\nAnother then')
    console.log(result);
  });
  
