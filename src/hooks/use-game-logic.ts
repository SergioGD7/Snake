
"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// Types
export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
export type Coordinates = { x: number; y: number };
export type Level = "easy" | "medium" | "hard" | "expert";

// Constants
const BOARD_SIZE = 30;

const LEVELS: Record<Level, { speed: number; obstacles: Coordinates[] }> = {
  easy: { speed: 200, obstacles: [] },
  medium: {
    speed: 150,
    obstacles: [
      ...Array.from({ length: 10 }, (_, i) => ({ x: 5, y: i + 5 })),
      ...Array.from({ length: 10 }, (_, i) => ({ x: 24, y: i + 15 })),
    ],
  },
  hard: {
    speed: 100,
    obstacles: [
      ...Array.from({ length: BOARD_SIZE }, (_, i) => ({ x: i, y: 0 })),
      ...Array.from({ length: BOARD_SIZE }, (_, i) => ({ x: i, y: BOARD_SIZE - 1 })),
      ...Array.from({ length: BOARD_SIZE }, (_, i) => ({ x: 0, y: i })),
      ...Array.from({ length: BOARD_SIZE }, (_, i) => ({ x: BOARD_SIZE - 1, y: i })),
    ],
  },
  expert: {
    speed: 70,
    obstacles: [
      ...Array.from({ length: BOARD_SIZE }, (_, i) => ({ x: i, y: 0 })),
      ...Array.from({ length: BOARD_SIZE }, (_, i) => ({ x: i, y: BOARD_SIZE - 1 })),
      ...Array.from({ length: BOARD_SIZE }, (_, i) => ({ x: 0, y: i })),
      ...Array.from({ length: BOARD_SIZE }, (_, i) => ({ x: BOARD_SIZE - 1, y: i })),
      ...Array.from({ length: 15 }, (_, i) => ({ x: i+8, y: 8 })),
      ...Array.from({ length: 15 }, (_, i) => ({ x: i+8, y: 22 })),
    ]
  }
};

const INITIAL_SNAKE_POSITION = [{ x: 15, y: 15 }];
const INITIAL_DIRECTION: Direction = "RIGHT";

// Custom hook for intervals
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const saveScore = (score: number) => {
    if (typeof window === 'undefined') return;
    try {
        const scoresRaw = localStorage.getItem('snakeScores');
        const scores = scoresRaw ? JSON.parse(scoresRaw) : [];
        if (score > 0) {
            scores.push(score);
        }
        scores.sort((a: number, b: number) => b - a);
        localStorage.setItem('snakeScores', JSON.stringify(scores.slice(0, 10)));
    } catch (e) {
        console.error("Failed to save score:", e);
    }
};

export const useGameLogic = (initialLevel: Level = "easy") => {
  const [level, setLevelState] = useState<Level>(initialLevel);
  const [snake, setSnake] = useState<Coordinates[]>(INITIAL_SNAKE_POSITION);
  const [food, setFood] = useState<Coordinates>({ x: 20, y: 15 });
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [speed, setSpeed] = useState<number | null>(LEVELS[level].speed);
  const [obstacles, setObstacles] = useState<Coordinates[]>(LEVELS[level].obstacles);
  const [score, setScore] = useState(0);
  const [isGameOver, setGameOver] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const generateFood = useCallback((snakeBody: Coordinates[], currentObstacles: Coordinates[]) => {
    while (true) {
      const newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE),
      };
      if (!snakeBody.some(seg => seg.x === newFood.x && seg.y === newFood.y) && !currentObstacles.some(obs => obs.x === newFood.x && obs.y === newFood.y)) {
        return newFood;
      }
    }
  }, []);

  const resetGame = useCallback((newLevel: Level) => {
    const levelConfig = LEVELS[newLevel];
    setLevelState(newLevel);
    setSnake(INITIAL_SNAKE_POSITION);
    setDirection(INITIAL_DIRECTION);
    setObstacles(levelConfig.obstacles);
    setFood(generateFood(INITIAL_SNAKE_POSITION, levelConfig.obstacles));
    setSpeed(levelConfig.speed);
    setScore(0);
    setGameOver(false);
    setIsRunning(false);
  }, [generateFood]);
  
  const setLevel = (newLevel: Level) => {
    resetGame(newLevel);
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key;
    if (key === ' ' && !isGameOver) {
        e.preventDefault();
        setIsRunning(prev => !prev);
    }
    setDirection(prevDirection => {
      if ((key === "ArrowUp" || key.toLowerCase() === 'w') && prevDirection !== "DOWN") return "UP";
      if ((key === "ArrowDown" || key.toLowerCase() === 's') && prevDirection !== "UP") return "DOWN";
      if ((key === "ArrowLeft" || key.toLowerCase() === 'a') && prevDirection !== "RIGHT") return "LEFT";
      if ((key === "ArrowRight" || key.toLowerCase() === 'd') && prevDirection !== "LEFT") return "RIGHT";
      return prevDirection;
    });
  }, [isGameOver]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const moveSnake = useCallback(() => {
    if (!isRunning) return;

    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };

      switch (direction) {
        case "UP": head.y -= 1; break;
        case "DOWN": head.y += 1; break;
        case "LEFT": head.x -= 1; break;
        case "RIGHT": head.x += 1; break;
      }

      const isCollision = 
        head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE || // Wall collision
        prevSnake.some(segment => segment.x === head.x && segment.y === head.y) || // Self collision
        obstacles.some(obstacle => obstacle.x === head.x && obstacle.y === head.y); // Obstacle collision
      
      if (isCollision) {
        setGameOver(true);
        setIsRunning(false);
        saveScore(score);
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];
      
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10 * (Object.keys(LEVELS).indexOf(level) + 1));
        setFood(generateFood(newSnake, obstacles));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food.x, food.y, generateFood, isRunning, obstacles, score, level]);

  useInterval(moveSnake, isRunning && !isGameOver ? speed : null);

  const startGame = () => {
    if (isGameOver) {
        resetGame(level);
    }
    setIsRunning(true);
  };
  const pauseGame = () => setIsRunning(false);

  return { boardSize: BOARD_SIZE, snake, food, obstacles, score, level, setLevel, isGameOver, isRunning, startGame, pauseGame, resetGame, direction, speed };
};
