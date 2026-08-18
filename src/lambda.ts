import { buildApp } from './app.js';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

type ApiGatewayV2Event = {
  rawPath: string;
  rawQueryString?: string;
  headers?: Record<string, string | undefined>;
  cookies?: string[];
  requestContext: {
    http: {
      method: HttpMethod;
    };
  };
  body?: string | null;
  isBase64Encoded?: boolean;
};

type ApiGatewayV2Result = {
  statusCode: number;
  headers: Record<string, string>;
  cookies?: string[];
  body: string;
  isBase64Encoded: false;
};

const app = buildApp({ serveJudgeUi: false });
const appReady = app.ready();

export async function handler(event: ApiGatewayV2Event): Promise<ApiGatewayV2Result> {
  await appReady;

  const query = event.rawQueryString ? `?${event.rawQueryString}` : '';
  const headers: Record<string, string | undefined> = { ...event.headers };
  if (event.cookies?.length) headers.cookie = event.cookies.join('; ');

  const payload = event.body
    ? event.isBase64Encoded
      ? Buffer.from(event.body, 'base64')
      : event.body
    : undefined;

  const response = await app.inject({
    method: event.requestContext.http.method,
    url: `${event.rawPath}${query}`,
    headers,
    payload,
  });

  const responseHeaders: Record<string, string> = {};
  const cookies: string[] = [];

  for (const [name, value] of Object.entries(response.headers)) {
    if (value === undefined) continue;
    if (name.toLowerCase() === 'set-cookie') {
      if (Array.isArray(value)) cookies.push(...value.map(String));
      else cookies.push(String(value));
      continue;
    }
    responseHeaders[name] = Array.isArray(value) ? value.map(String).join(', ') : String(value);
  }

  return {
    statusCode: response.statusCode,
    headers: responseHeaders,
    ...(cookies.length ? { cookies } : {}),
    body: response.body,
    isBase64Encoded: false,
  };
}
