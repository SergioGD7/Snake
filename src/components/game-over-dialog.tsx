
"use client";

import {
  AlertDialog,
  AlertDialogCancel,
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
  onClose: () => void;
  onShowRanking: () => void;
}

export default function GameOverDialog({ isOpen, score, onRestart, onClose, onShowRanking }: GameOverDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Game Over!</AlertDialogTitle>
          <AlertDialogDescription>
            You hit something. Your final score is:
          </AlertDialogDescription>
          <p className="text-4xl font-bold text-center text-primary py-4">{score}</p>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row sm:justify-center gap-2">
            <Button onClick={onRestart} className="w-full">Play Again</Button>
            <Button onClick={onShowRanking} variant="secondary" className="w-full">Ranking</Button>
            <AlertDialogCancel asChild>
              <Button onClick={onClose} variant="outline" className="w-full">Close</Button>
            </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
