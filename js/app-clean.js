

function timer() {
    
Notification.requestPermission();
    
if(localStorage.sessionLength == undefined) {
    localStorage.sessionLength = 25;
}
if(localStorage.breakLength == undefined) {
    localStorage.breakLength = 5;
}
if(localStorage.longBreakLength== undefined) {
    localStorage.longBreakLength = 15;
}




var red = "rgb(255, 69, 0)";
var green = "rgb(20, 204, 65)";
var tan = "rgb(229, 171, 96)";

var workTimer = localStorage.sessionLength * 60;
var breakTimer = localStorage.breakLength * 60;
var longBreakTimer = localStorage.longBreakLength * 60;

var currentTimer = workTimer;

// Fast timers for debugging
//workTimer = 3;
//breakTimer = 3;
//longBreakTimer = 10;

var currentSession = "work";

var percent = .0;
var totalCircle = 158;
var p = percent * totalCircle;
var now, then;



var completed = JSON.parse(localStorage.getItem("completed"));

if(completed == null) {
    completed = {}
}




// DOM elements
var circle = document.querySelector("#circle-timer");
var timerText = document.querySelector("#timer");
var playPause = document.querySelector("#play-pause");
var rewind = document.querySelector("#rewind");
var skip = document.querySelector("#skip");
var controls = document.querySelector("#controls");
var sessionLbl = document.querySelector("#sl");
var breakLbl = document.querySelector("#bl");
var longBreakLbl = document.querySelector("#lbl");
var settingsBtn = document.querySelector("#settings-btn");
var settingsPanel = document.querySelector("#settings");
var log = document.querySelector("#log");
var graph = document.querySelector("#graph");
var volume = document.querySelector("#volume");
var speaker = document.querySelector("#vol-symbol");

// Alarm sound
var bell = new Audio("bell.wav");
    


timerText.textContent = localStorage.sessionLength + ":00";
circle.style.strokeDasharray = p + " 158";
sessionLbl.textContent = localStorage.sessionLength;
breakLbl.textContent = localStorage.breakLength;
longBreakLbl.textContent = localStorage.longBreakLength;

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
        dates.push(date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear());
    }
    
//    
//    
//    
    var max = Math.max(...Object.values(completed));
    if(max <= 12) max = 12;
//    

    var days = Object.keys(completed);
//    
    for(var i = 4; i >= 0; i--) {
        var day = dates[i];
//        
        
        var cd;
        completed[day] == undefined ? cd = 0 : cd = completed[day];
//        
//        var li = document.createElement("li");
//        li.textContent = day + ": " + completed[day];
//        ul.appendChild(li);
        
        var bar = document.createElement("div");
        bar.title = cd;
        var width = (cd / max) * 100;
        bar.classList.add("bar");
        bar.style.width = width + "%";
        var p = document.createElement("span");
        var parsedDay = day.replace(/\/\d{4}/g, "");
        p.textContent = parsedDay;
        p.classList.add("label");
        bar.insertBefore(p, null);
//        
        graph.appendChild(bar);
//        
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
    workTimer = localStorage.sessionLength * 60;
//    
    breakTimer = localStorage.breakLength * 60;
    longBreakTimer = localStorage.longBreakLength * 60; 
    
//    var mins = Math.floor((timeLeft % (60 * 60)) / (60));
//    var formattedMins = ("0" + mins).slice(-2);
    var formattedMins;
    
    if(currentSession == "work") {
        formattedMins = ("0" + localStorage.sessionLength).slice(-2);
    } else if(currentSession == "break") { 
        formattedMins = ("0" + localStorage.breakLength).slice(-2);
    } else { 
        formattedMins = ("0" + localStorage.longBreakLength).slice(-2);
    }
    
    timerText.textContent = formattedMins + ":00";
    
    wasPaused = false;
}

function blink() {
    if (Notification.permission === "granted") {
    // If it's okay let's create a notification
        var notification = new Notification(currentSession.charAt(0).toUpperCase() + currentSession.slice(1) + " session over.");
    }
    blinker = window.setInterval(function() {
        timerText.style.textShadow = timerText.style.textShadow == 'none' ? '0px 0px 25px ' + tan : 'none';
    }, 500);
    timerText.style.cursor = "pointer";
}

function stopAlarm() {
    bell.pause();
    bell.currentTime = 0;
    window.clearInterval(blinker);
    timerText.style.textShadow = 'none';
    timerText.style.cursor = "auto";
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
    } else if(clicked == "lub") {
        localStorage.longBreakLength++;
        setTimer();
        longBreakLbl.textContent = localStorage.longBreakLength;
    } else if(clicked == "ldb") {
        if(localStorage.longBreakLength > 1) {
            localStorage.longBreakLength--;
            setTimer();
            longBreakLbl.textContent = localStorage.longBreakLength;
        }
    }
}
    
function switchTimer(wasSkipped) {
    timerText.textContent = "End";
                
    clearInterval(t);
    if(!wasSkipped) {
        bell.play();
        blink();
    }
    
    // Set up localStorage completed
    var t = new Date();
    var today = t.getMonth()+1 + "/" + t.getDate() + "/" + t.getFullYear();
    


    if(currentSession == "work") {
        // Keep track of sessions via localStorage
        if(!wasSkipped) {
            
            if(completed[today] != undefined) {
                completed[today]++;
            } else {
                completed[today] = 1;
            }
            localStorage.setItem("completed", JSON.stringify(completed));
            
            printLog();
        }
        
        if(completed[today] % 4 == 0) {
            currentSession = "longbreak";
        } else {
            currentSession = "break";
        }
        
        
    } else {
        currentSession = "work";
    }

    isPlaying = true;
    wasSwitched = true;



    handleTimer();
}

function handleTimer() {
    
    // Check if the timer is already running
    if(isPlaying) {
        controls.addEventListener("click", handleControls);
        
        clearInterval(t);
        isPlaying = false;
        wasSwitched ? wasPaused = false : wasPaused = true;
        playPause.innerHTML = '&#9658;';
    } else {  // If the timer was paused or not started yet
        controls.removeEventListener("click", handleControls);
        clearInterval(t);  
//        now = new Date().getTime();
        if(wasSwitched) {  // Timer restarted, from session to break or vice versa
            circle.style.strokeDasharray = "0 158";
            wasSwitched = false;
        }

        // Determines which type of timer to start
        if(currentSession == "work") {
            currentTimer = workTimer
            circle.style.stroke = red;
            
        } else if(currentSession == "break") {
            currentTimer = breakTimer;
            circle.style.stroke = green;
            
        } else {
            currentTimer = longBreakTimer;
            circle.style.stroke = green;
            
        }

//        then = now + (currentTimer);
        
        playPause.innerHTML = '&#10073;&#10073;';
        isPlaying = false;

        t = window.setInterval(function() {
            now = new Date().getTime();

//            if(wasPaused) {  // if the timer was paused, reload the time left
////                then = now + timeLeft;
//                wasPaused = false;
//            } else {
//                timeLeft = currentTimer;
//            }

            if(!isPlaying && !wasPaused) timeLeft = currentTimer;
            isPlaying = true;
            
            var mins = Math.floor((timeLeft % (60 * 60)) / (60));
            var formattedMins = ("0" + mins).slice(-2);
            var secs = Math.floor(timeLeft % (60));
            var formattedSecs = ("0" + secs).slice(-2);
            
            


            percent = (currentTimer - timeLeft) / currentTimer;
            p = percent * totalCircle;
            circle.style.strokeDasharray = p + " 158";
            
            timerText.textContent = formattedMins + ":" + formattedSecs;
            
            
            timeLeft--;
            
            
            // Timer runs down
            if(timeLeft < 0) {  
                switchTimer(false);
            }


            }, 1000);
    }
}
    
function handleSettingsCloseClick(e) {
//    
    if(e.target.tagName == "HTML" || e.target.tagName == "BODY") closeSettingsPanel();
}
    
function closeSettingsPanel() {
    settingsBtn.classList.remove("animate-on");
    settingsBtn.classList.add("animate-off");
    settingsPanel.classList.remove("slide-out");
    document.removeEventListener("click", handleSettingsCloseClick);
}

settingsBtn.addEventListener("click", function(e) {
    if(!settingsPanel.classList.contains("slide-out")) {
        settingsBtn.classList.remove("animate-off");
        settingsBtn.classList.add("animate-on");
        settingsPanel.classList.add("slide-out");
        
        document.addEventListener("click", handleSettingsCloseClick);
    } else {    
        closeSettingsPanel();
    } 
});


playPause.addEventListener("click", function(e) {    
    stopAlarm();
    handleTimer();
});
    
rewind.addEventListener("click", function(e) {
    
    timeLeft = currentTimer;
    isPlaying = true;
    if(currentSession == "work") {
        timerText.textContent = ("0" + localStorage.sessionLength).slice(-2) + ":00";
    } else if (currentSession == "break") {
        timerText.textContent = ("0" + localStorage.breakLength).slice(-2) + ":00";
    } else {
        timerText.textContent = ("0" + localStorage.longBreakLength).slice(-2) + ":00";
    }
    circle.style.strokeDasharray = "0 158";
    handleTimer();
});

skip.addEventListener("click", function(e) {
    
    switchTimer(true);
    if(currentSession == "work") {
        timerText.textContent = ("0" + localStorage.sessionLength).slice(-2) + ":00";
    } else if (currentSession == "break") {
        timerText.textContent = ("0" + localStorage.breakLength).slice(-2) + ":00";
    } else {
        timerText.textContent = ("0" + localStorage.longBreakLength).slice(-2) + ":00";
    }
    circle.style.strokeDasharray = "0 158";
});

timerText.addEventListener("click", function() {
    if(!isPlaying && !wasPaused) {
        stopAlarm();
        circle.style.strokeDasharray = "0 158";
        if(currentSession == "work") {
            timerText.textContent = ("0" + localStorage.sessionLength).slice(-2) + ":00";
        } else if (currentSession == "break") {
            timerText.textContent = ("0" + localStorage.breakLength).slice(-2) + ":00";
        } else {
            timerText.textContent = ("0" + localStorage.longBreakLength).slice(-2) + ":00";
        }
    }
    
});
    
volume.addEventListener("change", function() {
    bell.volume = volume.value / 100;
    if(volume.value == 0) speaker.textContent = "volume_mute";
    else if (volume.value < 50) speaker.textContent = "volume_down";
    else speaker.textContent = "volume_up";
});


controls.addEventListener("click", handleControls);
    
document.addEventListener("click", function() {
     
});

printLog();
    
}

timer();







