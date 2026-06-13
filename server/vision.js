const Anthropic = require('@anthropic-ai/sdk');

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';

let client = null;
if (process.env.ANTHROPIC_API_KEY) {
  client = new Anthropic(); // reads ANTHROPIC_API_KEY from env
  console.log(`[vision] AI chart parsing enabled (${MODEL})`);
} else {
  console.log('[vision] ANTHROPIC_API_KEY not set — screenshot parsing disabled');
}

// Guaranteed-JSON output shape
const TRADE_SCHEMA = {
  type: 'object',
  properties: {
    asset: { type: 'string', description: 'Standard short ticker symbol, e.g. MNQ, NQ, ES, AAPL, BTC/USD' },
    action: { type: 'string', enum: ['BUY', 'SELL'] },
    entry_price: { anyOf: [{ type: 'number' }, { type: 'null' }] },
    target_price: { anyOf: [{ type: 'number' }, { type: 'null' }] },
    stop_loss: { anyOf: [{ type: 'number' }, { type: 'null' }] },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    notes: { type: 'string', description: 'One short sentence on what was read from the chart' },
  },
  required: ['asset', 'action', 'entry_price', 'target_price', 'stop_loss', 'confidence', 'notes'],
  additionalProperties: false,
};

// The trader's fixed setup + extraction rule, encoded once
const SYSTEM_PROMPT = `You read TradingView chart screenshots and extract trade signals.

THE TRADER'S SETUP (consistent across all their screenshots):
- The chart title at the top-left names the instrument (e.g. "Micro E-mini Nasdaq-100 Index Futures · 5 · CME").
- The trade's price levels appear as BOXED price labels pinned on the RIGHT price axis. Ignore the plain, evenly-spaced axis numbers (gridline ticks) — only boxed/highlighted labels are trade levels.
- If two boxed labels sit at nearly the same price (stacked together, e.g. the live price plus an order at almost the same level), treat them as ONE level.
- A risk/reward position tool is usually drawn on the chart: a shaded zone above and below the entry, each annotated with a point distance like "94.25 (0.318%)". Those distances measure entry-to-target and entry-to-stop. If more than three boxed levels exist on the axis, use these measurements to pick the three levels that belong to the trade (entry ± the measured distances).

EXTRACTION RULES (apply exactly, in order):
1. asset: the instrument's standard short ticker. Map futures names: "Micro E-mini Nasdaq-100" → MNQ, "E-mini Nasdaq-100" → NQ, "Micro E-mini S&P 500" → MES, "E-mini S&P 500" → ES, "Micro E-mini Dow" → MYM, "Micro E-mini Russell 2000" → M2K, "Micro Gold" → MGC, "Crude Oil" → CL. For stocks, crypto, and forex use the symbol shown in the title.
2. From the boxed price labels (after clustering near-duplicates and filtering with the risk/reward measurements), identify exactly THREE trade levels.
3. entry_price = the MIDDLE level when the three are sorted by price.
4. stop_loss = whichever of the other two levels is CLOSEST to the entry.
5. target_price = the level FARTHEST from the entry.
6. action = "BUY" if target_price > entry_price, "SELL" if target_price < entry_price.
7. confidence: "high" when three clean levels were found and the rules applied without judgment calls; "medium" when clustering or level-selection required judgment; "low" when anything was ambiguous or a level could not be found.
8. notes: one short sentence stating the instrument and the three levels you used. Mention any ambiguity.

Prices must be plain numbers — no commas, no currency symbols. If a level genuinely cannot be found, return null for it and set confidence to "low".`;

async function extractTradeFromImage(imageBuffer, mediaType) {
  if (!client) {
    const err = new Error('AI screenshot parsing is not configured. Add ANTHROPIC_API_KEY in Replit Secrets, then restart the app.');
    err.code = 'NO_API_KEY';
    throw err;
  }

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    system: SYSTEM_PROMPT,
    output_config: { format: { type: 'json_schema', schema: TRADE_SCHEMA } },
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: mediaType, data: imageBuffer.toString('base64') },
        },
        { type: 'text', text: 'Extract the trade signal from this chart screenshot using the rules.' },
      ],
    }],
  });

  const textBlock = response.content.find(b => b.type === 'text');
  if (!textBlock) throw new Error('Model returned no text content');
  return JSON.parse(textBlock.text);
}

module.exports = { extractTradeFromImage };
