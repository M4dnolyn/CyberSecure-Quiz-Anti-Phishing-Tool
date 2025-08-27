let currentQuestionIndex = 0;
let questions = [];

// Chargement de la question depuis mon fichier json
fetch("question.json")
  .then((response) => response.json())
  .then((data) => {
    questions = data;
    ///console.log("questions chargées :", questions);
    showQuestion();
  });

// Affichage de la question
function showQuestion() {
  let container = document.getElementById("quiz-container");
  let questionObj = questions[currentQuestionIndex];

  container.innerHTML = `
     <h2>${questionObj.question}</h2> // affichage du texte de la question
     <ul>
         ${questionObj.options
           .map(
             (option, index) => `
           <li>
                 <button onclick = "checkAnswer(${index})">${option}</button>
           </li>
    
         `
           )
           .join("")}
     </ul>`;
}

// Vérification de la reponse

function checkAnswer(selectedIndex) {
  let correctAnswer = questions[currentQuestionIndex].answer;

  if (selectedIndex === correctAnswer) {
    alert("✅ Bonne réponse !");
  } else {
    alert("❌ Mauvaise réponse !");
  }
}

// Passer à la question suivante

document.getElementById("next-btn").addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    alert("🎉 Quiz terminé !");
  }
});
