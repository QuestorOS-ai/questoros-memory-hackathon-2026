import { timingSafeEqual } from 'node:crypto';

export type JudgeIdentity = {
  tenantId: string;
  actorId: string;
  credentialScope: {
    scopeType: 'WORKSPACE';
    workspaceId: string;
    projectId: null;
  };
  permissions: string[];
};

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function authenticate(authorization?: string): JudgeIdentity {
  const expected = process.env.JUDGE_API_KEY;
  if (!expected) throw new Error('JUDGE_API_KEY is not configured.');

  const provided = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : '';

  if (!provided || !safeEqual(provided, expected)) {
    const error = new Error('Unauthorized');
    Object.assign(error, { statusCode: 401 });
    throw error;
  }

  return {
    tenantId: process.env.DEMO_TENANT_ID || 'hackathon-tenant',
    actorId: process.env.DEMO_ACTOR_ID || 'hackathon-judge',
    credentialScope: {
      scopeType: 'WORKSPACE',
      workspaceId: process.env.DEMO_WORKSPACE_ID || 'harborview-demo',
      projectId: null,
    },
    permissions: [
      'memory:read',
      'memory:write',
      'memory:correct',
      'memory:delete',
      'memory:embed',
    ],
  };
}
