import { Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { pool } from '../db';
import { resolveTargetUser } from '../lib/permissions';
import { getDayData } from '../lib/dayTotals';

const MODEL = 'claude-haiku-4-5-20251001';
const DAILY_LIMIT_PER_USER = 10;
const GLOBAL_LIMIT_30_DAYS = 3000;
const MAX_FOODS = 300;
const MIN_GRAMS = 5;
const MAX_GRAMS = 500;
const OVERSHOOT_TOLERANCE = 1.1;

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

const suggestTool: Anthropic.Tool = {
  name: 'suggest_meals',
  description: 'Return meal suggestions built only from the foods provided.',
  input_schema: {
    type: 'object',
    properties: {
      suggestions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  ref: { type: 'integer' },
                  grams: { type: 'number' },
                },
                required: ['ref', 'grams'],
              },
            },
          },
          required: ['title', 'items'],
        },
      },
    },
    required: ['suggestions'],
  },
};

const SYSTEM_PROMPT = `You suggest meals and snacks built from a fixed list of foods.
Rules:
- Use only foods from the list, referenced by their ref number. Never invent foods.
- Amounts are in grams.
- Suggest 3 different options. Each should combine 2-4 foods that people actually eat together.
- Each option should land close to the remaining macros without going over the remaining calories.
- Return your answer only through the suggest_meals tool.`;

const round1 = (n: number) => Math.round(n * 10) / 10;
const left = (n: number) => Math.max(0, Math.round(n));

export async function createSuggestions(req: Request, res: Response) {
  const requesterId = req.session.userId!;
  const { date, targetUserId } = req.body;

  if (typeof date !== 'string') {
    return res.status(400).json({ error: 'A date is required' });
  }

  const targetId = await resolveTargetUser(requesterId, targetUserId);
  if (targetId === null) {
    return res.status(403).json({ error: 'You do not have permission for this account' });
  }

  const { remaining, eaten } = await getDayData(targetId, date);
  if (!remaining) {
    return res.status(400).json({ error: 'Set your daily goals first', code: 'no_goals' });
  }

  if (remaining.calories < 100) {
    return res.json({ suggestions: [], reason: 'goals_met' });
  }

  const foodsResult = await pool.query(
    `SELECT id, name, calories_per_100g, protein_per_100g, carbs_per_100g,
            fat_per_100g, portion_grams
     FROM foods WHERE user_id = $1
     ORDER BY LOWER(name) LIMIT $2`,
    [targetId, MAX_FOODS]
  );
  const foods = foodsResult.rows;

  if (foods.length < 3) {
    return res.status(400).json({ error: 'Add a few more foods first', code: 'too_few_foods' });
  }

  const userCount = await pool.query(
    `SELECT COUNT(*) FROM suggestion_requests
     WHERE user_id = $1 AND created_at > now() - interval '24 hours'`,
    [requesterId]
  );
  if (Number(userCount.rows[0].count) >= DAILY_LIMIT_PER_USER) {
    return res.status(429).json({ error: 'Daily suggestion limit reached', code: 'daily_limit' });
  }

  const globalCount = await pool.query(
    `SELECT COUNT(*) FROM suggestion_requests WHERE created_at > now() - interval '30 days'`
  );
  if (Number(globalCount.rows[0].count) >= GLOBAL_LIMIT_30_DAYS) {
    return res
      .status(503)
      .json({ error: 'Suggestions are temporarily unavailable', code: 'suggestions_unavailable' });
  }

  const logged = await pool.query(
    'INSERT INTO suggestion_requests (user_id) VALUES ($1) RETURNING id',
    [requesterId]
  );
  const loggedId = logged.rows[0].id;

  const foodLines = foods
    .map(
      (f, i) =>
        `${i + 1}|${f.name}|${Math.round(Number(f.calories_per_100g))}|${f.protein_per_100g}|${f.carbs_per_100g}|${f.fat_per_100g}|${f.portion_grams ?? ''}`
    )
    .join('\n');

  const userContent = [
    `Remaining for today: ${left(remaining.calories)} kcal, ${left(remaining.protein)}g protein, ${left(remaining.carbs)}g carbs, ${left(remaining.fat)}g fat.`,
    eaten.length > 0 ? `Already eaten today: ${eaten.join(', ')}.` : 'Nothing eaten yet today.',
    '',
    'Foods (ref|name|kcal|protein g|carbs g|fat g, all per 100g|portion g):',
    foodLines,
  ].join('\n');

  let message;
  try {
    message = await getClient().messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
      tools: [suggestTool],
      tool_choice: { type: 'tool', name: 'suggest_meals' },
    });
  } catch (err) {
    await pool.query('DELETE FROM suggestion_requests WHERE id = $1', [loggedId]);
    console.error(
      'Suggestion request failed:',
      err instanceof Anthropic.APIError ? `${err.status} ${err.message}` : err
    );
    return res
      .status(503)
      .json({ error: 'Suggestions are temporarily unavailable', code: 'suggestions_unavailable' });
  }

  const toolBlock = message.content.find((block) => block.type === 'tool_use');
  const raw =
    toolBlock && 'input' in toolBlock ? (toolBlock.input as { suggestions?: unknown }) : null;
  const rawSuggestions: any[] = Array.isArray(raw?.suggestions) ? raw.suggestions : [];

  const verified = [];
  for (const s of rawSuggestions.slice(0, 5)) {
    if (typeof s?.title !== 'string' || !Array.isArray(s.items)) continue;

    const items = [];
    const total = { calories: 0, protein: 0, carbs: 0, fat: 0 };

    for (const it of s.items.slice(0, 6)) {
      const food = foods[Number(it?.ref) - 1];
      const rawGrams = Number(it?.grams);
      if (!food || !Number.isFinite(rawGrams)) continue;

      const grams = Math.min(MAX_GRAMS, Math.max(MIN_GRAMS, Math.round(rawGrams / 5) * 5));
      const factor = grams / 100;
      const macros = {
        calories: factor * Number(food.calories_per_100g),
        protein: factor * Number(food.protein_per_100g),
        carbs: factor * Number(food.carbs_per_100g),
        fat: factor * Number(food.fat_per_100g),
      };

      total.calories += macros.calories;
      total.protein += macros.protein;
      total.carbs += macros.carbs;
      total.fat += macros.fat;

      items.push({
        foodId: food.id,
        name: food.name,
        grams,
        calories: Math.round(macros.calories),
        protein: round1(macros.protein),
        carbs: round1(macros.carbs),
        fat: round1(macros.fat),
      });
    }

    if (items.length === 0) continue;
    if (total.calories > remaining.calories * OVERSHOOT_TOLERANCE) continue;

    verified.push({
      title: s.title,
      items,
      totals: {
        calories: Math.round(total.calories),
        protein: round1(total.protein),
        carbs: round1(total.carbs),
        fat: round1(total.fat),
      },
    });
  }

  res.json({
    suggestions: verified,
    reason: verified.length === 0 ? 'no_fit' : undefined,
  });
}