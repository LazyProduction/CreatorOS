export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  niche: string | null;
  content_types: string[];
  platforms: string[];
  target_audience: string | null;
  voice_notes: string | null;
  language: string;
  theme_accent: string;
  theme_mode: "dark" | "light";
  onboarded: boolean;
  plan: "free" | "creator" | "pro";
  monthly_credits: number;
  bonus_credits: number;
  credits_period_end: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  discord_webhook_url: string | null;
};

export type Stage = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  position: number;
  is_published_stage: boolean;
};

export type ChecklistItem = { id: string; label: string; done: boolean };

export type Project = {
  id: string;
  user_id: string;
  stage_id: string | null;
  position: number;
  title: string;
  brief: string;
  platform: string;
  format: "long" | "short" | "post" | "live";
  tone: string;
  chosen_title: string | null;
  chosen_hook: string | null;
  script: string;
  description: string;
  tags: string[];
  notes: string;
  checklist: ChecklistItem[];
  due_date: string | null;
  publish_at: string | null;
  published_at: string | null;
  published_url: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
};

export type Generation = {
  id: string;
  project_id: string | null;
  kind: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  credits_used: number;
  model: string | null;
  created_at: string;
};

export type Publication = {
  id: string;
  project_id: string | null;
  platform: string;
  url: string | null;
  published_at: string;
  views: number | null;
  likes: number | null;
  comments: number | null;
  notes: string;
};
