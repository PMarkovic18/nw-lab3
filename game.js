// Postavke canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 810;
canvas.height = 600;

// Varijable za igru
let isGameRunning = true; // Traje li igra trenutno
let gameFail = false; // Prati stanje (pobjeda ili ne)
let score = 0; // Trenutni rezultat
let bestScore = parseInt(localStorage.getItem('bestScore')) || 0; // Najbolji rezultat iz local storage


// Postavke palice
const paddle = {
    width: 100,
    height: 20,
    x: (canvas.width - 100) / 2,
    y: canvas.height - 30,
    speed: 7,
    dx: 0,
};

// Postavke loptice
const ball = {
    x: canvas.width / 2,
    y: canvas.height - 40,
    radius: 10,
    speed: 2,
    dx: Math.random() < 0.5 ? 4 : -4, // Nasumicni smijer kretanja
    dy: -2, // Na pocetku prema gore
};

// Postavke cigli
const brick = {
    rowCount: 5,
    columnCount: 7,
    width: 90,
    height: 20,
    padding: 10,
    offsetTop: 70,
    offsetLeft: 60,
};

let bricks = []; // Lista svih cigli

// Inicijalizacije cigli
for (let row = 0; row < brick.rowCount; row++) {
    bricks[row] = [];
    for (let col = 0; col < brick.columnCount; col++) {
        bricks[row][col] = { x: 0, y: 0, visible: true }; // Pozicija i stanje unistenosti
    }
}

// Crtanje palice
function drawPaddle() {
    // Sjencanje ruba
    ctx.shadowColor = '#ff4d4d';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    // Ispunjavanje palice
    ctx.fillStyle = 'red';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    // Reset sjencanja ruba
    ctx.shadowColor = 'rgba(0, 0, 0, 0)';
}

// Crtanje loptice
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'blue';
    ctx.fill();
    ctx.closePath();
}

// Crtanje cigli
function drawBricks() {
    bricks.forEach((row, rowIndex) => {
        row.forEach((brickElement, colIndex) => {
            if (brickElement.visible) { // Ako cigla nije unistena
                const brickX = colIndex * (brick.width + brick.padding) + brick.offsetLeft;
                const brickY = rowIndex * (brick.height + brick.padding) + brick.offsetTop;
                brickElement.x = brickX;
                brickElement.y = brickY;

                // Sjencanje ruba
                ctx.shadowColor = '#66ff66';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 3;
                ctx.shadowOffsetY = 3;

                // ispunjavanje cigle
                ctx.fillStyle = 'green';
                ctx.fillRect(brickX, brickY, brick.width, brick.height);

                // Reset sjencanja ruba
                ctx.shadowColor = 'rgba(0, 0, 0, 0)';

            }
        });
    });
}

// Crtanje rezultata
function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Score: ${score}`, canvas.width - 20, 30);
    ctx.fillText(`Best: ${bestScore}`, canvas.width - 20, 60);
}

// Crtanje GAME OVER ili GAME WIN teksta
function drawEndMessage(message) {
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

// Crtanje svega
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPaddle();
    drawBall();
    drawBricks();
}

// Pomak palice
function movePaddle() {
    paddle.x += paddle.dx; //Pomak za dx
    if (paddle.x < 0) paddle.x = 0; // Rub igre
    if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width; //Rub igre
}

// pomak loptice
function moveBall() {
    // Pomak za dx i dy
    ball.x += ball.dx;
    ball.y += ball.dy;

    // kolizije sa zidom
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) ball.dx *= -1;
    if (ball.y - ball.radius < 0) ball.dy *= -1;

    // Kolizije sa palicom
    if (
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width &&
        ball.y + ball.radius > paddle.y
    ) {
        ball.dy = -ball.speed;
    }

    // Kolizije sa ciglom
    bricks.forEach(row => {
        row.forEach(brickElement => {
            if (brickElement.visible) {
                if (
                    ball.x > brickElement.x &&
                    ball.x < brickElement.x + brick.width &&
                    ball.y - ball.radius > brickElement.y &&
                    ball.y - ball.radius < brickElement.y + brick.height
                ) {
                    ball.dy *= -1; //Promjena smjera loptice
                    brickElement.visible = false; // Unistenje cigle
                    score++; // Povecanje trenutnog rezultata
                }
            }

        });
    });

    // Kolizija sa podom
    if (ball.y + ball.radius > canvas.height) {
        isGameRunning = false; // Igra vise ne traje
        gameFail = true; // Poraz
        // Najbolji rezultat u local storage
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('bestScore', bestScore);
        }
    }
}


// Provjera pobjede (kraja igre)
function checkWinCondition() {
    let allBricksDestroyed = true;
    bricks.forEach(row => {
        row.forEach(brick => {
            if (brick.visible) {
                allBricksDestroyed = false;
            }
        });
    });

    if (allBricksDestroyed) {
        isGameRunning = false; // Igra vise ne traje
        // gameFail je inicijaliziran na false pa nema potrebe dodavati ovjde
    }

    // Najbolji rezultat u local storage
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore); // Save best score
    }
}




// Update petlja koja ce se vrtiti sve dok igra traje
function update() {
    // Ako igra ne traje vise, ispisati odgovarajucu poruku
    if (!isGameRunning) {
        if (gameFail) {
            drawEndMessage('GAME OVER');
        } else {
            drawEndMessage('GAME WIN');
        }
        return;
    }

    //Pomaci
    movePaddle();
    moveBall();

    //Iscrtavanja
    draw();
    drawScore();

    //Provjera pobjede
    checkWinCondition();

    //Petlja
    requestAnimationFrame(update);
}

// Upravljanje uz pomoc tipkovnice
document.addEventListener('keydown', e => { // Postaviti dx 
    if (e.key === 'ArrowRight') paddle.dx = paddle.speed;
    if (e.key === 'ArrowLeft') paddle.dx = -paddle.speed;
});
document.addEventListener('keyup', e => { // Gumb vise nije pritisnut 
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') paddle.dx = 0;
});

// Pocetak igre
update();