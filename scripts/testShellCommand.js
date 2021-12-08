const { spawn } = require('child_process')

const [command,...parameters] = 'ls -la && git add .'.split(' ')
console.log({command,parameters})
const child = spawn(command,parameters);

child.on('exit', code => {
  console.log(`Exit code is: ${code}`);
});

child.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

child.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

child.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
