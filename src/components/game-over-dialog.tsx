"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";

interface GameOverDialogProps {
  isOpen: boolean;
  score: number;
  onRestart: () => void;
}

export default function GameOverDialog({ isOpen, score, onRestart }: GameOverDialogProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Game Over!</AlertDialogTitle>
          <AlertDialogDescription>
            You hit something. Your final score is:
          </AlertDialogDescription>
          <p className="text-4xl font-bold text-center text-primary py-4">{score}</p>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction asChild>
            <Button onClick={onRestart} className="w-full">Play Again</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
