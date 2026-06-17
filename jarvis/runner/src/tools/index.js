'use strict';

const fsTool = require('./filesystem');
const memory = require('../memory');
const { notify } = require('../notify');
const { config } = require('../config');

// Client-side tool schemas exposed to the model.
const toolDefs = [
  {
    name: 'list_directory',
    description:
      'List the contents (files and subfolders) of a vault directory. Path is relative to the vault root, e.g. "01-KNOWLEDGE/permanent" or "." for the root.',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Vault-relative directory path. Default ".".' },
      },
    },
  },
  {
    name: 'read_file',
    description: 'Read the full text contents of a single file. Path is vault-relative.',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Vault-relative file path.' },
      },
      required: ['path'],
    },
  },
  {
    name: 'write_file',
    description:
      'Create or overwrite a file with the given content. Path is vault-relative. Subject to WRITE_SCOPE. Use this to save skill outputs and new notes.',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Vault-relative file path.' },
        content: { type: 'string', description: 'Full file content to write.' },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'append_file',
    description:
      'Append content to the end of a file (creating it if needed). Useful for adding to tomorrow\'s daily note or 00-INBOX/tasks.md. Subject to WRITE_SCOPE.',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Vault-relative file path.' },
        content: { type: 'string', description: 'Text to append.' },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'list_recent_files',
    description:
      'List vault files modified within the last N hours, newest first. Use this to find recent notes for the connection finder or belief tracker.',
    input_schema: {
      type: 'object',
      properties: {
        hours: { type: 'number', description: 'Lookback window in hours. Default 48.' },
      },
    },
  },
  {
    name: 'search_vault',
    description:
      'Search across all text files in the vault and return matching lines with their file path and line number. Use for finding related notes by keyword or regex.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search string or regex pattern.' },
        regex: { type: 'boolean', description: 'Treat query as a regular expression. Default false.' },
      },
      required: ['query'],
    },
  },
  {
    name: 'memory_search',
    description:
      'Retrieve recent memory entries matching a tag (e.g. "morning-brief"). Returns prior skill outputs and accumulated context. Call this early to avoid repetition and build on history.',
    input_schema: {
      type: 'object',
      properties: {
        tag: { type: 'string', description: 'Tag substring to match, e.g. "morning-brief".' },
        limit: { type: 'number', description: 'Max entries to return. Default 7.' },
      },
      required: ['tag'],
    },
  },
  {
    name: 'memory_store',
    description:
      'Persist a memory entry for future skill runs. Provide concise, high-signal content plus tags (include the skill name and today\'s date).',
    input_schema: {
      type: 'object',
      properties: {
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags, e.g. ["morning-brief", "2026-06-16"].',
        },
        content: { type: 'string', description: 'The memory content to store.' },
      },
      required: ['tags', 'content'],
    },
  },
  {
    name: 'send_notification',
    description:
      'Send a short notification to the configured gateway (Telegram). Use exactly as the skill instructs (e.g. "Morning brief ready — <the one thing>").',
    input_schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Notification text.' },
      },
      required: ['message'],
    },
  },
];

function ok(data) {
  return JSON.stringify(data);
}

// Execute a client tool call and return a string result for the tool_result block.
// `extra` is an optional map of name -> async(input) handlers contributed for a
// single run (e.g. Mission Control's enqueue_task), checked before the built-ins.
async function dispatch(name, input, extra) {
  input = input || {};
  if (extra && typeof extra[name] === 'function') {
    return extra[name](input);
  }
  switch (name) {
    case 'list_directory':
      return ok(fsTool.listDirectory(input.path || '.'));
    case 'read_file':
      return fsTool.readFile(input.path);
    case 'write_file': {
      const written = fsTool.writeFile(input.path, input.content);
      return ok({ written, bytes: Buffer.byteLength(input.content || '', 'utf8') });
    }
    case 'append_file': {
      const written = fsTool.appendFile(input.path, input.content);
      return ok({ appended: written });
    }
    case 'list_recent_files':
      return ok(fsTool.recentFiles(input.hours || 48));
    case 'search_vault':
      return ok(fsTool.searchVault(input.query, !!input.regex));
    case 'memory_search':
      return ok(memory.search(input.tag, input.limit || 7));
    case 'memory_store': {
      const id = memory.store(input.tags, input.content);
      return ok({ stored: true, id });
    }
    case 'send_notification': {
      const sent = await notify(input.message);
      return ok({ sent });
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// Append the Anthropic server-side web search tool when enabled, plus any
// per-run extra tool definitions (e.g. Mission Control's enqueue_task).
function buildTools(extraTools) {
  const tools = [...toolDefs];
  if (Array.isArray(extraTools)) tools.push(...extraTools);
  if (config.enableWebSearch) {
    tools.push({
      type: 'web_search_20250305',
      name: 'web_search',
      max_uses: config.webSearchMaxUses,
    });
  }
  return tools;
}

module.exports = { toolDefs, dispatch, buildTools };
