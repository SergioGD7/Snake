"use client";

import type { Coordinates } from "@/hooks/use-game-logic";
import { cn } from "@/lib/utils";

interface GameBoardProps {
  boardSize: number;
  snake: Coordinates[];
  food: Coordinates;
  obstacles: Coordinates[];
}

export default function GameBoard({ boardSize, snake, food, obstacles }: GameBoardProps) {
  const grid = Array.from({ length: boardSize }, () =>
    Array(boardSize).fill(null)
  );

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
                "aspect-square",
                isSnakeHead && "bg-primary z-10",
                isSnake && !isSnakeHead && "bg-primary/80",
                isFood && "bg-accent rounded-full",
                isObstacle && "bg-foreground/20",
              )}
            />
          );
        })
      )}
    </div>
  );
}
