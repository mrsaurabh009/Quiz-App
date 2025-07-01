document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("quizSetupForm");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const subject = document.getElementById("subject").value;
    const numQuestions = document.getElementById("numQuestions").value;

    if (!subject || !numQuestions) {
      alert("Please fill all fields.");
      return;
    }

    const quizSettings = {
      subject,
      numQuestions: parseInt(numQuestions),
      time: 30
    };

    localStorage.setItem("quizSettings", JSON.stringify(quizSettings));
    window.location.href = "quiz.html";
  });
});
