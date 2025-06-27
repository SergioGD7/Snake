"use client";

import type { Coordinates, Direction } from "@/hooks/use-game-logic";
import { cn } from "@/lib/utils";

interface GameBoardProps {
  boardSize: number;
  snake: Coordinates[];
  food: Coordinates;
  obstacles: Coordinates[];
  direction: Direction;
}

export default function GameBoard({ boardSize, snake, food, obstacles, direction }: GameBoardProps) {
  const grid = Array.from({ length: boardSize }, () =>
    Array(boardSize).fill(null)
  );

  const getEyeStyle = (eye: 'first' | 'second') => {
    switch(direction) {
      case 'UP':
        return eye === 'first' ? { top: '20%', left: '20%'} : { top: '20%', right: '20%' };
      case 'DOWN':
        return eye === 'first' ? { bottom: '20%', left: '20%'} : { bottom: '20%', right: '20%' };
      case 'LEFT':
        return eye === 'first' ? { top: '20%', left: '20%'} : { bottom: '20%', left: '20%' };
      case 'RIGHT':
        return eye === 'first' ? { top: '20%', right: '20%'} : { bottom: '20%', right: '20%' };
    }
  }

  return (
    <div
      className="bg-primary/10 p-2 rounded-lg"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
        gridTemplateRows: `repeat(${boardSize}, 1fr)`,
        width: "100%",
        aspectRatio: "1 / 1",
      }}
    >
      {grid.map((row, y) =>
        row.map((_, x) => {
          const isSnake = snake.some(seg => seg.x === x && seg.y === y);
          const isSnakeHead = isSnake && snake[0].x === x && snake[0].y === y;
          const isFood = food.x === x && food.y === y;
          const isObstacle = obstacles.some(obs => obs.x === x && obs.y === y);

          return (
            <div
              key={`${x}-${y}`}
              className={cn(
                "aspect-square relative",
                isSnakeHead && "bg-primary z-10 rounded-md",
                isSnake && !isSnakeHead && "bg-primary/80 rounded-lg",
                isFood && "bg-accent rounded-full",
                isObstacle && "bg-foreground/20",
              )}
            >
              {isSnakeHead && (
                <>
                  <div 
                    className="absolute bg-white rounded-full w-1/5 h-1/5"
                    style={getEyeStyle('first')}
                  />
                  <div 
                    className="absolute bg-white rounded-full w-1/5 h-1/5"
                    style={getEyeStyle('second')}
                  />
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
