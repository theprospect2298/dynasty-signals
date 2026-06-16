'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const { config } = require('./config');
const { dispatch, buildTools } = require('./tools');
const { log, warn } = require('./logger');

let client = null;
function getClient() {
  if (!client) client = new Anthropic({ apiKey: config.apiKey });
  return client;
}

// Run an agentic tool-use loop until the model stops requesting client tools.
// Returns the concatenated final assistant text.
async function runAgent({ system, userPrompt }) {
  const anthropic = getClient();
  const tools = buildTools();
  const messages = [{ role: 'user', content: userPrompt }];

  let finalText = '';

  for (let iteration = 0; iteration < config.maxToolIterations; iteration++) {
    const response = await anthropic.messages.create({
      model: config.modelName,
      max_tokens: config.maxTokens,
      system,
      tools,
      messages,
    });

    // Capture any text the model produced this turn.
    const textBlocks = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text);
    if (textBlocks.length) finalText = textBlocks.join('\n');

    // Client tools the model wants us to execute (server tools like web_search
    // are handled by the API and do not appear here).
    const toolUses = response.content.filter((b) => b.type === 'tool_use');

    if (response.stop_reason !== 'tool_use' || toolUses.length === 0) {
      return finalText.trim();
    }

    // Record the assistant turn verbatim, then answer every tool_use.
    messages.push({ role: 'assistant', content: response.content });

    const toolResults = [];
    for (const tu of toolUses) {
      try {
        const result = await dispatch(tu.name, tu.input);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: tu.id,
          content: result,
        });
        log(`  tool ${tu.name}(${shortArgs(tu.input)}) -> ok`);
      } catch (err) {
        warn(`  tool ${tu.name} failed: ${err.message}`);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: tu.id,
          content: `ERROR: ${err.message}`,
          is_error: true,
        });
      }
    }

    messages.push({ role: 'user', content: toolResults });
  }

  warn(`Hit MAX_TOOL_ITERATIONS (${config.maxToolIterations}); returning partial output.`);
  return finalText.trim();
}

function shortArgs(input) {
  const s = JSON.stringify(input || {});
  return s.length > 80 ? s.slice(0, 77) + '...' : s;
}

module.exports = { runAgent };
