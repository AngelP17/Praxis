"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, ChatText, PaperPlaneRight } from "@phosphor-icons/react";
import { motion } from "framer-motion";

export type FeedbackItem = {
  id: string;
  author: string;
  verdict: "approve" | "reject" | "question";
  comment: string;
  timestamp: string;
};

export function HumanFeedbackPanel({
  feedback,
  onSubmit,
}: {
  feedback: FeedbackItem[];
  onSubmit?: (verdict: "approve" | "reject" | "question", comment: string) => void;
}) {
  const [verdict, setVerdict] = useState<"approve" | "reject" | "question" | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!verdict || !onSubmit) return;
    setIsSubmitting(true);
    await onSubmit(verdict, comment);
    setIsSubmitting(false);
    setVerdict(null);
    setComment("");
  };

  return (
    <div className="legacy-card rounded-[1.5rem] p-5 sm:p-6">
      <div className="flex items-center gap-2 border-b border-zinc-800/70 pb-4">
        <ChatText className="h-4 w-4 text-amber-300" />
        <div className="mono-data text-[10px] uppercase tracking-[0.28em] text-zinc-500">Human Feedback</div>
        <div className="mono-data ml-auto text-[11px] text-zinc-600">{feedback.length} responses</div>
      </div>

      <div className="mt-5 space-y-3 max-h-[300px] overflow-auto pr-1">
        {feedback.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, type: "spring", stiffness: 400, damping: 30 }}
            className={`rounded-xl border p-3.5 ${
              item.verdict === "approve"
                ? "border-emerald-500/15 bg-emerald-500/[0.04]"
                : item.verdict === "reject"
                ? "border-rose-500/15 bg-rose-500/[0.04]"
                : "border-amber-500/15 bg-amber-500/[0.04]"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-zinc-200">{item.author}</span>
              <span
                className={`mono-data text-[10px] uppercase tracking-wider ${
                  item.verdict === "approve"
                    ? "text-emerald-400"
                    : item.verdict === "reject"
                    ? "text-rose-400"
                    : "text-amber-400"
                }`}
              >
                {item.verdict}
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-5 text-zinc-400">{item.comment}</p>
            <div className="mt-2 mono-data text-[10px] text-zinc-600">
              {new Date(item.timestamp).toLocaleString()}
            </div>
          </motion.div>
        ))}

        {feedback.length === 0 && (
          <div className="text-center py-6 text-sm text-zinc-500">No feedback recorded yet.</div>
        )}
      </div>

      {onSubmit && (
        <div className="mt-5 border-t border-zinc-800/50 pt-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setVerdict("approve")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
                verdict === "approve"
                  ? "bg-emerald-500/15 text-emerald-200 border border-emerald-500/20"
                  : "text-zinc-500 hover:text-zinc-300 border border-transparent"
              }`}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              Approve
            </button>
            <button
              type="button"
              onClick={() => setVerdict("reject")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
                verdict === "reject"
                  ? "bg-rose-500/15 text-rose-200 border border-rose-500/20"
                  : "text-zinc-500 hover:text-zinc-300 border border-transparent"
              }`}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              Reject
            </button>
            <button
              type="button"
              onClick={() => setVerdict("question")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
                verdict === "question"
                  ? "bg-amber-500/15 text-amber-200 border border-amber-500/20"
                  : "text-zinc-500 hover:text-zinc-300 border border-transparent"
              }`}
            >
              <ChatText className="h-3.5 w-3.5" />
              Question
            </button>
          </div>

          {verdict && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3"
            >
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add context to your feedback..."
                rows={3}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500/30 focus:outline-none resize-none"
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:opacity-60"
              >
                <PaperPlaneRight className="h-4 w-4" />
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
