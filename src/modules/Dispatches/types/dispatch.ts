export type DispatchStatus = 'running' | 'done' | 'failed' | 'orphaned'

export interface ToolCall {
  name: string
  id: string
}

export interface Dispatch {
  project: string
  slug: string
  date: string | null
  stem: string
  log_name: string
  log_path: string
  handoff_path: string | null
  status: DispatchStatus
  events_count: number
  is_complete: boolean
  is_error: boolean
  duration_ms: number | null
  num_turns: number | null
  cost_usd: number | null
  tool_calls: number
  last_tool_call: ToolCall | null
  last_assistant_text: string | null
  permission_denials: number
  log_size_bytes: number
  log_mtime: number | null
}

export interface DispatchesResponse {
  dispatches: Dispatch[]
  mock: boolean
}

export interface MarkdownContent {
  path: string
  content: string
}
