// index.js

import EnemyController from "./EnemyController.js";
import Player from "./Player.js";
import BulletController from "./BulletController.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 600;

const background = new Image();
background.src = "download.jpg";

const playerBulletController = new BulletController(canvas, 10, "red", true);
const enemyBulletController = new BulletController(canvas, 4, "white", false);
let currentRound = 1; // Initialize the round counter.
let score = 0; // Initialize the score.
let bestScore = 0; // Initialize the best score.

const loseMusic = new Audio("Arcade game over sound effect!.mp3"); // Replace with your "You Lose" music file
const backgroundMusic = new Audio("Space Invaders - Space Invaders.mp3"); // Replace with your background game music file

let isGameOver = false;
let didWin = false;

let enemiesResetThisRound = false; // Add this flag

function startNewRound() {
  isGameOver = false;
  didWin = false;

  // Reset enemies only if they haven't been reset in this round yet
  if (!enemiesResetThisRound) {
    enemyController.createEnemies();
    enemiesResetThisRound = true; // Set the flag to true after resetting enemies
  }

  player.x = canvas.width / 2;
}

function increaseRound() {
  currentRound++;
  enemiesResetThisRound = false; // Reset the flag for the new round
  // Update enemy difficulty or any other logic for increasing difficulty.
  // You can adjust the difficulty based on the currentRound value.
  // For example, you can modify enemyMap or other properties.
}

const enemyController = new EnemyController(
  canvas,
  enemyBulletController,
  playerBulletController,
  increaseRound // Pass the function to the EnemyController.
);

const player = new Player(canvas, 3, playerBulletController);

// Start playing the background music when the game starts
backgroundMusic.loop = true;
backgroundMusic.play();

// Event listener for the restart button
const restartButton = document.getElementById("restartButton"); // Assuming you have a button with id="restartButton" in your HTML

restartButton.addEventListener("click", restartGame);

function restartGame() {
  // Reset all game variables and start a new game
  currentRound = 1;
  score = 0;
  isGameOver = false;
  didWin = false;

  // Stop the "You Lose" music
  loseMusic.pause();
  loseMusic.currentTime = 0;

  // Start playing the background music again
  backgroundMusic.loop = true;
  backgroundMusic.play();

  // Reset game state for a new round
  startNewRound();
}

function game() {
  if (!isGameOver) {
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    displayScoreAndRound();
    enemyController.draw(ctx);
    player.draw(ctx);
    playerBulletController.draw(ctx);
    enemyBulletController.draw(ctx);

    // Check if all enemies are defeated to declare a win
    const allEnemiesDefeated = enemyController.enemyRows.every(
      (enemyRow) => enemyRow.length === 0
    );

    if (allEnemiesDefeated) {
      // Continue to the next round when the player wins
      didWin = true;
      increaseRound(); // This will increment the round without starting a new round immediately
      startNewRound(); // Start a new round after incrementing the round
      return; // Exit the function to prevent further processing in the current frame
    }

    // Check if player is hit by enemy bullet or enemy
    if (
      enemyBulletController.collideWith(player) ||
      enemyController.collideWith(player)
    ) {
      isGameOver = true;
      didWin = false;
    }

    // Check if a player bullet hits an enemy and increase the score.
    enemyController.enemyRows.forEach((enemyRow) => {
      enemyRow.forEach((enemy, enemyIndex) => {
        if (playerBulletController.collideWith(enemy)) {
          score += 10; // Increase the score for each enemy killed.
          enemyRow.splice(enemyIndex, 1);
        }
      });
    });

    // Call checkGameOver to handle game over conditions
    checkGameOver();
  } else {
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    displayRecap();
  }
}

function displayScoreAndRound() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);
  ctx.fillText("Round: " + currentRound, canvas.width - 100, 30);
}

function displayRecap() {
  let text = "Game Over";
  let textOffset = 5;

  ctx.fillStyle = "white";
  ctx.font = "70px Arial";
  ctx.fillText(text, canvas.width / textOffset, canvas.height / 2);

  // Display final score and rounds achieved
  ctx.font = "20px Arial";
  ctx.fillText(
    "Final Score: " + score,
    canvas.width / 2 - 70,
    canvas.height / 2 + 50
  );

  // Update the display to show the most recent round achieved
  ctx.fillText(
    "Rounds Achieved: " + currentRound, // Update this line to use currentRound
    canvas.width / 2 - 90,
    canvas.height / 2 + 80
  );

  // Display user info in the HTML
  const userInfo = document.getElementById("user-info");
  if (userInfo) {
    userInfo.innerHTML = `<p>Final Score: ${score}</p><p>Rounds Achieved: ${currentRound}</p>`;
  }
}

function checkGameOver() {
  if (!isGameOver) {
    // Check if enemies have reached the bottom to declare a loss
    const enemiesReachedBottom = enemyController.enemyRows.some((enemyRow) =>
      enemyRow.some((enemy) => enemy.y + enemy.height >= canvas.height)
    );

    if (enemiesReachedBottom) {
      didWin = false;
      isGameOver = true;
      // Stop the background music when the player loses
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
      // Play "You Lose" music when the player loses
      if (!loseMusic.paused) {
        loseMusic.currentTime = 0;
        loseMusic.play();
      }
    } else {
      // Check if player is hit by enemy bullet or enemy
      if (
        enemyBulletController.collideWith(player) ||
        enemyController.collideWith(player)
      ) {
        isGameOver = true;
        didWin = false;
        // Stop the background music when the player loses
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        // Play "You Lose" music when the player loses
        if (!loseMusic.paused) {
          loseMusic.currentTime = 0;
          loseMusic.play();
        }
      }

      // Check if a player bullet hits an enemy and increase the score.
      enemyController.enemyRows.forEach((enemyRow) => {
        enemyRow.forEach((enemy, enemyIndex) => {
          if (playerBulletController.collideWith(enemy)) {
            score += 10; // Increase the score for each enemy killed.
            enemyRow.splice(enemyIndex, 1);
          }
        });
      });
    }
  }
}

// ... (remaining code)

setInterval(game, 1000 / 60);
