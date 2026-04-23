/**
 * Mock data served when LOGS_DIR is missing or USE_MOCK=1.
 *
 * Kept intentionally small and realistic — just enough for the UI to render
 * every status (running, done, failed, orphaned) out of the box.
 */

const MINUTE = 60_000
const now = Date.now()

export const MOCK_DISPATCHES = [
  {
    project: 'demo-shop',
    slug: 'add-cart-analytics',
    date: '20260423',
    stem: 'demo-shop-20260423-0930-add-cart-analytics',
    log_name: 'demo-shop-20260423-0930-add-cart-analytics.log',
    log_path: '/mock/demo-shop-20260423-0930-add-cart-analytics.log',
    handoff_path: null,
    status: 'running',
    events_count: 84,
    init: null,
    result: null,
    is_complete: false,
    is_error: false,
    duration_ms: 5 * MINUTE,
    num_turns: 14,
    cost_usd: 0.42,
    tool_calls: 23,
    last_tool_call: { name: 'Edit', id: 'toolu_01' },
    last_assistant_text:
      'Added GA4 event tracking to the ShoppingCart provider. Running type-check next to confirm the mutation hook signature still compiles.',
    permission_denials: 0,
    log_size_bytes: 128_000,
    log_mtime: now - 12_000,
  },
  {
    project: 'claude-dispatch-monitor',
    slug: 'readme-polish',
    date: '20260423',
    stem: 'claude-dispatch-monitor-20260423-readme-polish',
    log_name: 'claude-dispatch-monitor-20260423-readme-polish.log',
    log_path: '/mock/claude-dispatch-monitor-20260423-readme-polish.log',
    handoff_path: '/mock/.claude-handoffs/readme-polish.md',
    status: 'done',
    events_count: 41,
    init: null,
    result: {
      is_error: false,
      num_turns: 7,
      duration_ms: 2 * MINUTE + 18_000,
      total_cost_usd: 0.11,
      permission_denials: [],
    },
    is_complete: true,
    is_error: false,
    duration_ms: 2 * MINUTE + 18_000,
    num_turns: 7,
    cost_usd: 0.11,
    tool_calls: 9,
    last_tool_call: { name: 'Write', id: 'toolu_02' },
    last_assistant_text:
      'README updated with run instructions, screenshot placeholder, and a short troubleshooting section. Handoff written.',
    permission_denials: 0,
    log_size_bytes: 41_000,
    log_mtime: now - 35 * MINUTE,
  },
  {
    project: 'invoices-api',
    slug: 'pdf-export-bug',
    date: '20260422',
    stem: 'invoices-api-20260422-1745-pdf-export-bug',
    log_name: 'invoices-api-20260422-1745-pdf-export-bug.log',
    log_path: '/mock/invoices-api-20260422-1745-pdf-export-bug.log',
    handoff_path: null,
    status: 'failed',
    events_count: 56,
    init: null,
    result: {
      is_error: true,
      num_turns: 11,
      duration_ms: 4 * MINUTE,
      total_cost_usd: 0.28,
      permission_denials: ['Bash(rm -rf *)'],
    },
    is_complete: true,
    is_error: true,
    duration_ms: 4 * MINUTE,
    num_turns: 11,
    cost_usd: 0.28,
    tool_calls: 15,
    last_tool_call: { name: 'Bash', id: 'toolu_03' },
    last_assistant_text:
      'Tests still failing after the header-layout fix. Two fixtures reference fonts that are not installed in this environment.',
    permission_denials: 1,
    log_size_bytes: 86_000,
    log_mtime: now - 18 * 60 * MINUTE,
  },
  {
    project: 'blog-cms',
    slug: 'migrate-to-strapi-5',
    date: '20260420',
    stem: 'blog-cms-20260420-migrate-to-strapi-5',
    log_name: 'blog-cms-20260420-migrate-to-strapi-5.log',
    log_path: '/mock/blog-cms-20260420-migrate-to-strapi-5.log',
    handoff_path: null,
    status: 'orphaned',
    events_count: 19,
    init: null,
    result: null,
    is_complete: false,
    is_error: false,
    duration_ms: null,
    num_turns: null,
    cost_usd: null,
    tool_calls: 4,
    last_tool_call: { name: 'Read', id: 'toolu_04' },
    last_assistant_text:
      'Reading the current schema files to map v4 content types onto v5 component structure.',
    permission_denials: 0,
    log_size_bytes: 22_000,
    log_mtime: now - 3 * 24 * 60 * MINUTE,
  },
]

export const MOCK_HANDOFF = {
  path: '/mock/.claude-handoffs/readme-polish.md',
  content: `# Handoff: readme-polish

## What changed
- Rewrote the top-of-README tagline for clarity
- Added a "Run" section with \`npm install && npm run dev\`
- Added a screenshot placeholder + troubleshooting block

## Verification
- \`npm run build\` green
- Preview looks correct in both light and dark browser chrome

## Follow-ups
- Capture a real screenshot once the dev server is running with mock data
`,
}

export const MOCK_BRIEF = {
  path: '/mock/work/briefs/claude-dispatch-monitor-readme-polish.md',
  content: `# Brief: polish the README

**Project:** claude-dispatch-monitor
**Goal:** make the README clear enough that a stranger can clone + run.

## Scope
- Tighten the opening paragraph
- Add a "Run" section
- Include a screenshot placeholder
- Short "Troubleshooting" block for the common permission issues

## Out of scope
- Marketing copy
- Any change to the code
`,
}
