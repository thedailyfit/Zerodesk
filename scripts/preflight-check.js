const https = require('https');
const http = require('http');

async function testHttp(url, options = {}) {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const client = parsed.protocol === 'https:' ? https : http;
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    });
    req.on('error', (err) => resolve({ error: err.message }));
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runPreflight() {
  console.log('====================================================');
  console.log('🔍 ZeroDesk Pre-Launch Health & Preflight Audit');
  console.log('====================================================\n');

  const results = [];

  // 1. Database
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    try {
      const { Client } = require('pg');
      const client = new Client({ connectionString: dbUrl, ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false } });
      await client.connect();
      await client.query('SELECT 1;');
      await client.end();
      results.push({ service: 'PostgreSQL Database', status: '✅ PASS', detail: 'Connection verified' });
    } catch (e) {
      results.push({ service: 'PostgreSQL Database', status: '❌ FAIL', detail: e.message });
    }
  } else {
    results.push({ service: 'PostgreSQL Database', status: '⚠️ SKIPPED', detail: 'DATABASE_URL not set' });
  }

  // 2. Redis
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    try {
      const Redis = require('ioredis');
      const redis = new Redis(redisUrl, { lazyConnect: true, connectTimeout: 3000 });
      await redis.connect();
      await redis.ping();
      await redis.disconnect();
      results.push({ service: 'Redis Cache & Queues', status: '✅ PASS', detail: 'PING -> PONG' });
    } catch (e) {
      results.push({ service: 'Redis Cache & Queues', status: '❌ FAIL', detail: e.message });
    }
  } else {
    results.push({ service: 'Redis Cache & Queues', status: '⚠️ SKIPPED', detail: 'REDIS_URL not set' });
  }

  // 3. OpenAI API
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey && !openaiKey.startsWith('sk-xxx') && !openaiKey.startsWith('sk-dummy')) {
    const res = await testHttp('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: { Authorization: `Bearer ${openaiKey}` },
    });
    if (res.statusCode === 200) {
      results.push({ service: 'OpenAI API (LLM & Whisper)', status: '✅ PASS', detail: 'Valid API Key' });
    } else {
      results.push({ service: 'OpenAI API (LLM & Whisper)', status: '❌ FAIL', detail: `HTTP ${res.statusCode}` });
    }
  } else {
    results.push({ service: 'OpenAI API (LLM & Whisper)', status: '⚠️ SKIPPED', detail: 'Using placeholder key' });
  }

  // 4. LiveKit Cloud
  const lkUrl = process.env.LIVEKIT_URL;
  const lkKey = process.env.LIVEKIT_API_KEY;
  const lkSecret = process.env.LIVEKIT_API_SECRET;
  if (lkUrl && lkKey && lkSecret) {
    results.push({ service: 'LiveKit Cloud (Voice WebRTC)', status: '✅ CONFIGURED', detail: `${lkUrl} (Key: ${lkKey.substring(0, 6)}...)` });
  } else {
    results.push({ service: 'LiveKit Cloud (Voice WebRTC)', status: '⚠️ INCOMPLETE', detail: 'Keys missing' });
  }

  // 5. Sarvam AI
  const sarvamKey = process.env.SARVAM_API_KEY;
  if (sarvamKey && !sarvamKey.startsWith('sk_xxx')) {
    results.push({ service: 'Sarvam AI (Indic STT)', status: '✅ CONFIGURED', detail: 'API Key present' });
  } else {
    results.push({ service: 'Sarvam AI (Indic STT)', status: '⚠️ SKIPPED', detail: 'Placeholder key' });
  }

  // 6. Meta WhatsApp
  const waToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (waToken && waToken !== 'xxx' && waPhoneId && waPhoneId !== 'xxx') {
    const res = await testHttp(`https://graph.facebook.com/v18.0/${waPhoneId}`, {
      headers: { Authorization: `Bearer ${waToken}` },
    });
    if (res.statusCode === 200) {
      results.push({ service: 'Meta WhatsApp Cloud API', status: '✅ PASS', detail: 'Phone Number ID active' });
    } else {
      results.push({ service: 'Meta WhatsApp Cloud API', status: '❌ FAIL', detail: `HTTP ${res.statusCode}` });
    }
  } else {
    results.push({ service: 'Meta WhatsApp Cloud API', status: '⚠️ PENDING', detail: 'Need production token & phone ID' });
  }

  // Summary Table
  console.log('Platform Component Status:');
  console.table(results);
  console.log('\nAudit complete.\n');
}

runPreflight();
