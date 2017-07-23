// [x] CHANGE SCALE BASED ON MAX POMODOROS
// [x] STYLE BETTER
// [] GIVE ALARM SOUND OPTIONS
// [x] SAVE SETTINGS/TIMER LENGTHS
// [x] DON'T LET LENGTHS GO LESS THAN 1 (OR MORE THAN 99?)
// [] TIMER FUCKS UP WHEN YOU STOP, NEED TO DETACH FROM SYSTEM TIME

function Timer() {
if(localStorage.sessionLength == undefined) {
    localStorage.sessionLength = 25;
}
if(localStorage.breakLength == undefined) {
    localStorage.breakLength = 5;
}

console.log(localStorage.sessionLength);

var red = "rgb(201, 36, 53)";
var green = "rgb(0, 163, 128)";
var lightgray = "rgb(155, 176, 196)";

var workTimer = localStorage.sessionLength * 60 * 1000;
var breakTimer = localStorage.breakLength * 60 * 1000;

var currentSession = "work";

var percent = .0;
var totalCircle = 158;
var p = percent * totalCircle;
var now, then;

// Set up localStorage completed
var t = new Date();
var today = t.getMonth() + "/" + t.getDate() + "/" + t.getFullYear();
console.log(today);
console.log(localStorage);
var completed = JSON.parse(localStorage.getItem("completed"));
console.log(JSON.parse(localStorage.getItem("completed")));

console.log("completed: ", completed);


// DOM elements
var circle = document.querySelector("#circle-timer");
var timerText = document.querySelector("#timer");
var playPause = document.querySelector("#play-pause");
var controls = document.querySelector("#controls");
var sessionLbl = document.querySelector("#sl");
var breakLbl = document.querySelector("#bl");
var settingsBtn = document.querySelector("#settings-btn");
var settingsPanel = document.querySelector("#settings");
var log = document.querySelector("#log");
var graph = document.querySelector("#graph");

// Alarm sound
var bell = new Audio("https://u7547051.dl.dropboxusercontent.com/u/7547051/assets/pomodoro-timer/346328__isteak__bright-tibetan-bell-ding-b-note-cleaner.wav");

timerText.textContent = localStorage.sessionLength + ":00";
circle.style.strokeDasharray = p + " 158";
sessionLbl.textContent = localStorage.sessionLength;
breakLbl.textContent = localStorage.breakLength;

var timerStarted = false;
var isPlaying = false;

var wasPaused, timeLeft, t, blinker;

var wasSwitched = false;

// Print graph of past pomodoros
function printLog() {
    var ul = document.querySelector("#log ul");
    graph.innerHTML = "";
    var oneDay = (1000 * 60 * 60 * 24);
    var todaysDate = new Date();
    var dates = [];
    
    for(var i = 0; i < 5; i++) {
        var date = new Date(todaysDate - (i * oneDay));
        dates.push(date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear());
    }
    
    console.log("Dates: ", dates);
//    console.log("Completed: ", completed);
//    console.log(Object.values(completed));
    var max = Math.max(...Object.values(completed));
//    console.log(max);

    var days = Object.keys(completed);
    console.log("Days: ", days);
    for(var i = 4; i >= 0; i--) {
        var day = dates[i];
        console.log("Day: ", day);
        
        var cd;
        completed[day] == undefined ? cd = 0 : cd = completed[day];
        console.log(cd);
//        var li = document.createElement("li");
//        li.textContent = day + ": " + completed[day];
//        ul.appendChild(li);
        
        var bar = document.createElement("div");
        var width = (cd / max) * 100;
        bar.classList.add("bar");
        bar.style.width = width + "%";
        var p = document.createElement("span");
        var parsedDay = day.replace(/\/\d{4}/g, "");
        p.textContent = parsedDay;
        p.classList.add("label");
        bar.insertBefore(p, null);
        console.log("Bar: ", bar);
        graph.appendChild(bar);
        console.log(graph);
    };
    
    var yAxis = document.createElement("p");
    var xAxis = document.createElement("p");
    yAxis.textContent = "Date";
    xAxis.textContent = "Pomodoros";
    yAxis.classList.add("y-axis");
    xAxis.classList.add("x-axis");
    graph.appendChild(yAxis);
    graph.appendChild(xAxis);
    
    
}

// Reset timer after changing settings
function setTimer() {
    now = new Date().getTime();
    workTimer =localStorage.sessionLength * 60 * 1000;
    console.log(workTimer);
    breakTimer = localStorage.breakLength * 60 * 1000;
    then = now + (workTimer);
    timerText.textContent =localStorage.sessionLength + ":00";
    wasPaused = false;
}

function blink() {
    blinker = window.setInterval(function() {
        timerText.style.textShadow = timerText.style.textShadow == 'none' ? '0px 0px 25px ' + lightgray : 'none';
    }, 500);
}

function stopAlarm() {
    bell.pause();
    bell.currentTime = 0;
    window.clearInterval(blinker);
    timerText.style.textShadow = 'none';
    
}


function handleControls(e) {
    var clicked = e.target.id; 
    if(clicked == "us") {
        localStorage.sessionLength++;
        setTimer();
        sessionLbl.textContent = localStorage.sessionLength;
    } else if(clicked == "ds") {
        if(localStorage.sessionLength > 1) {
            localStorage.sessionLength--;
            setTimer();
            sessionLbl.textContent = localStorage.sessionLength;
        }
    } else if(clicked == "ub") {
        localStorage.breakLength++;
        setTimer();
        breakLbl.textContent = localStorage.breakLength;
    } else if(clicked == "db") {
        if(localStorage.breakLength > 1) {
            localStorage.breakLength--;
            setTimer();
            breakLbl.textContent = localStorage.breakLength;
        }
        
    }
}

function handleTimer() {
    
    // Check if the timer is already running
    if(isPlaying) {
        controls.addEventListener("click", handleControls);
        console.log("Pausing...", isPlaying, timeLeft);
        clearInterval(t);
        isPlaying = false;
        wasSwitched ? wasPaused = false : wasPaused = true;
        playPause.innerHTML = '&#9658;';
    } else {  // If the timer was paused or not started yet
        controls.removeEventListener("click", handleControls);
        now = new Date().getTime();
        if(wasSwitched) {  // Timer restarted, from session to break or vice versa
            circle.style.strokeDasharray = "0 158";
            wasSwitched = false;
        }

        // Determines which type of timer to start
        if(currentSession == "work") {
            currentTimer = workTimer
            circle.style.stroke = red;
            console.log("Work!!!");
        } else {
            currentTimer = breakTimer;
            circle.style.stroke = green;
            console.log("Take a break!");
        }

        then = now + (currentTimer);
        console.log("Starting...", isPlaying, timeLeft);
        playPause.innerHTML = '&#10073;&#10073;';
        isPlaying = true;

        t = window.setInterval(function() {
            now = new Date().getTime();

            if(wasPaused) {  // if the timer was paused, reload the time left
                then = now + timeLeft;
                wasPaused = false;
            } else {
                timeLeft = then - now;
            }

            var mins = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            var formattedMins = ("0" + mins).slice(-2);
            var secs = Math.floor((timeLeft % (1000 * 60)) / 1000);
            var formattedSecs = ("0" + secs).slice(-2);
            console.log(mins, secs);



            percent = (currentTimer - timeLeft) / currentTimer;
            p = percent * totalCircle;
            circle.style.strokeDasharray = p + " 158";
            console.log(p);
            timerText.textContent = formattedMins + ":" + formattedSecs;

            // Timer runs down
            if(mins <= 0 && secs <= 0) {  
                timerText.textContent = "End";
                
                clearInterval(t);
                bell.play();
                blink();
                
                if(currentSession == "work") {
                    // Keep track of sessions via localStorage
                    if(completed == null) {
                        completed = {}
                    }
                    if(completed[today] != undefined) {
                        completed[today]++;
                    } else {
                        completed[today] = 1;
                    }
                    localStorage.setItem("completed", JSON.stringify(completed));

                    console.log(completed, localStorage);
                    currentSession = "break";
                    printLog();
                } else {
                    currentSession = "work";
                }
                
                isPlaying = true;
                wasSwitched = true;
                
                
                
                handleTimer();
            }


            }, 1000);
    }
}

settingsBtn.addEventListener("click", function(e) {
    if(!settingsPanel.classList.contains("slide-out")) {
        settingsBtn.classList.remove("animate-off");
        settingsBtn.classList.add("animate-on");
        settingsPanel.classList.add("slide-out");
    } else {    
        settingsBtn.classList.remove("animate-on");
        settingsBtn.classList.add("animate-off");
        settingsPanel.classList.remove("slide-out");
    } 
});


playPause.addEventListener("click", function(e) {    
    stopAlarm();
    handleTimer();
});

timerText.addEventListener("click", function() {
    stopAlarm();
    circle.style.strokeDasharray = "0 158";
});


controls.addEventListener("click", handleControls);

printLog();
}

Timer();







