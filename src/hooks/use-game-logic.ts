
"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// Types
export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
export type Coordinates = { x: number; y: number };
export type Level = "easy" | "medium" | "hard" | "expert";

// Constants
const BOARD_SIZE = 30;
const INITIAL_SNAKE_POSITION = [{ x: 15, y: 15 }];
const INITIAL_DIRECTION: Direction = "RIGHT";

const LEVEL_CONFIG: Record<Level, { speed: number }> = {
  easy: { speed: 200 },
  medium: { speed: 150 },
  hard: { speed: 100 },
  expert: { speed: 70 },
};

const generateObstacles = (level: Level, boardSize: number): Coordinates[] => {
  const obstacles: Coordinates[] = [];
  const initialSnakePos = {x: 15, y: 15};

  const addWall = (x: number, y: number, length: number, dir: 'horizontal' | 'vertical') => {
    for (let i = 0; i < length; i++) {
      const newObstacle = dir === 'horizontal' ? { x: x + i, y } : { x, y: y + i };
      if (newObstacle.x >= 0 && newObstacle.x < boardSize && newObstacle.y >= 0 && newObstacle.y < boardSize) {
        obstacles.push(newObstacle);
      }
    }
  };

  const isTooCloseToStart = (x: number, y: number, length: number, dir: 'horizontal' | 'vertical') => {
    for (let i = 0; i < length; i++) {
        const ox = dir === 'horizontal' ? x + i : x;
        const oy = dir === 'vertical' ? y + i : y;
        if (Math.abs(ox - initialSnakePos.x) < 5 && Math.abs(oy - initialSnakePos.y) < 5) {
            return true;
        }
    }
    return false;
  };

  switch (level) {
    case 'medium': {
      const wallCount = 2 + Math.floor(Math.random() * 2); // 2 to 3 walls
      for (let i = 0; i < wallCount; i++) {
        const length = 5 + Math.floor(Math.random() * 5);
        const dir = Math.random() > 0.5 ? 'horizontal' : 'vertical';
        let x, y;
        do {
          x = 2 + Math.floor(Math.random() * (boardSize - length - 4));
          y = 2 + Math.floor(Math.random() * (boardSize - length - 4));
        } while (isTooCloseToStart(x, y, length, dir));
        addWall(x, y, length, dir);
      }
      break;
    }
    case 'hard': {
      for (let i = 0; i < boardSize; i++) {
        obstacles.push({ x: i, y: 0 });
        obstacles.push({ x: i, y: boardSize - 1 });
        if (i > 0 && i < boardSize - 1) {
          obstacles.push({ x: 0, y: i });
          obstacles.push({ x: boardSize - 1, y: i });
        }
      }
      const wallCount = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < wallCount; i++) {
        const length = 4 + Math.floor(Math.random() * 4);
        const dir = Math.random() > 0.5 ? 'horizontal' : 'vertical';
        const x = 4 + Math.floor(Math.random() * (boardSize - length - 8));
        const y = 4 + Math.floor(Math.random() * (boardSize - length - 8));
        addWall(x, y, length, dir);
      }
      break;
    }
    case 'expert': {
      for (let i = 0; i < boardSize; i++) {
        obstacles.push({ x: i, y: 0 });
        obstacles.push({ x: i, y: boardSize - 1 });
        if (i > 0 && i < boardSize - 1) {
          obstacles.push({ x: 0, y: i });
          obstacles.push({ x: boardSize - 1, y: i });
        }
      }
      addWall(5, 10, boardSize - 10, 'horizontal');
      addWall(5, 20, boardSize - 10, 'horizontal');
      const gap1 = 5 + Math.floor(Math.random() * (boardSize - 12));
      const gap2 = 5 + Math.floor(Math.random() * (boardSize - 12));
      const idx1 = obstacles.findIndex(o => o.x === gap1 && o.y === 10);
      if(idx1 > -1) obstacles.splice(idx1, 1);
      const idx2 = obstacles.findIndex(o => o.x === gap2 && o.y === 20);
      if(idx2 > -1) obstacles.splice(idx2, 1);
      
      addWall(10, 5, boardSize - 10, 'vertical');
      addWall(20, 5, boardSize - 10, 'vertical');
      const gap3 = 5 + Math.floor(Math.random() * (boardSize - 12));
      const gap4 = 5 + Math.floor(Math.random() * (boardSize - 12));
      const idx3 = obstacles.findIndex(o => o.x === 10 && o.y === gap3);
      if(idx3 > -1) obstacles.splice(idx3, 1);
      const idx4 = obstacles.findIndex(o => o.x === 20 && o.y === gap4);
      if(idx4 > -1) obstacles.splice(idx4, 1);
      break;
    }
    default:
      break;
  }
  return obstacles.filter(obs => obs.x !== initialSnakePos.x || obs.y !== initialSnakePos.y);
};


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
  const [speed, setSpeed] = useState<number | null>(LEVEL_CONFIG[level].speed);
  const [obstacles, setObstacles] = useState<Coordinates[]>(() => generateObstacles(initialLevel, BOARD_SIZE));
  const [score, setScore] = useState(0);
  const [isGameOver, setGameOver] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (isGameOver) {
      saveScore(score);
    }
  }, [isGameOver, score]);

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
    const levelConfig = LEVEL_CONFIG[newLevel];
    const newObstacles = generateObstacles(newLevel, BOARD_SIZE);
    setLevelState(newLevel);
    setSnake(INITIAL_SNAKE_POSITION);
    setDirection(INITIAL_DIRECTION);
    setObstacles(newObstacles);
    setFood(generateFood(INITIAL_SNAKE_POSITION, newObstacles));
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
        head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE ||
        prevSnake.some(segment => segment.x === head.x && segment.y === head.y) ||
        obstacles.some(obstacle => obstacle.x === head.x && obstacle.y === head.y);
      
      if (isCollision) {
        setGameOver(true);
        setIsRunning(false);
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];
      
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10 * (Object.keys(LEVEL_CONFIG).indexOf(level) + 1));
        setFood(generateFood(newSnake, obstacles));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food.x, food.y, generateFood, isRunning, obstacles, level]);

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
