const { ipcRenderer } = require('electron');

function handleLogin() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  ipcRenderer.send('login', { username, password });
}

ipcRenderer.on('loginResponse', (event, { success, token }) => {
  console.log("ESTÁ BATENDO AQUI", event, success, token);
  if (success) {
    localStorage.setItem('token', token);
    window.location.href = '../ListQuizzes/renderer.html';
  } else {
  }
});
