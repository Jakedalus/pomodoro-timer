var sessionLength = 25;
var breakLength = 5;

var workTimer = sessionLength * 60 * 1000;
var breakTimer = breakLength * 60 * 1000;

var currentSession = "work";

var percent = .0;
var totalCircle = 158;
var p = percent * totalCircle;
var now, then;

// DOM elements
var circle = document.querySelector("#circle-timer");
var timerText = document.querySelector("#timer");
var playPause = document.querySelector("#play-pause");
var controls = document.querySelector("#controls");
var sessionLbl = document.querySelector("#sl");
var breakLbl = document.querySelector("#bl");

timerText.textContent = sessionLength + ":00";
circle.style.strokeDasharray = p + " 158";

var timerStarted = false;
var isPlaying = false;

var wasPaused, timeLeft, t;

var wasSwitched = false;

function setTimer() {
    now = new Date().getTime();
    workTimer = sessionLength * 60 * 1000;
    console.log(workTimer);
    breakTimer = breakLength * 60 * 1000;
    then = now + (workTimer);
    timerText.textContent = sessionLength + ":00";
    wasPaused = false;
}

function handleControls(e) {
    var clicked = e.target.id; 
    if(clicked == "us") {
        sessionLength++;
        setTimer();
        sessionLbl.textContent = sessionLength;
    } else if(clicked == "ds") {
        sessionLength--;
        setTimer();
        sessionLbl.textContent = sessionLength;
    } else if(clicked == "ub") {
        breakLength++;
        setTimer();
        breakLbl.textContent = breakLength;
    } else if(clicked == "db") {
        breakLength--;
        setTimer();
        breakLbl.textContent = breakLength;
    }
}



function handleTimer() {
    
    if(isPlaying) {
        controls.addEventListener("click", handleControls);
        console.log("Pausing...", isPlaying, timeLeft);
        clearInterval(t);
        isPlaying = false;
        wasSwitched ? wasPaused = false : wasPaused = true;
        playPause.innerHTML = '&#9658;';
    } else {
        controls.removeEventListener("click", handleControls);
        now = new Date().getTime();
        if(wasSwitched) {
            circle.style.strokeDasharray = "0 158";
            wasSwitched = false;
        }

        if(currentSession == "work") {
            currentTimer = workTimer
            circle.style.stroke = "red";
            console.log("Work!!!");
        } else {
            currentTimer = breakTimer;
            circle.style.stroke = "green";
            console.log("Take a break!");
        }

        then = now + (currentTimer);
        console.log("Starting...", isPlaying, timeLeft);
        playPause.innerHTML = '&#10073;&#10073;';
        isPlaying = true;

        t = window.setInterval(function() {
            now = new Date().getTime();

            if(wasPaused) {
                then = now + timeLeft;
                wasPaused = false;
            } else {
                timeLeft = then - now;
            }

            var mins = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            var formattedMins = ("0" + mins).slice(-2);
            var secs = Math.floor((timeLeft % (1000 * 60)) / 1000) + 1;
            var formattedSecs = ("0" + secs).slice(-2);
            console.log(mins, secs);



            percent = (currentTimer - timeLeft) / currentTimer;
            p = percent * totalCircle;
            circle.style.strokeDasharray = p + " 158";
            console.log(p);
            timerText.textContent = formattedMins + ":" + formattedSecs;

            if(mins <= 0 && secs <= 0) {
                timerText.textContent = "End";
                clearInterval(t);
                currentSession == "work" ? currentSession = "break" : currentSession = "work";
                isPlaying = true;
                wasSwitched = true;
                handleTimer();
            }


            }, 1000);
    }
}



playPause.addEventListener("click", function(e) {    
    handleTimer();
});








