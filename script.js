const playerBox = document.getElementById("player-box");
const wrapper = document.getElementById("wrapper");
const container = document.getElementById("container");
const startBtn = document.getElementById("start-btn");
const score = document.getElementById("score");
const highScoreContent = document.getElementById("high-score");
const menuWindow = document.getElementById("menu");
const diffBtnForm = document.getElementById("diff-btn-form");
const diffButtons = diffBtnForm.querySelectorAll("input[type=radio]");

let startTImeout;
let spawnFallBoxInterval;
let isGameOver = false;
let scoreCounter = 0;
let highScore = 0;
updateHighScore();

const movement = {
    moveUp: false,
    moveDown: false,
    moveLeft: false,
    moveRight: false,
};

const keyActions = {
    "w": "moveUp",
    "s": "moveDown",
    "a": "moveLeft",
    "d": "moveRight",
    "ArrowUp": "moveUp",
    "ArrowDown": "moveDown",
    "ArrowLeft": "moveLeft",
    "ArrowRight": "moveRight",
};

// Dimension settings (Adjustable)
const playAreaHeightRatio = 4;     // 4 == 25%
playerBox.style.width = "30px";
playerBox.style.height = "30px";
wrapper.style.width = "600px";
wrapper.style.height = "800px";
//

const wrapperHeight = wrapper.offsetHeight
const wrapperWidth = wrapper.offsetWidth

container.style.height = `${wrapperHeight / playAreaHeightRatio}px`;
container.style.width = `${wrapperWidth}px`;
const containerHeight = container.offsetHeight;
const difference = wrapperHeight - containerHeight;

menuWindow.style.top = `${(difference / 2) - (menuWindow.offsetHeight / 2)}px`
menuWindow.style.left = `${(wrapperWidth / 2) - (menuWindow.offsetWidth / 2)}px`;

const playerBoxHeight = playerBox.offsetHeight;
const playerBoxWidth = playerBox.offsetWidth;
initPlayerPos();

// Speed settings
const playerBoxStep = 10;
const playerMoveInterval = 10;
let fallSpeed = 10;
const fallSpeedUpdateInterval = 10;
let fallSpawnRate = 200;

diffBtnForm.addEventListener("change", (e) => {
    switch(e.target.value) {
        case "easy":
            fallSpawnRate = 250;
            fallSpeed = 5
            break;
        case "medium":
            fallSpawnRate = 200;
            fallSpeed =  10;
            break
        case "hard":
            fallSpawnRate = 150;
            fallSpeed = 15;
            break
    };
});

function initPlayerPos() {
    playerBox.style.top = `${wrapperHeight - playerBoxHeight}px`;
    playerBox.style.left = `${(wrapperWidth / 2) - (playerBoxWidth / 2)}px`;
};

startBtn.addEventListener("click", () => {
    hideMenu(true);
    disableMenuButtons(true)
    hideCursor(true);
    startTImeout = setTimeout(() => {
        startGame(); 
    }, 500);
});

function handleEventKeys(event) {
    event.preventDefault();
    // if (event.key === " ") {
    //     if (!isGameOver) gameOver();
    //     console.log("check key");
    //     startGame();
    // }
    if (!isGameOver) {
        movement[keyActions[event.key]] = (event.type === "keydown");
    };
}
window.addEventListener("keydown", handleEventKeys);
window.addEventListener("keyup", handleEventKeys);

function startGame() {
    scoreCounter = 0;
    score.textContent = `Score: 0`;

    console.log("start game");

    isGameOver = false;
    removePreviousBoxes();
    initPlayerPos();

    const spawnFallBoxInterval = setInterval(() => {
        if (!(isGameOver)) {
            spawnFallingBoxes();
        }
        else clearInterval(spawnFallBoxInterval);
    }, fallSpawnRate)

    requestAnimationFrame(movePlayer);

};

const hideCursor = (bool) => {
    if (bool) {
        wrapper.style.cursor = "none";
        startBtn.style.cursor = "none";
        diffButtons.forEach(btn => btn.style.cursor = "none");
    } else {
        wrapper.style.cursor = "default";
        startBtn.style.cursor = "pointer";
        diffButtons.forEach(btn => btn.style.cursor = "pointer");
    };
}

const hideMenu = (bool) => {
    if (bool) {
        menuWindow.classList.remove("fadeIn")
        menuWindow.classList.add("fadeOut");
        menuWindow.style.opacity = "0"
    } else {
        menuWindow.classList.remove("fadeOut");
        menuWindow.classList.add("fadeIn");
        menuWindow.style.opacity = "100";
    }
}

const disableMenuButtons = (bool) => {
    startBtn.disabled = bool;
    diffButtons.forEach(button => button.disabled = bool);
}

function movePlayer() {
    const playerBoxTop = playerBox.offsetTop;
    const playerBoxLeft = playerBox.offsetLeft;
    
    if (movement["moveUp"]) {
        if (playerBoxTop - playerBoxStep < difference) playerBox.style.top = `${difference}px`;
        else playerBox.style.top = `${playerBoxTop - playerBoxStep}px`;
    };
    if (movement["moveDown"]) {
        if (playerBoxTop > (wrapperHeight - playerBoxHeight - playerBoxStep)) playerBox.style.top = `${wrapperHeight - playerBoxHeight}px`;
        else playerBox.style.top = `${playerBoxTop + playerBoxStep}px`;
    };
    if (movement["moveLeft"]) {
        if (playerBoxLeft - playerBoxStep < 0) playerBox.style.left = "0px";
        else playerBox.style.left = `${playerBoxLeft - playerBoxStep}px`;
    };
    if (movement["moveRight"]) {
        if (playerBoxLeft > (wrapperWidth - playerBoxWidth - playerBoxStep)) playerBox.style.left = `${container.offsetWidth - playerBoxWidth}px`;
        else playerBox.style.left = `${playerBoxLeft + playerBoxStep}px`;
    };
    if (!isGameOver) requestAnimationFrame(movePlayer);
};

function spawnFallingBoxes () {
    const fallingBox = document.createElement("div");

    fallingBox.classList.add("falling-box");
    fallingBox.style.backgroundColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`
    wrapper.append(fallingBox)
    
    fallingBox.style.top = `${0 - fallingBox.offsetHeight}px`
    fallingBox.style.left = `${Math.floor(Math.random() * (wrapper.offsetWidth - fallingBox.offsetWidth))}px`

    if (!isGameOver) requestAnimationFrame(() => moveFallingBox(fallingBox));
};

function moveFallingBox(fallingBox) {
    if (fallingBox.offsetTop < wrapper.offsetHeight) {
        if (checkCollision(fallingBox)) gameOver();
        else if (!isGameOver) {
            fallingBox.style.top = `${fallingBox.offsetTop + fallSpeed}px`
            requestAnimationFrame(() => moveFallingBox(fallingBox));
        }
    }
    else {
        fallingBox.remove();
        updateScore();
    }
}

function checkCollision (fallingBox) {
    const checkTop = () => playerBox.offsetTop < (fallingBox.offsetTop + fallingBox.offsetHeight);
    const checkBottom = () => (playerBox.offsetTop + playerBoxHeight) > fallingBox.offsetTop;
    const checkLeft = () => playerBox.offsetLeft < (fallingBox.offsetLeft + fallingBox.offsetWidth);
    const checkRight = () => (playerBox.offsetLeft + playerBox.offsetWidth) > fallingBox.offsetLeft;

    if (checkTop() && checkBottom() && checkLeft() && checkRight()) return true;
    else return false;
};

function updateScore() {
    scoreCounter += 1;
    score.textContent = `Score: ${scoreCounter}`;
};

function updateHighScore() {
    let retrievedHighScore = localStorage.getItem("highscore");
    if (retrievedHighScore) highScore = JSON.parse(retrievedHighScore);
    if (scoreCounter > highScore) {
        highScore = scoreCounter;
        localStorage.setItem("highscore", highScore); 
    };
    highScoreContent.textContent = `High Score: ${highScore}` 
};

function removePreviousBoxes() {
    let previousBoxes = document.querySelectorAll(".falling-box");
    previousBoxes.forEach((box) => box.remove());
    previousBoxes = []
};

function gameOver() {
    hideMenu(false);
    disableMenuButtons(false)
    hideCursor(false);

    console.log("gameover");

    clearInterval(spawnFallBoxInterval);
    clearTimeout(startTImeout)

    isGameOver = true;
    for (let key in movement) movement[key] = false;

    updateHighScore();
};