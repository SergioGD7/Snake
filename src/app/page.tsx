"use client";

import * as React from "react";
import { Gamepad2, Play, Pause, RefreshCw, ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GameBoard from "@/components/game-board";
import GameOverDialog from "@/components/game-over-dialog";
import { useGameLogic, type Level } from "@/hooks/use-game-logic";

export default function Home() {
  const {
    boardSize,
    snake,
    food,
    obstacles,
    score,
    level,
    setLevel,
    isGameOver,
    isRunning,
    startGame,
    pauseGame,
    resetGame,
    direction,
  } = useGameLogic();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="w-full max-w-4xl mx-auto flex flex-col lg:flex-row gap-8 items-center lg:items-start">
        <div className="w-full max-w-lg">
          <header className="text-center mb-4">
            <h1 className="text-5xl font-bold tracking-tighter text-primary">Retro Snake</h1>
            <p className="text-muted-foreground mt-2">A classic game for a new era.</p>
          </header>

          <Card className="relative overflow-hidden shadow-2xl">
            <div className="absolute top-4 right-4 bg-primary/80 text-primary-foreground rounded-md px-3 py-1 text-sm font-semibold shadow-lg">
              Score: {score}
            </div>
            <GameBoard
              boardSize={boardSize}
              snake={snake}
              food={food}
              obstacles={obstacles}
              direction={direction}
            />
          </Card>
        </div>

        <div className="w-full lg:w-80 flex-shrink-0">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="text-primary" />
                Controls
              </CardTitle>
              <CardDescription>
                Use the buttons or your keyboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-center gap-4">
                <Button onClick={isRunning ? pauseGame : startGame} size="lg" className="flex-1">
                  {isRunning ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
                  {isRunning ? "Pause" : "Start"}
                </Button>
                <Button onClick={() => resetGame(level)} variant="outline" size="lg">
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2 justify-items-center">
                  <div/>
                  <div className="bg-muted p-2 rounded-md"><ArrowUp size={20}/></div>
                  <div/>
                  <div className="bg-muted p-2 rounded-md"><ArrowLeft size={20}/></div>
                  <div className="bg-muted p-2 rounded-md"><ArrowDown size={20}/></div>
                  <div className="bg-muted p-2 rounded-md"><ArrowRight size={20}/></div>
              </div>


              <div>
                <label htmlFor="level-select" className="text-sm font-medium text-muted-foreground mb-2 block">
                  Level
                </label>
                <Select
                  value={level}
                  onValueChange={(value: Level) => setLevel(value)}
                >
                  <SelectTrigger id="level-select" className="w-full">
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <GameOverDialog
        isOpen={isGameOver}
        score={score}
        onRestart={() => resetGame(level)}
      />
    </main>
  );
}
