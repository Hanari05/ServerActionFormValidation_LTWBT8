import "server-only";
import { getPool } from "@/lib/server/db";
import type { FeedbackInput } from "@/lib/validations/feedback";

export async function insertFeedback(input: FeedbackInput): Promise<void> {
  await getPool().query(
    "INSERT INTO feedbacks (content, phone) VALUES ($1, $2)",
    [input.content, input.phone],
  );
}
