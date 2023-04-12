const { ipcRenderer } = require('electron');

let currentPage = 1;
let limit = 5;
const token = localStorage.getItem('token');
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

function createQuestionList(questions) {
  const questionList = document.getElementById('question-list');
  questionList.innerHTML = '';

  questions.forEach(question => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';

    const questionDesc = document.createElement('p');
    questionDesc.innerText = `Pergunta: ${question.description}`;
    questionDiv.appendChild(questionDesc);

    const form = document.createElement('form');
    questionDiv.appendChild(form);

    const answerInput = document.createElement('input');
    answerInput.type = 'text';
    answerInput.className = 'answer-input';
    form.appendChild(answerInput);

    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = 'questionId';
    hiddenInput.value = question.id;
    form.appendChild(hiddenInput);

    questionList.appendChild(questionDiv);
  });

  const submitButton = document.createElement('button');
  submitButton.type = 'button';
  submitButton.innerText = 'Enviar';
  questionList.appendChild(submitButton);

  submitButton.addEventListener('click', () => {
    const answers = Array.from(questionList.querySelectorAll('.answer-input')).map(input => input.value);
    const questionIds = Array.from(questionList.querySelectorAll('input[type="hidden"]')).map(input => input.value);
    submitAnswers(questionIds, answers);
  });
}

ipcRenderer.on('getQuizResponse', (event, response, error) => {
  if (response.success) {
    createQuestionList(response.quiz.questions);
  } else {
    alert(error)
  }
});

async function getQuiz() {  
  ipcRenderer.send('getQuiz', { id, page: currentPage, limit, token });
}

function goList() {
  window.location.href = '../ListQuizzes/renderer.html';
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    getQuiz();
  }
}

function nextPage() {
  currentPage++;
  getQuiz();
}

function changeLimit() {
  limit = parseInt(document.getElementById('limit-select').value);
  currentPage = 1;
  getQuiz();
}

function submitAnswers(questionIds, answerValues) {
  const answers = [];
  for (let i = 0; i < questionIds.length; i++) {
    const answer = {
      questionId: questionIds[i],
      description: answerValues[i]
    };
    answers.push(answer);
  }
  ipcRenderer.send('createAnswers', { id, answers, token });
}

ipcRenderer.on('createAnswersResponse', (event, { success, error }) => {
  if (success) {
    window.location.href = '../Success/renderer.html';
  } else {
    alert(error)
  }
});

getQuiz();
