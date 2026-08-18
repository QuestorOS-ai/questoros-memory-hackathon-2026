export type RetrievalExplanation = {
  vectorSimilarity: number;
  keywordScore: number;
  finalScore: number;
  matchedScope: string[];
  reasons: string[];
};

function tokens(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .split(/[^a-z0-9]+/g)
      .map((token) => token.trim())
      .filter((token) => token.length >= 3),
  );
}

export function keywordScore(query: string, title: string, content: string): number {
  const queryTokens = tokens(query);
  if (queryTokens.size === 0) return 0;
  const documentTokens = tokens(`${title} ${content}`);
  let matched = 0;
  for (const token of queryTokens) {
    if (documentTokens.has(token)) matched += 1;
  }
  return matched / queryTokens.size;
}

export function explainRetrieval(input: {
  vectorSimilarity: number;
  keywordScore: number;
  tenantId: string;
  workspaceId?: string | null;
  projectId?: string | null;
}): RetrievalExplanation {
  const vector = Math.max(0, Math.min(1, input.vectorSimilarity));
  const keyword = Math.max(0, Math.min(1, input.keywordScore));
  const finalScore = Number((vector * 0.75 + keyword * 0.25).toFixed(6));
  const matchedScope = [`tenant:${input.tenantId}`];
  if (input.workspaceId) matchedScope.push(`workspace:${input.workspaceId}`);
  if (input.projectId) matchedScope.push(`project:${input.projectId}`);

  const reasons = [
    `Vector similarity contributed ${(vector * 0.75).toFixed(3)} to the final score.`,
    `Keyword overlap contributed ${(keyword * 0.25).toFixed(3)} to the final score.`,
    `Result matched the authorized ${matchedScope.join(', ')} scope.`,
  ];

  return {
    vectorSimilarity: Number(vector.toFixed(6)),
    keywordScore: Number(keyword.toFixed(6)),
    finalScore,
    matchedScope,
    reasons,
  };
}
