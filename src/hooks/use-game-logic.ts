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
      ...Array.from({ length: 10 }, (_, i) => ({ x: 14, y: i + 5 })),
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
      ...Array.from({ length: 8 }, (_, i) => ({ x: i+6, y: 6 })),
      ...Array.from({ length: 8 }, (_, i) => ({ x: i+6, y: 13 })),
    ]
  }
};

const INITIAL_SNAKE_POSITION = [{ x: 10, y: 10 }];
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

export const useGameLogic = (initialLevel: Level = "easy") => {
  const [level, setLevelState] = useState<Level>(initialLevel);
  const [snake, setSnake] = useState<Coordinates[]>(INITIAL_SNAKE_POSITION);
  const [food, setFood] = useState<Coordinates>({ x: 15, y: 15 });
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
    setSnake(INITIAL_SNAKE_POSITION);
    setDirection(INITIAL_DIRECTION);
    setObstacles(levelConfig.obstacles);
    setFood(generateFood(INITIAL_SNAKE_POSITION, levelConfig.obstacles));
    setSpeed(levelConfig.speed);
    setScore(0);
    setGameOver(false);
    setIsRunning(true);
  }, [generateFood]);
  
  const setLevel = (newLevel: Level) => {
    setLevelState(newLevel);
    resetGame(newLevel);
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key;
    setDirection(prevDirection => {
      if ((key === "ArrowUp" || key.toLowerCase() === 'w') && prevDirection !== "DOWN") return "UP";
      if ((key === "ArrowDown" || key.toLowerCase() === 's') && prevDirection !== "UP") return "DOWN";
      if ((key === "ArrowLeft" || key.toLowerCase() === 'a') && prevDirection !== "RIGHT") return "LEFT";
      if ((key === "ArrowRight" || key.toLowerCase() === 'd') && prevDirection !== "LEFT") return "RIGHT";
      return prevDirection;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const moveSnake = useCallback(() => {
    if (!isRunning) return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };

      switch (direction) {
        case "UP": head.y -= 1; break;
        case "DOWN": head.y += 1; break;
        case "LEFT": head.x -= 1; break;
        case "RIGHT": head.x += 1; break;
      }

      // Wall collision
      if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
        setGameOver(true);
        setIsRunning(false);
        return prevSnake;
      }
      
      // Self collision
      for (const segment of newSnake) {
        if (segment.x === head.x && segment.y === head.y) {
          setGameOver(true);
          setIsRunning(false);
          return prevSnake;
        }
      }

      // Obstacle collision
      for (const obstacle of obstacles) {
        if (obstacle.x === head.x && obstacle.y === head.y) {
          setGameOver(true);
          setIsRunning(false);
          return prevSnake;
        }
      }

      newSnake.unshift(head);
      
      // Food consumption
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        setFood(generateFood(newSnake, obstacles));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food.x, food.y, generateFood, isRunning, obstacles]);

  useInterval(moveSnake, isRunning && !isGameOver ? speed : null);

  const startGame = () => {
    if(!isGameOver) {
      setIsRunning(true);
    } else {
      resetGame(level);
    }
  };
  const pauseGame = () => setIsRunning(false);

  return { boardSize: BOARD_SIZE, snake, food, obstacles, score, level, setLevel, isGameOver, isRunning, startGame, pauseGame, resetGame, direction };
};
