import { z } from "zod";

export const ticketFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be 200 characters or less"),
  status: z.enum(["Open", "In Progress", "Waiting for Info", "Resolved", "Closed"]),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  category_id: z.string().optional(),
  request_type: z.string().max(100, "Request type must be 100 characters or less").optional(),
  staff_assigned: z.string().max(100, "Assignee name must be 100 characters or less").optional(),
  requester: z.string().max(100, "Requester name must be 100 characters or less").optional(),
  description: z.string().min(10, "Description must be at least 10 characters").max(10000, "Description must be 10000 characters or less"),
  resolution_notes: z.string().max(10000, "Resolution notes must be 10000 characters or less").optional(),
  site_id: z.string().max(100, "Site ID must be 100 characters or less").optional(),
  label_ids: z.array(z.number()).optional(),
});

export type TicketFormInput = z.infer<typeof ticketFormSchema>;

export const commentSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty").max(5000, "Comment must be 5000 characters or less"),
});

export type CommentInput = z.infer<typeof commentSchema>;

export function validateTicketForm(data: unknown): { success: true; data: TicketFormInput } | { success: false; errors: Record<string, string> } {
  const result = ticketFormSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    errors[path] = issue.message;
  }
  return { success: false, errors };
}

export function validateComment(data: unknown): { success: true; data: CommentInput } | { success: false; errors: Record<string, string> } {
  const result = commentSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    errors[path] = issue.message;
  }
  return { success: false, errors };
}