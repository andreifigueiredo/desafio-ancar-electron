const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const process = require('dotenv')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, './renderer/Login/renderer.html'));
  
  // mainWindow.loadURL('http://localhost:8080');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

ipcMain.on('login', async (event, { username, password }) => {
  try {
    const response = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
      const data = await response.json();
      event.reply('loginResponse', { success: true, token: data.token }); 
    } else {
      const errorData = await response.json();
      event.reply('loginResponse', { success: false, error: errorData.message });
    }
  } catch (error) {
    event.reply('loginResponse', { success: false, error });
  }
});

ipcMain.on('getQuizzes', async (event, { page, limit }) => {
  try {
    const response = await fetch(`http://localhost:3000/api/v1/quizzes?limit=${limit}&page=${page}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (response.ok) {
      const data = await response.json();
      event.reply('getQuizzesResponse', { success: true, quizzes: data }); 
    } else {
      const errorData = await response.json();
      event.reply('getQuizzesResponse', { success: false, error: errorData.message });
    }
  } catch (error) {
    event.reply('getQuizzesResponse', { success: false, error });
  }
});

ipcMain.on('getQuiz', async (event, { id, page, limit, token }) => {
  try {
    const response = await fetch(`http://localhost:3000/api/v1/quizzes/${id}/answers?limit=${limit}&page=${page}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      event.reply('getQuizResponse', { success: true, quiz: data }); 
    } else {
      const errorData = await response.json();
      event.reply('getQuizResponse', { success: false, error: errorData.message });
    }
  } catch (error) {
    event.reply('getQuizResponse', { success: false, error });
  }
});

ipcMain.on('createAnswers', async (event, { id, answers, token }) => {
  try {
    const response = await fetch(`http://localhost:3000/api/v1/quizzes/${id}/answers`, {
      method: 'POST',
      body: JSON.stringify(answers),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      event.reply('createAnswersResponse', { success: true, quiz: data }); 
    } else {
      const errorData = await response.json();
      event.reply('createAnswersResponse', { success: false, error: errorData.message });
    }
  } catch (error) {
    event.reply('createAnswersResponse', { success: false, error });
  }
});


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
