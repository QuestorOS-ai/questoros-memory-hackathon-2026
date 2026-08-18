import { buildApp } from './app.js';

const port = Number(process.env.PORT || 8788);
const app = buildApp({ serveJudgeUi: true });

await app.listen({ port, host: '0.0.0.0' });
