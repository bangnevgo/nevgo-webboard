import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from '@woocommerce/woocommerce-rest-api';
const WooCommerceRestApi = pkg.default;
import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const SETTINGS_FILE = path.join(__dirname, 'settings.json');

// WooCommerce API Client — baca dari settings.json setiap request
function getWooCommerce() {
  let wc = {};
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const s = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
      wc = s?.connectionCredentials?.woocommerce || {};
    }
  } catch {}
  return new WooCommerceRestApi({
    url: wc.storeUrl || process.env.WC_URL || 'https://nevgoinstitute.com',
    consumerKey: wc.consumerKey || process.env.WC_CONSUMER_KEY || '',
    consumerSecret: wc.consumerSecret || process.env.WC_CONSUMER_SECRET || '',
    version: 'wc/v3'
  });
}

app.use(express.json());

// CORS for Vite dev server
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  next();
});

// GET settings
app.get('/settings', (req, res) => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      res.json(JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')));
    } else {
      res.json({});
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST settings
app.post('/settings', (req, res) => {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(req.body, null, 2));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════════════════════
//  WOOCOMMERCE ENDPOINTS
// ═══════════════════════════════════════════════════════

// Revenue hari ini
app.get('/api/revenue/today', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 1;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    if (days === 1) since.setHours(0, 0, 0, 0);
    
    const { data: orders } = await getWooCommerce().get('orders', {
      after: since.toISOString(),
      status: 'completed',
      per_page: 100
    });

    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total), 0);
    const totalTx = orders.length;
    const avgOrderValue = totalTx > 0 ? totalRevenue / totalTx : 0;

    res.json({
      revenue: totalRevenue,
      transactions: totalTx,
      aov: avgOrderValue,
      orders: orders
    });
  } catch (error) {
    console.error('Today revenue error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch today revenue' });
  }
});

// Revenue 7 hari
app.get('/api/revenue/weekly', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const { data: orders } = await getWooCommerce().get('orders', {
      after: since.toISOString(),
      status: 'completed',
      per_page: 100
    });

    const revenueByDay = {};
    orders.forEach(order => {
      const date = new Date(order.date_created);
      const dayKey = date.toLocaleDateString('id-ID', { weekday: 'short' });
      
      if (!revenueByDay[dayKey]) {
        revenueByDay[dayKey] = { day: dayKey, rev: 0, tx: 0 };
      }
      
      revenueByDay[dayKey].rev += parseFloat(order.total);
      revenueByDay[dayKey].tx += 1;
    });

    res.json(Object.values(revenueByDay));
  } catch (error) {
    console.error('Weekly revenue error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch weekly revenue' });
  }
});

// Top products
app.get('/api/products/top', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const { data: orders } = await getWooCommerce().get('orders', {
      after: since.toISOString(),
      status: 'completed',
      per_page: 100
    });

    const productStats = {};
    
    orders.forEach(order => {
      order.line_items.forEach(item => {
        const id = item.product_id;
        if (!productStats[id]) {
          productStats[id] = {
            name: item.name,
            sales: 0,
            revenue: 0
          };
        }
        productStats[id].sales += item.quantity;
        productStats[id].revenue += parseFloat(item.total);
      });
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    res.json(topProducts);
  } catch (error) {
    console.error('Products error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ═══════════════════════════════════════════════════════
//  GOOGLE ANALYTICS 4 ENDPOINTS
// ═══════════════════════════════════════════════════════

async function getGA4Client(settings) {
  const ga4Config = settings?.connectionCredentials?.ga4;
  if (!ga4Config?.propertyId || !ga4Config?.serviceAccount) {
    throw new Error('GA4 not configured');
  }

  const credentials = typeof ga4Config.serviceAccount === 'string'
    ? JSON.parse(ga4Config.serviceAccount)
    : ga4Config.serviceAccount;

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  });

  const analyticsData = google.analyticsdata('v1beta');
  const authClient = await auth.getClient();

  return { analyticsData, authClient, propertyId: ga4Config.propertyId };
}

app.get('/api/ga4/realtime', async (req, res) => {
  try {
    const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    const { analyticsData, authClient, propertyId } = await getGA4Client(settings);

    const response = await analyticsData.properties.runRealtimeReport({
      auth: authClient,
      property: `properties/${propertyId}`,
      requestBody: { metrics: [{ name: 'activeUsers' }] },
    });

    const activeUsers = response.data.rows?.[0]?.metricValues?.[0]?.value || '0';
    res.json({ activeUsers: parseInt(activeUsers) });
  } catch (error) {
    console.error('GA4 realtime error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/ga4/today', async (req, res) => {
  try {
    const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    const { analyticsData, authClient, propertyId } = await getGA4Client(settings);

    const days = parseInt(req.query.days) || 1;
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await analyticsData.properties.runReport({
      auth: authClient,
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'totalUsers' },
        ],
      },
    });

    const metrics = response.data.rows?.[0]?.metricValues || [];
    res.json({
      sessions: parseInt(metrics[0]?.value || '0'),
      pageViews: parseInt(metrics[1]?.value || '0'),
      users: parseInt(metrics[2]?.value || '0'),
    });
  } catch (error) {
    console.error('GA4 today error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/ga4/top-pages', async (req, res) => {
  try {
    const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    const { analyticsData, authClient, propertyId } = await getGA4Client(settings);

    const days = parseInt(req.query.days) || 7;
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await analyticsData.properties.runReport({
      auth: authClient,
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 5,
      },
    });

    const pages = response.data.rows?.map(row => ({
      path: row.dimensionValues[0].value,
      title: row.dimensionValues[1].value,
      views: parseInt(row.metricValues[0].value),
    })) || [];

    res.json(pages);
  } catch (error) {
    console.error('GA4 top pages error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════
//  GOOGLE SEARCH CONSOLE ENDPOINTS
// ═══════════════════════════════════════════════════════

async function getGSCClient(settings) {
  const ga4Config = settings?.connectionCredentials?.ga4;
  if (!ga4Config?.serviceAccount) {
    throw new Error('Service account not configured');
  }

  const credentials = typeof ga4Config.serviceAccount === 'string'
    ? JSON.parse(ga4Config.serviceAccount)
    : ga4Config.serviceAccount;

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  const authClient = await auth.getClient();
  const searchconsole = google.searchconsole('v1');
  const siteUrl = settings?.connectionCredentials?.searchConsole?.siteUrl || 'https://nevgoinstitute.com/';

  return { searchconsole, authClient, siteUrl };
}

app.get('/api/gsc/summary', async (req, res) => {
  try {
    const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    const { searchconsole, authClient, siteUrl } = await getGSCClient(settings);

    const days = parseInt(req.query.days) || 7;
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await searchconsole.searchanalytics.query({
      auth: authClient,
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        metrics: ['clicks', 'impressions', 'ctr', 'position'],
      },
    });

    const row = response.data.rows?.[0] || {};
    res.json({
      clicks: Math.round(row.clicks || 0),
      impressions: Math.round(row.impressions || 0),
      ctr: parseFloat((row.ctr || 0) * 100).toFixed(1),
      position: parseFloat(row.position || 0).toFixed(1),
    });
  } catch (error) {
    console.error('GSC summary error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/gsc/keywords', async (req, res) => {
  try {
    const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    const { searchconsole, authClient, siteUrl } = await getGSCClient(settings);

    const days = parseInt(req.query.days) || 7;
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await searchconsole.searchanalytics.query({
      auth: authClient,
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query'],
        metrics: ['clicks', 'impressions', 'ctr', 'position'],
        rowLimit: 10,
        orderBy: [{ fieldName: 'clicks', sortOrder: 'DESCENDING' }],
      },
    });

    const keywords = response.data.rows?.map(row => ({
      keyword: row.keys[0],
      clicks: Math.round(row.clicks),
      impressions: Math.round(row.impressions),
      ctr: parseFloat((row.ctr * 100).toFixed(1)),
      position: parseFloat(row.position.toFixed(1)),
    })) || [];

    res.json(keywords);
  } catch (error) {
    console.error('GSC keywords error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/gsc/pages', async (req, res) => {
  try {
    const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    const { searchconsole, authClient, siteUrl } = await getGSCClient(settings);

    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await searchconsole.searchanalytics.query({
      auth: authClient,
      siteUrl,
      requestBody: {
        startDate: weekAgo,
        endDate: today,
        dimensions: ['page'],
        metrics: ['clicks', 'impressions', 'position'],
        rowLimit: 5,
        orderBy: [{ fieldName: 'clicks', sortOrder: 'DESCENDING' }],
      },
    });

    const pages = response.data.rows?.map(row => ({
      page: row.keys[0].replace('https://nevgoinstitute.com', ''),
      clicks: Math.round(row.clicks),
      impressions: Math.round(row.impressions),
      position: parseFloat(row.position.toFixed(1)),
    })) || [];

    res.json(pages);
  } catch (error) {
    console.error('GSC pages error:', error.message);
    res.status(500).json({ error: error.message });
  }
});


// ═══════════════════════════════════════════════════════
//  LMS / STUDENTS ENDPOINTS (via WooCommerce orders)
// ═══════════════════════════════════════════════════════

app.get('/api/students/summary', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Fetch semua completed orders sesuai range
    const { data: orders } = await getWooCommerce().get('orders', {
      after: since.toISOString(),
      status: 'completed',
      per_page: 100,
    });

    // Enrollment per produk
    const enrollmentByProduct = {};
    let totalToday = 0;
    let totalWeek = 0;

    orders.forEach(order => {
      const orderDate = new Date(order.date_created);
      const isToday = orderDate >= today;
      const isThisWeek = orderDate >= weekAgo;

      order.line_items.forEach(item => {
        const name = item.name;
        if (!enrollmentByProduct[name]) {
          enrollmentByProduct[name] = { name, total: 0, thisWeek: 0, today: 0, revenue: 0 };
        }
        enrollmentByProduct[name].total += item.quantity;
        enrollmentByProduct[name].revenue += parseFloat(item.total);
        if (isThisWeek) enrollmentByProduct[name].thisWeek += item.quantity;
        if (isToday) enrollmentByProduct[name].today += item.quantity;
      });

      if (isToday) totalToday++;
      if (isThisWeek) totalWeek++;
    });

    const courses = Object.values(enrollmentByProduct)
      .filter(p => p.revenue > 0) // hanya produk berbayar
      .sort((a, b) => b.total - a.total);

    // Total unique buyers (by billing email) = proxy untuk total siswa
    const uniqueEmails = new Set(orders.map(o => o.billing?.email).filter(Boolean));

    res.json({
      totalStudents: uniqueEmails.size,
      newToday: totalToday,
      newThisWeek: totalWeek,
      courses,
    });
  } catch (error) {
    console.error('Students summary error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch students data' });
  }
});

// Enrollment trend 7 hari (untuk chart)
app.get('/api/students/trend', async (req, res) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const { data: orders } = await getWooCommerce().get('orders', {
      after: weekAgo.toISOString(),
      status: 'completed',
      per_page: 100,
    });

    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const trendMap = {};

    // Init 7 hari
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      trendMap[key] = { day: days[d.getDay()], enrollments: 0 };
    }

    orders.forEach(order => {
      const key = new Date(order.date_created).toISOString().split('T')[0];
      if (trendMap[key]) trendMap[key].enrollments += order.line_items.reduce((s, i) => s + i.quantity, 0);
    });

    res.json(Object.values(trendMap));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trend data' });
  }
});

// ═══════════════════════════════════════════════════════
//  COMPETITOR PIPELINE ENDPOINTS
// ═══════════════════════════════════════════════════════

const COMPETITORS_FILE = path.join(__dirname, 'competitors.json');

// Simpan hasil analisa dari Pipeline Agent
app.post('/api/competitors/save', async (req, res) => {
  try {
    const data = req.body; // { competitors[], swot{}, recommendations[], analyzedAt }
    await fs.promises.writeFile(COMPETITORS_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Baca data untuk Competitors Tab
app.get('/api/competitors/data', async (req, res) => {
  try {
    const raw = await fs.promises.readFile(COMPETITORS_FILE, 'utf-8');
    res.json(JSON.parse(raw));
  } catch {
    res.json(null); // belum ada data
  }
});


// ═══════════════════════════════════════════════════════
//  PIPELINE AGENT — 3 FASE: SCOUTING → REASONING → ACTING
// ═══════════════════════════════════════════════════════

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Helper: Tavily Search
async function tavilySearch(query) {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: TAVILY_API_KEY,
      query,
      search_depth: 'advanced',
      include_answer: true,
      include_raw_content: false,
      max_results: 5,
    }),
  });
  if (!res.ok) throw new Error(`Tavily error: ${res.status}`);
  const data = await res.json();
  return {
    query,
    answer: data.answer || null,
    results: (data.results || []).map(r => ({
      title: r.title,
      url: r.url,
      snippet: r.content?.slice(0, 400),
    })),
  };
}

// Helper: OpenRouter LLM call
async function callLLM(systemPrompt, userPrompt) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'anthropic/claude-haiku-4-5',
      max_tokens: 3000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// Helper: Fetch Nevgo live data (GSC + GA4 + WooCommerce)
async function fetchNevgoData(settings) {
  const data = {};

  // GSC
  try {
    const { searchconsole, authClient, siteUrl } = await getGSCClient(settings);
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const [summary, keywords] = await Promise.all([
      searchconsole.searchanalytics.query({
        auth: authClient, siteUrl,
        requestBody: { startDate: weekAgo, endDate: today, metrics: ['clicks', 'impressions', 'ctr', 'position'] },
      }),
      searchconsole.searchanalytics.query({
        auth: authClient, siteUrl,
        requestBody: { startDate: weekAgo, endDate: today, dimensions: ['query'], metrics: ['clicks', 'impressions', 'position'], rowLimit: 10, orderBy: [{ fieldName: 'clicks', sortOrder: 'DESCENDING' }] },
      }),
    ]);
    const row = summary.data.rows?.[0] || {};
    data.gsc = {
      clicks: Math.round(row.clicks || 0),
      impressions: Math.round(row.impressions || 0),
      ctr: parseFloat((row.ctr || 0) * 100).toFixed(1),
      position: parseFloat(row.position || 0).toFixed(1),
      keywords: (keywords.data.rows || []).map(r => ({
        keyword: r.keys[0],
        clicks: Math.round(r.clicks),
        position: parseFloat(r.position.toFixed(1)),
      })),
    };
  } catch (e) { data.gsc = { error: e.message }; }

  // GA4
  try {
    const { analyticsData, authClient, propertyId } = await getGA4Client(settings);
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const [realtime, weekly, pages] = await Promise.all([
      analyticsData.properties.runRealtimeReport({ auth: authClient, property: `properties/${propertyId}`, requestBody: { metrics: [{ name: 'activeUsers' }] } }),
      analyticsData.properties.runReport({ auth: authClient, property: `properties/${propertyId}`, requestBody: { dateRanges: [{ startDate: weekAgo, endDate: today }], metrics: [{ name: 'sessions' }, { name: 'totalUsers' }] } }),
      analyticsData.properties.runReport({ auth: authClient, property: `properties/${propertyId}`, requestBody: { dateRanges: [{ startDate: weekAgo, endDate: today }], dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }], orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }], limit: 5 } }),
    ]);
    const wMetrics = weekly.data.rows?.[0]?.metricValues || [];
    data.ga4 = {
      activeUsers: parseInt(realtime.data.rows?.[0]?.metricValues?.[0]?.value || '0'),
      sessions: parseInt(wMetrics[0]?.value || '0'),
      users: parseInt(wMetrics[1]?.value || '0'),
      topPages: (pages.data.rows || []).map(r => ({ path: r.dimensionValues[0].value, views: parseInt(r.metricValues[0].value) })),
    };
  } catch (e) { data.ga4 = { error: e.message }; }

  // WooCommerce revenue 7 hari
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const { data: orders } = await getWooCommerce().get('orders', { after: weekAgo.toISOString(), status: 'completed', per_page: 100 });
    data.woocommerce = {
      revenue7d: orders.reduce((s, o) => s + parseFloat(o.total), 0),
      transactions7d: orders.length,
    };
  } catch (e) { data.woocommerce = { error: e.message }; }

  return data;
}

// Helper: Kirim WhatsApp via WhatsApp Business API
async function sendWhatsApp(settings, message) {
  const wa = settings?.connectionCredentials?.whatsapp;
  const adminPhone = settings?.general?.adminWhatsapp;
  if (!wa?.phoneNumberId || !wa?.accessToken || !adminPhone) {
    console.warn('[Pipeline] WhatsApp not configured, skipping.');
    return false;
  }
  const res = await fetch(`https://graph.facebook.com/v18.0/${wa.phoneNumberId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${wa.accessToken}` },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: adminPhone,
      type: 'text',
      text: { body: message },
    }),
  });
  return res.ok;
}

// MAIN ENDPOINT
app.post('/api/pipeline/run', async (req, res) => {
  if (!TAVILY_API_KEY) return res.status(400).json({ error: 'TAVILY_API_KEY tidak di-set di .env' });
  if (!OPENROUTER_API_KEY) return res.status(400).json({ error: 'OPENROUTER_API_KEY tidak di-set di .env' });

  try {
    const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    const instruction = req.body?.instruction || "";

    // FASE 1: SCOUTING — query default + query dari instruksi user jika ada
    console.log('[Pipeline] Fase 1: Scouting...', instruction ? `Instruksi: "${instruction}"` : '(default)');
    const defaultQueries = [
      tavilySearch('kursus manifestasi law of assumption online Indonesia 2026'),
      tavilySearch('platform belajar manifestasi sertifikasi trainer Indonesia'),
      tavilySearch('kompetitor nevgoinstitute.com manifestasi LOAS Indonesia'),
    ];
    // Kalau user kasih instruksi, tambah search query spesifik dari instruksi itu
    if (instruction) {
      defaultQueries.push(tavilySearch(`${instruction} Indonesia manifestasi LOAS`));
    }
    const scoutingResults = await Promise.all(defaultQueries);
    console.log('[Pipeline] Scouting selesai:', scoutingResults.map(s => s.query));

    // FASE 2: REASONING
    console.log('[Pipeline] Fase 2: Reasoning...');
    const nevgoData = await fetchNevgoData(settings);

    const systemPrompt = `Kamu adalah Competitor Intelligence Analyst untuk Nevgo Institute — platform edukasi Law of Assumption (LOAS) Indonesia.

NEVGO INSTITUTE:
- Produk: Mini Course (Rp 74K), Program Intensif, Ebook Bundle, Mentoring, Kelas Trainer/Sertifikasi
- Strengths: brand Bang Nevgo, kurikulum Neville Goddard, B2B corporate training, sertifikasi trainer
- Target audience: orang Indonesia tertarik manifestasi, spiritual growth, LOAS

TUGASMU:
1. Analisis hasil scouting web — identifikasi kompetitor nyata yang ditemukan
2. Bandingkan posisi Nevgo (dari data GSC/GA4) vs kompetitor yang ditemukan
3. Temukan keyword gap dan peluang konten berdasarkan data nyata
4. Buat rekomendasi taktis yang spesifik dan actionable

ATURAN KETAT:
- Gunakan HANYA data dari scouting dan data Nevgo yang diberikan
- Jangan karang angka — kalau tidak ada data spesifik, tulis null
- Jawab dalam Bahasa Indonesia
- WAJIB akhiri response dengan JSON block

JSON OUTPUT WAJIB di akhir response:
\`\`\`json
{
  "competitors": [
    {
      "name": "domain atau nama platform yang ditemukan",
      "threat": "high|medium|low",
      "traffic": null,
      "change": null,
      "newProduct": null,
      "content": null,
      "topKW": ["keyword yang mereka rank berdasarkan temuan"]
    }
  ],
  "swot": {
    "strengths": ["strength Nevgo yang terbukti dari perbandingan data"],
    "weaknesses": ["gap nyata berdasarkan temuan scouting"]
  },
  "recommendations": ["aksi spesifik dan konkret berdasarkan data"]
}
\`\`\``;

    const userPrompt = `${instruction ? `FOKUS ANALISIS: ${instruction}\n\n` : ""}INSTRUKSI OUTPUT:
Response kamu HARUS diakhiri dengan JSON block berikut. Ini WAJIB, jangan dilewati:

\`\`\`json
{
  "competitors": [{"name": "...", "threat": "high|medium|low", "traffic": null, "change": null, "newProduct": null, "content": null, "topKW": ["..."]}],
  "swot": {"strengths": ["..."], "weaknesses": ["..."]},
  "recommendations": ["..."]
}
\`\`\`

DATA SCOUTING WEB:
${JSON.stringify(scoutingResults, null, 2)}

DATA NEVGO SAAT INI:
${JSON.stringify(nevgoData, null, 2)}

Tulis analisis singkat (maks 800 kata), lalu WAJIB tutup dengan JSON block di atas yang sudah diisi.`;

    const analysis = await callLLM(systemPrompt, userPrompt);
    console.log('[Pipeline] Reasoning selesai, panjang response:', analysis.length);

    // Call ke-2: extract JSON terstruktur dari analisis
    console.log('[Pipeline] Extracting structured JSON...');
    const jsonPrompt = `Dari analisis kompetitor berikut, ekstrak data terstruktur dalam format JSON.
Isi field berdasarkan informasi yang ADA di analisis. Kalau tidak ada data spesifik, gunakan null.
BALAS HANYA DENGAN JSON — tidak ada teks lain, tidak ada penjelasan.

FORMAT:
{"competitors":[{"name":"string","threat":"high|medium|low","traffic":null,"change":null,"newProduct":null,"content":null,"topKW":["string"]}],"swot":{"strengths":["string"],"weaknesses":["string"]},"recommendations":["string"]}

ANALISIS:
${analysis.slice(0, 3000)}`;

    const jsonRaw = await callLLM('Kamu adalah JSON extractor. Balas HANYA dengan valid JSON, tidak ada teks lain.', jsonPrompt);
    console.log('[Pipeline] JSON raw response:', jsonRaw.slice(0, 200));

    let structuredData = null;
    try {
      // Coba parse langsung, atau cari JSON object di response
      const cleaned = jsonRaw.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      structuredData = JSON.parse(cleaned);
      structuredData.analyzedAt = new Date().toISOString();
      await fs.promises.writeFile(COMPETITORS_FILE, JSON.stringify(structuredData, null, 2));
      console.log('[Pipeline] competitors.json updated, kompetitor ditemukan:', structuredData.competitors?.length);
    } catch (e) {
      console.error('[Pipeline] JSON parse error:', e.message, '| Raw:', jsonRaw.slice(0, 300));
    }

    // FASE 3: ACTING — WhatsApp
    console.log('[Pipeline] Fase 3: Acting...');
    const analysisText = analysis.replace(/```json[\s\S]*?```/, '').trim();
    const waMessage = `*Competitor Intelligence Report*\n${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}\n\n${analysisText.slice(0, 1500)}${analysisText.length > 1500 ? '\n\n_Lihat dashboard untuk laporan lengkap_' : ''}`;
    const waSent = await sendWhatsApp(settings, waMessage);

    res.json({
      success: true,
      analyzedAt: structuredData?.analyzedAt || new Date().toISOString(),
      competitorsFound: structuredData?.competitors?.length || 0,
      whatsappSent: waSent,
      summary: analysisText.slice(0, 300),
    });

  } catch (error) {
    console.error('[Pipeline] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3002, () => console.log('Settings server running on http://localhost:3002'));

// ═══════════════════════════════════════════════════════
//  MIDTRANS ENDPOINTS
// ═══════════════════════════════════════════════════════

function getMidtransAuth() {
  let serverKey = '';
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const s = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
      serverKey = s?.connectionCredentials?.paymentGateway?.serverKey || '';
    }
  } catch {}
  if (!serverKey) serverKey = process.env.MIDTRANS_SERVER_KEY || '';
  return serverKey;
}

// Summary: total transaksi, success rate, failed, revenue settlement
app.get('/api/midtrans/summary', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const { data: orders } = await getWooCommerce().get('orders', {
      after: since.toISOString(),
      per_page: 100,
    });

    const summary = {
      total: orders.length,
      completed: orders.filter(o => o.status === 'completed').length,
      processing: orders.filter(o => o.status === 'processing').length,
      pending: orders.filter(o => o.status === 'pending').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      failed: orders.filter(o => o.status === 'failed').length,
      refunded: orders.filter(o => o.status === 'refunded').length,
      revenue_settled: orders
        .filter(o => o.status === 'completed')
        .reduce((s, o) => s + parseFloat(o.total), 0),
      revenue_processing: orders
        .filter(o => o.status === 'processing')
        .reduce((s, o) => s + parseFloat(o.total), 0),
    };

    summary.success_rate = summary.total > 0
      ? parseFloat(((summary.completed + summary.processing) / summary.total * 100).toFixed(1))
      : 0;

    res.json(summary);
  } catch (error) {
    console.error('Midtrans summary error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Payment method breakdown dari WooCommerce order meta
app.get('/api/midtrans/payment-methods', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const { data: orders } = await getWooCommerce().get('orders', {
      after: since.toISOString(),
      status: ['completed', 'processing'],
      per_page: 100,
    });

    const methodMap = {};
    orders.forEach(order => {
      const method = order.payment_method_title || order.payment_method || 'Other';
      if (!methodMap[method]) methodMap[method] = { name: method, count: 0, revenue: 0 };
      methodMap[method].count += 1;
      methodMap[method].revenue += parseFloat(order.total);
    });

    const total = orders.length || 1;
    const methods = Object.values(methodMap)
      .map(m => ({ ...m, percentage: parseFloat((m.count / total * 100).toFixed(1)) }))
      .sort((a, b) => b.count - a.count);

    res.json(methods);
  } catch (error) {
    console.error('Midtrans payment methods error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Failed & cancelled transactions detail
app.get('/api/midtrans/failed', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const { data: orders } = await getWooCommerce().get('orders', {
      after: since.toISOString(),
      status: ['failed', 'cancelled', 'pending'],
      per_page: 50,
    });

    const failed = orders.map(o => ({
      id: o.id,
      status: o.status,
      total: parseFloat(o.total),
      date: o.date_created,
      customer: o.billing?.first_name + ' ' + o.billing?.last_name,
      payment_method: o.payment_method_title || o.payment_method || '—',
      items: o.line_items?.map(i => i.name).join(', '),
    }));

    res.json(failed);
  } catch (error) {
    console.error('Midtrans failed error:', error.message);
    res.status(500).json({ error: error.message });
  }
});
