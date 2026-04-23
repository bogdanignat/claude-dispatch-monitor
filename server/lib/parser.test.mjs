import { describe, it, expect } from 'vitest'
import { parseSlugFromLogName } from './parser.mjs'

describe('parseSlugFromLogName', () => {
  it('parses a single-word project', () => {
    expect(parseSlugFromLogName('demo-20260423-add-tests.log')).toEqual({
      project: 'demo',
      date: '20260423',
      slug: 'add-tests',
      stem: 'demo-20260423-add-tests',
    })
  })

  it('parses a project whose name contains hyphens', () => {
    // The bug in the original dashboard: split('-') returned project='claude'.
    expect(parseSlugFromLogName('claude-dispatch-monitor-20260423-add-tests.log')).toEqual({
      project: 'claude-dispatch-monitor',
      date: '20260423',
      slug: 'add-tests',
      stem: 'claude-dispatch-monitor-20260423-add-tests',
    })
  })

  it('strips the optional HHmm token', () => {
    expect(parseSlugFromLogName('demo-20260423-0930-add-tests.log')).toEqual({
      project: 'demo',
      date: '20260423',
      slug: 'add-tests',
      stem: 'demo-20260423-0930-add-tests',
    })
  })

  it('falls back when the filename does not match the format', () => {
    expect(parseSlugFromLogName('weird-name.log')).toEqual({
      project: 'unknown',
      date: null,
      slug: 'weird-name',
      stem: 'weird-name',
    })
  })
})
