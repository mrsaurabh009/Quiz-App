let currentIndex = 0, score = 0, quiz = [], timer, timerDuration = 30;

const settings = JSON.parse(localStorage.getItem("quizSettings")) || {
  subject: "gk",
  numQuestions: 5,
  time: 30
};

timerDuration = settings.time;

const questionText = document.getElementById("questionText");
const optionsList = document.getElementById("optionsList");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const nextBtn = document.getElementById("nextBtn");
const resultBox = document.getElementById("resultBox");
const finalScore = document.getElementById("finalScore");

async function fetchQuestions() {
  try {
    const response = await fetch(`questions/${settings.subject}.json`);
    if (!response.ok) throw new Error("Failed to load JSON");

    const data = await response.json();

    // Used ID tracking key
    const usedIdsKey = `usedQuestions-${settings.subject}`;
    const usedIds = JSON.parse(localStorage.getItem(usedIdsKey)) || [];

    // Filter unused questions
    const unused = data.filter(q => !usedIds.includes(q.id));
    const selected = shuffle(unused).slice(0, settings.numQuestions);

    if (selected.length < settings.numQuestions) {
      console.warn("Not enough unused questions. Resetting question history.");
      localStorage.removeItem(usedIdsKey);
      quiz = shuffle(data).slice(0, settings.numQuestions);
    } else {
      quiz = selected;

      // Update used question IDs
      const newUsedIds = [...usedIds, ...selected.map(q => q.id)];
      localStorage.setItem(usedIdsKey, JSON.stringify(newUsedIds));
    }

    startQuiz();

  } catch (error) {
    console.error("Error loading local JSON:", error);
    alert("Unable to load questions. Please check your subject file.");
  }
}

function startQuiz() {
  loadQuestion();
}

function loadQuestion() {
  clearInterval(timer);
  timerDisplay.textContent = `Time Left: ${timerDuration}`;

  if (currentIndex >= quiz.length) {
    endQuiz();
    return;
  }

  const q = quiz[currentIndex];
  questionText.textContent = `Q${currentIndex + 1}. ${q.q}`;
  optionsList.innerHTML = "";

  q.options.forEach(opt => {
    const li = document.createElement("li");
    li.textContent = opt;
    li.className = "option";
    li.onclick = () => selectOption(opt);
    optionsList.appendChild(li);
  });

  startTimer();
}

function selectOption(selected) {
  const correct = quiz[currentIndex].answer;
  const options = document.querySelectorAll(".option");

  options.forEach(opt => {
    opt.onclick = null;
    opt.style.background = opt.textContent === correct
      ? "#00c853"
      : opt.textContent === selected ? "#d50000" : "";
  });

  if (selected === correct) score++;
  scoreDisplay.textContent = `Score: ${score}`;
  clearInterval(timer);
}

function startTimer() {
  let timeLeft = timerDuration;
  timerDisplay.textContent = `Time Left: ${timeLeft}`;

  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time Left: ${timeLeft}`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      autoSkipQuestion();
    }
  }, 1000);
}

function autoSkipQuestion() {
  const correct = quiz[currentIndex].answer;
  const options = document.querySelectorAll(".option");

  options.forEach(opt => {
    opt.onclick = null;
    if (opt.textContent === correct) opt.style.background = "#00c853";
  });

  setTimeout(() => {
    currentIndex++;
    loadQuestion();
  }, 1000);
}

function endQuiz() {
  clearInterval(timer);
  document.getElementById("quizBox").style.display = "none";
  resultBox.style.display = "block";
  finalScore.textContent = `You scored ${score} out of ${quiz.length}`;
}

nextBtn.addEventListener("click", () => {
  clearInterval(timer);
  currentIndex++;
  loadQuestion();
});

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// Start the process
fetchQuestions();
