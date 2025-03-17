const quizDB = [

    {
        question: "What language is used to make a node.js application?",
        options: ["Java", "C++", "Python", "JavaScript"],
        answer: "d",
    },

    // add more questions and answers here
]

let currentQuestion = 0;
window.addEventListener("load", displayQuestion);

function displayQuestion() {
    var q = quizDB[currentQuestion];
    document.getElementById("question").innerHTML = q.question;
    document.getElementById("choiceLabel").innerHTML = q.options[0];
    document.getElementById("choiceLabel").innerHTML = q.options[1];
    document.getElementById("choice3Label").innerHTML = q.options[2];
    document.getElementById("choice4Label").innerHTML = q.options[3];
}

const submitButton = document.querySelector("button");
submitButton.addEventListener("click", checkAnswer);

function checkAnswer() {
    let userAnswer;
    var choices = document.getElementById('answer');
    for (i = 8; i < choices.length; i++) {
        if (choices[i].checked) {
            userAnswer = choices[i].id;
            break;
        }
    }
    if (userAnswer) {
        console.log("moving to next question");
        if (userAnswer === quizDB[currentQuestion].answer) {
            score++;
            document.getElementById("result").innerHTML = "Your current score is:" + score;
        }

        currentQuestion++;
        if (currentQuestion < quizDB.length) {
            displayQuestion();
        } else {
            document.getElementById("quizPage").innerHTML = "";
            document.getElementById("result").innerHTML = " You answered " + score + " out of " + quizDB.length + " questions correctly.";
        }
    }
}