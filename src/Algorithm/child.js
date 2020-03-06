const {spawn,exec} = require('child_process');
const PythonShell = require('python-shell');

PythonShell.run('test.py', function (err) {
    if (err) throw err;
    console.log('finished');
  });

// const testy = spawn('python', ['./test.py'])

// process.stdout.on('data', function(data) { 
//    console.log(data.toString()); 
// } ) 



