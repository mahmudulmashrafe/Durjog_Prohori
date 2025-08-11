const { exec } = require('child_process');
const path = require('path');

console.log('Finding donation server process...');

// Find the process using port 5004
exec('netstat -ano | findstr :5004', (error, stdout, stderr) => {
  if (error) {
    console.error('Error finding process:', error);
    startServer();
    return;
  }

  // Parse the output to get the PID
  const lines = stdout.trim().split('\n');
  if (lines.length === 0) {
    console.log('No process found using port 5004');
    startServer();
    return;
  }

  // Extract PID from the first line (assuming the first LISTENING entry is our server)
  const listeningLine = lines.find(line => line.includes('LISTENING'));
  if (!listeningLine) {
    console.log('No process found LISTENING on port 5004');
    startServer();
    return;
  }

  const pid = listeningLine.trim().split(/\s+/).pop();
  console.log(`Found process ID: ${pid}`);

  // Kill the process
  exec(`taskkill /F /PID ${pid}`, (killError, killStdout, killStderr) => {
    if (killError) {
      console.error('Error stopping server:', killError);
    } else {
      console.log(`Process ${pid} stopped successfully`);
    }

    // Start new server after a short delay
    setTimeout(() => {
      startServer();
    }, 1000);
  });
});

function startServer() {
  console.log('Starting donation server...');
  const serverPath = path.join(__dirname, 'donations-server.js');
  
  // Start the server
  const child = exec(`node "${serverPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('Server error:', error);
    }
  });

  // Log server output
  child.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  child.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  console.log('Server starting in the background. Press Ctrl+C to exit this script.');
} 