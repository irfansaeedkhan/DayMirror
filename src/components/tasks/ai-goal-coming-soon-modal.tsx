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
import { AI_GOAL_STEPS } from "@/lib/ai-goals";

type AiGoalComingSoonModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AiGoalComingSoonModal({ open, onOpenChange }: AiGoalComingSoonModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="text-left">
          <AlertDialogTitle>AI goal planner — coming soon</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Describe a goal (for example a 30-day JS interview plan) and DayMirror will draft
                daily tasks for you.
              </p>
              <ol className="list-decimal space-y-1.5 pl-4">
                {AI_GOAL_STEPS.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full">Got it</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
