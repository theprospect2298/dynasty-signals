'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const { config } = require('./config');
const { dispatch, buildTools } = require('./tools');
const { log, warn } = require('./logger');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// One streamed turn, with extra retries for transient connection drops
// ("premature close", resets, etc.) that the SDK doesn't always catch.
async function streamWithRetry(anthropic, params, attempts = 4) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await anthropic.messages.stream(params).finalMessage();
    } catch (e) {
      lastErr = e;
      const msg = e && e.message ? e.message : String(e);
      const transient = /premature close|terminated|econnreset|fetch failed|socket|network|timeout|stream/i.test(msg);
      if (!transient) throw e;
      warn(`API call attempt ${i + 1}/${attempts} dropped (${msg}); retrying…`);
      await sleep(2000 * (i + 1));
    }
  }
  throw lastErr;
}

let client = null;
function getClient() {
  if (!client) {
    client = new Anthropic({
      apiKey: config.apiKey,
      maxRetries: 4, // retry transient network/5xx errors
      timeout: 10 * 60 * 1000, // 10 min ceiling per request
    });
  }
  return client;
}

// Run an agentic tool-use loop until the model stops requesting client tools.
// Returns the concatenated final assistant text.
async function runAgent(args) {
  return (await runAgentDetailed(args)).text;
}

// Same loop, but also returns accumulated token usage for budget tracking.
// extraTools / dispatchExtra let a single run add tools (e.g. enqueue_task).
async function runAgentDetailed({ system, userPrompt, extraTools, dispatchExtra }) {
  const anthropic = getClient();
  const tools = buildTools(extraTools);
  const messages = [{ role: 'user', content: userPrompt }];

  let finalText = '';
  const usage = { input_tokens: 0, output_tokens: 0 };

  for (let iteration = 0; iteration < config.maxToolIterations; iteration++) {
    // Stream the response (keeps the connection alive on long generations) with
    // retries for transient drops.
    const response = await streamWithRetry(anthropic, {
      model: config.modelName,
      max_tokens: config.maxTokens,
      system,
      tools,
      messages,
    });

    if (response.usage) {
      usage.input_tokens += response.usage.input_tokens || 0;
      usage.output_tokens += response.usage.output_tokens || 0;
    }

    // Capture any text the model produced this turn.
    const textBlocks = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text);
    if (textBlocks.length) finalText = textBlocks.join('\n');

    // Client tools the model wants us to execute (server tools like web_search
    // are handled by the API and do not appear here).
    const toolUses = response.content.filter((b) => b.type === 'tool_use');

    if (response.stop_reason !== 'tool_use' || toolUses.length === 0) {
      return { text: finalText.trim(), usage };
    }

    // Record the assistant turn verbatim, then answer every tool_use.
    messages.push({ role: 'assistant', content: response.content });

    const toolResults = [];
    for (const tu of toolUses) {
      try {
        const result = await dispatch(tu.name, tu.input, dispatchExtra);
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
  return { text: finalText.trim(), usage };
}

function shortArgs(input) {
  const s = JSON.stringify(input || {});
  return s.length > 80 ? s.slice(0, 77) + '...' : s;
}

module.exports = { runAgent, runAgentDetailed };
