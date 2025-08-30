let currentQuestionIndex = 0;
let score = 0;
let questions = [];

// Charger les questions depuis le fichier JSON
fetch("question.json")
  .then((response) => response.json())
  .then((data) => {
    questions = data;
    showQuestion();
  });

// Affichage d'une question
function showQuestion() {
  let container = document.getElementById("quiz-container");
  let questionObj = questions[currentQuestionIndex];

  container.innerHTML = `
     <h2>${questionObj.question}</h2> 
     <ul>
         ${questionObj.options
           .map(
             (option, index) => `
           <li>
                 <button onclick="checkAnswer(${index})">${option}</button>
           </li>
         `
           )
           .join("")}
     </ul>`;

  // cacher le bouton suivant au début de chaque question
  document.getElementById("next-btn").classList.add("hidden");
}

// Vérification de la réponse
function checkAnswer(selectedIndex) {
  let correctAnswer = questions[currentQuestionIndex].answer;

  if (selectedIndex === correctAnswer) {
    score++;
  }

  // 👉 S'il reste des questions, on montre le bouton "suivant"
  if (currentQuestionIndex < questions.length - 1) {
    document.getElementById("next-btn").classList.remove("hidden");
  } else {
    // 👉 si c’est la dernière question, pas de bouton "suivant", on montre directement le score
    showScore();
  }
}

// Passer à la question suivante
document.getElementById("next-btn").addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showScore();
  }
});

function showScore() {
  let container = document.getElementById("quiz-container");
  container.innerHTML = `
    <h2>🎉 Quiz terminé !</h2>
    <p>Ton score : ${score} / ${questions.length}</p>
    <button onclick="restartQuiz()" class="btn">Rejouer</button>
  `;

  // 👉 on cache le bouton suivant quand le quiz est fini
  document.getElementById("next-btn").classList.add("hidden");
}

function restartQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  showQuestion();

  // 👉 quand on rejoue, le bouton "suivant" réapparaît normalement après la première réponse
}
