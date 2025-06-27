
"use client";

import type { Coordinates, Direction } from "@/hooks/use-game-logic";
import { cn } from "@/lib/utils";

interface GameBoardProps {
  boardSize: number;
  snake: Coordinates[];
  food: Coordinates;
  obstacles: Coordinates[];
  direction: Direction;
  speed: number | null;
}

export default function GameBoard({ boardSize, snake, food, obstacles, direction, speed }: GameBoardProps) {
  const cellSize = 100 / boardSize;

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
      className="bg-primary/10 p-2 rounded-lg relative"
      style={{
        width: "100%",
        aspectRatio: "1 / 1",
      }}
    >
      {obstacles.map((obs, i) => (
        <div
          key={`obs-${i}`}
          className="absolute bg-foreground/20 rounded-sm"
          style={{
            left: `${obs.x * cellSize}%`,
            top: `${obs.y * cellSize}%`,
            width: `${cellSize}%`,
            height: `${cellSize}%`,
          }}
        />
      ))}

      <div
        className="absolute bg-accent rounded-full transition-all duration-200"
        style={{
          left: `${food.x * cellSize}%`,
          top: `${food.y * cellSize}%`,
          width: `${cellSize}%`,
          height: `${cellSize}%`,
        }}
      />
      
      {snake.map((segment, index) => {
        const isHead = index === 0;
        return (
          <div
            key={index}
            className={cn(
              "absolute",
              isHead ? "bg-primary z-10 rounded-md" : "bg-primary/80 rounded-full"
            )}
            style={{
              left: `${segment.x * cellSize}%`,
              top: `${segment.y * cellSize}%`,
              width: `${cellSize}%`,
              height: `${cellSize}%`,
              transition: `all ${speed ? speed / 1000 : 0.15}s linear`
            }}
          >
            {isHead && (
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
        )
      })}
    </div>
  );
}
