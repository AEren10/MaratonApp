import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  new URL("../../supabase/migrations/20260914112035_cdx_study_log_topic_progress_delta.sql", import.meta.url),
  "utf8",
);

test("study log topic progress trigger handles edit and delete deltas", () => {
  assert.match(migration, /AFTER INSERT OR UPDATE OR DELETE ON public\.study_logs/);
  assert.match(migration, /TG_OP IN \('UPDATE', 'DELETE'\)/);
  assert.match(migration, /OLD\.question_count/);
  assert.match(migration, /OLD\.duration_minutes/);
  assert.match(migration, /TG_OP IN \('INSERT', 'UPDATE'\)/);
  assert.match(migration, /NEW\.question_count/);
  assert.match(migration, /NEW\.duration_minutes/);
});

test("study log topic progress deltas cannot drive counters negative", () => {
  assert.match(migration, /GREATEST\(COALESCE\(total_questions, 0\) - v_questions, 0\)/);
  assert.match(migration, /GREATEST\(COALESCE\(correct_count, 0\) - v_correct, 0\)/);
  assert.match(migration, /GREATEST\(COALESCE\(study_count, 0\) - 1, 0\)/);
  assert.match(migration, /GREATEST\(COALESCE\(total_minutes, 0\) - v_minutes, 0\)/);
});

test("study log topic progress recomputes stale recency after removing old contribution", () => {
  assert.match(migration, /private\.latest_topic_progress_studied_at/);
  assert.match(migration, /max\(COALESCE\(sl\.study_date::timestamptz, sl\.created_at\)\)/);
  assert.match(migration, /last_studied_at = private\.latest_topic_progress_studied_at/);
});

test("topic progress trigger functions lock search_path", () => {
  assert.match(migration, /FUNCTION private\.latest_topic_progress_studied_at[\s\S]*?SET search_path = ''/);
  assert.match(migration, /FUNCTION private\.apply_topic_progress_delta[\s\S]*?SET search_path = ''/);
  assert.match(migration, /FUNCTION public\.update_topic_progress[\s\S]*?SET search_path = ''/);
});
