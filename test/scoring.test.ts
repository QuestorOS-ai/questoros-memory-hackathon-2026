import { describe, expect, it } from 'vitest';
import { explainRetrieval, keywordScore } from '../src/scoring.js';

describe('explainable retrieval', () => {
  it('scores keyword overlap deterministically', () => {
    expect(
      keywordScore(
        'Harborview Tower closing deadline',
        'Harborview Tower closing deadline',
        'The closing deadline is July 15, 2026.',
      ),
    ).toBe(1);
  });

  it('combines vector and keyword evidence with scope reasons', () => {
    const result = explainRetrieval({
      vectorSimilarity: 0.9,
      keywordScore: 0.8,
      tenantId: 'hackathon-tenant',
      workspaceId: 'harborview-demo',
      projectId: null,
    });

    expect(result.finalScore).toBe(0.875);
    expect(result.matchedScope).toContain('tenant:hackathon-tenant');
    expect(result.matchedScope).toContain('workspace:harborview-demo');
    expect(result.reasons).toHaveLength(3);
  });
});
