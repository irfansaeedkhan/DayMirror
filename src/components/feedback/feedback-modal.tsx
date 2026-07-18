"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSubmitFeedback } from "@/hooks/use-feedback";
import { cn } from "@/lib/utils";

const feedbackFormSchema = z.object({
  message: z.string().min(10, "Please write at least 10 characters").max(5000),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  category: z.enum(["bug", "idea", "other"]),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

type FeedbackModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const pathname = usePathname();
  const submit = useSubmitFeedback();

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      message: "",
      rating: null,
      category: "idea",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      message: "",
      rating: null,
      category: "idea",
    });
  }, [open, form]);

  async function onSubmit(values: FeedbackFormValues) {
    try {
      await submit.mutateAsync({
        message: values.message,
        rating: values.rating ?? null,
        category: values.category,
        page: pathname,
      });
      toast.success("Thanks — your feedback was sent.");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send feedback");
    }
  }

  const rating = form.watch("rating");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-xl sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Send feedback</AlertDialogTitle>
          <AlertDialogDescription>
            What should we improve? Bugs, ideas, and rough edges are all welcome.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Tell us what you need…"
              rows={5}
              {...form.register("message")}
            />
            {form.formState.errors.message && (
              <p className="text-sm text-destructive">{form.formState.errors.message.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Category</p>
            <Select
              value={form.watch("category")}
              onValueChange={(value) =>
                form.setValue("category", value as FeedbackFormValues["category"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="idea">Idea / improvement</SelectItem>
                <SelectItem value="bug">Something broken</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">How is DayMirror so far? (optional)</p>
            <ToggleGroup
              type="single"
              value={rating != null ? String(rating) : ""}
              onValueChange={(value) => form.setValue("rating", value ? Number(value) : null)}
              className="justify-start"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <ToggleGroupItem
                  key={value}
                  value={String(value)}
                  className={cn("size-9 rounded-full")}
                  aria-label={`${value} out of 5`}
                >
                  {value}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <Button type="submit" className="cursor-pointer" disabled={submit.isPending}>
              {submit.isPending ? "Sending…" : "Send feedback"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
