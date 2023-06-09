const { ipcRenderer } = require('electron');

let currentPage = 1;
let limit = 5;

function updateQuizzesList(quizzes) {
  const quizzesList = document.getElementById('quizzes-list');
  quizzesList.innerHTML = '';

  quizzes.forEach((quiz) => {
    const quizItem = document.createElement('li');
    quizItem.textContent = quiz.name + ' - ' + quiz.description;

    const quizButton = document.createElement('button');
    quizButton.textContent = 'Responder';
    quizButton.addEventListener('click', () => {
      window.location.href = `../AnswerQuiz/renderer.html?id=${quiz.id}`;
    });

    quizItem.appendChild(quizButton);
    quizzesList.appendChild(quizItem);
  });
}

ipcRenderer.on('getQuizzesResponse', (event, response, error) => {
  if (response.success) {
    updateQuizzesList(response.quizzes);
  } else {
    alert(error)
  }
});

async function getQuizzes() {
  ipcRenderer.send('getQuizzes', { page: currentPage, limit });
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    getQuizzes();
  }
}

function nextPage() {
  currentPage++;
  getQuizzes();
}

function changeLimit() {
  limit = parseInt(document.getElementById('limit-select').value);
  currentPage = 1;
  getQuizzes();
}

getQuizzes();
