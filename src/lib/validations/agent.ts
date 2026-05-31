import { z } from "zod";

export const createAgentSchema = z.object({
  name: z.string().min(2).max(60),
  tagline: z.string().max(120).optional(),
  description: z.string().max(2000).optional(),
  categoryId: z.string().optional(),
  systemPrompt: z.string().min(20).max(8000),
  model: z.enum(["gpt-4o-mini", "gpt-4o"]).default("gpt-4o-mini"),
  temperature: z.number().min(0).max(2).default(0.7),
  welcomeMsg: z.string().max(500).optional(),
  suggestions: z.array(z.string().max(120)).max(6).default([]),
  pricingModel: z.enum(["FREE", "SUBSCRIPTION", "ONE_TIME"]).default("SUBSCRIPTION"),
  priceMonthly: z.number().int().min(0).max(100000).default(1900),
  priceOneTime: z.number().int().min(0).max(1000000).default(0),
  trialDays: z.number().int().min(0).max(30).default(0),
});

export const updateAgentSchema = createAgentSchema.partial();

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
