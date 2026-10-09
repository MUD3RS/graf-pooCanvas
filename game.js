
// CONFIGURACION DEL CANVAS
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// CLASE BALL (PELOTA)
class Ball {
    constructor(x, y, radius, speedX, speedY, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speedX = speedX;
        this.speedY = speedY;
        this.color = color;
    }

    // Dibujar pelota
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    // Movimiento de la pelota
    move() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Colision con borde superior
        if (this.y - this.radius <= 0) {
            this.y = this.radius;
            this.speedY = Math.abs(this.speedY);
        }

        // Colision con borde inferior
        if (this.y + this.radius >= canvas.height) {
            this.y = canvas.height - this.radius;
            this.speedY = -Math.abs(this.speedY);
        }
    }

    // Reiniciar pelota al centro
    reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.speedX = -this.speedX;
    }
}

// CLASE PADDLE (PALETA)
class Paddle {
    constructor(x, y, width, height, isPlayerControlled = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isPlayerControlled = isPlayerControlled;
        this.speed = 5;

        // Colores diferentes para cada paleta
        this.color = isPlayerControlled ? '#00ff88' : '#ff4444';
    }

    // Dibujar paleta
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // Movimiento manual
    move(direction) {
        if (direction === 'up') {
            this.y -= this.speed;
        } else if (direction === 'down') {
            this.y += this.speed;
        }

        // Limitar movimiento dentro del canvas
        this.y = Math.max(
            0,
            Math.min(this.y, canvas.height - this.height)
        );
    }

    // Movimiento automatico de la computadora
    autoMove(ball) {
        const center = this.y + this.height / 2;

        if (ball.y < center) {
            this.y -= this.speed;
        } else if (ball.y > center) {
            this.y += this.speed;
        }

        // Evitar salir del canvas
        this.y = Math.max(
            0,
            Math.min(this.y, canvas.height - this.height)
        );
    }
}

// CLASE GAME (CONTROL DEL JUEGO)
class Game {
    constructor() {

        // Crear cinco pelotas
        this.balls = [
            new Ball(400, 150, 8, 3, 3, '#00ffff'),
            new Ball(400, 250, 12, -4, 3, '#ffff00'),
            new Ball(400, 350, 15, 5, -4, '#ff00ff'),
            new Ball(400, 450, 10, -6, -3, '#ff8800'),
            new Ball(400, 550, 6, 7, -5, '#ffffff')
        ];

        // Paleta del jugador: altura de 200 pixeles
        this.paddle1 = new Paddle(
            0,
            canvas.height / 2 - 100,
            10,
            200,
            true
        );

        // Paleta de la computadora: altura de 100 pixeles
        this.paddle2 = new Paddle(
            canvas.width - 10,
            canvas.height / 2 - 50,
            10,
            100,
            false
        );

        // Registro de teclas
        this.keys = {};
    }

    // Dibujar todos los elementos
    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dibujar las cinco pelotas
        this.balls.forEach(ball => {
            ball.draw();
        });

        // Dibujar paletas
        this.paddle1.draw();
        this.paddle2.draw();
    }

    // Actualizar el videojuego
    update() {

        // Movimiento de la paleta del jugador
        if (this.keys['ArrowUp']) {
            this.paddle1.move('up');
        }

        if (this.keys['ArrowDown']) {
            this.paddle1.move('down');
        }

        // La computadora sigue la pelota mas a la derecha
        const targetBall = this.balls.reduce((closest, ball) => {
            return ball.x > closest.x ? ball : closest;
        });

        this.paddle2.autoMove(targetBall);

        // Actualizar cada pelota
        this.balls.forEach(ball => {

            // Mover pelota
            ball.move();

            // COLISION CON PALETA DEL JUGADOR
            if (
                ball.speedX < 0 &&
                ball.x - ball.radius <=
                    this.paddle1.x + this.paddle1.width &&
                ball.x + ball.radius >= this.paddle1.x &&
                ball.y + ball.radius >= this.paddle1.y &&
                ball.y - ball.radius <=
                    this.paddle1.y + this.paddle1.height
            ) {
                // Corregir posicion y cambiar direccion
                ball.x = this.paddle1.x +
                         this.paddle1.width + ball.radius;

                ball.speedX = Math.abs(ball.speedX);
            }

            // COLISION CON PALETA DE LA COMPUTADORA
            if (
                ball.speedX > 0 &&
                ball.x + ball.radius >= this.paddle2.x &&
                ball.x - ball.radius <=
                    this.paddle2.x + this.paddle2.width &&
                ball.y + ball.radius >= this.paddle2.y &&
                ball.y - ball.radius <=
                    this.paddle2.y + this.paddle2.height
            ) {
                // Corregir posicion y cambiar direccion
                ball.x = this.paddle2.x - ball.radius;

                ball.speedX = -Math.abs(ball.speedX);
            }

            // Reiniciar pelota al salir del tablero
            if (
                ball.x + ball.radius < 0 ||
                ball.x - ball.radius > canvas.width
            ) {
                ball.reset();
            }
        });
    }

    // Capturar controles del teclado
    handleInput() {
        window.addEventListener('keydown', (event) => {

            if (
                event.key === 'ArrowUp' ||
                event.key === 'ArrowDown'
            ) {
                event.preventDefault();
            }

            this.keys[event.key] = true;
        });

        window.addEventListener('keyup', (event) => {
            this.keys[event.key] = false;
        });

        window.addEventListener('blur', () => {
            this.keys = {};
        });
    }

    // Ejecutar videojuego
    run() {
        this.handleInput();

        const gameLoop = () => {
            this.update();
            this.draw();

            requestAnimationFrame(gameLoop);
        };

        gameLoop();
    }
}

// CREAR Y EJECUTAR EL JUEGO
const game = new Game();
game.run();
