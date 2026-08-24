import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';
import { DEFAULT_RATE_CONFIG } from '../src/data/landingPriceDefaults.js';
import passengerCarRadial from '../src/data/passengerCarRadial.json' with { type: 'json' };
import eternopresa from '../src/data/eternopresa.json' with { type: 'json' };
import celestra from '../src/data/celestra.json' with { type: 'json' };
import lcv from '../src/data/lcv.json' with { type: 'json' };
import truckLightTruck from '../src/data/truckLightTruck.json' with { type: 'json' };
import twoThreeWheeler from '../src/data/twoThreeWheeler.json' with { type: 'json' };

let cachedClient;
let seedPromise;

const categories = [
  passengerCarRadial,
  eternopresa,
  celestra,
  lcv,
  truckLightTruck,
  twoThreeWheeler,
];

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(body));
}

function getPath(req) {
  return new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname
    .replace(/^\/api\/?/, '')
    .split('/')
    .filter(Boolean)
    .map((part) => decodeURIComponent(part));
}

function getBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body); } catch { return {}; }
}

async function getDatabase() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not configured');
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URI);
    await cachedClient.connect();
  }
  const database = cachedClient.db(process.env.MONGODB_DB || 'ferentino');
  await seedDatabase(database);
  return database;
}

async function seedDatabase(database) {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    const tyres = database.collection('tyres');
    if (await tyres.countDocuments() > 0) return;
    const documents = categories.flatMap((category) => category.groups.flatMap((group) =>
      group.items.map((item) => ({
        category: category.label,
        groupLabel: group.groupLabel,
        ...item,
      }))
    ));
    if (documents.length) await tyres.insertMany(documents);
  })().catch((error) => {
    seedPromise = undefined;
    throw error;
  });
  return seedPromise;
}

function requireAuth(req) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token || !process.env.JWT_SECRET) return null;
  try { return jwt.verify(token, process.env.JWT_SECRET); } catch { return null; }
}

function makeToken(username) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  return jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '12h' });
}

function ensureAdmin(req, res) {
  if (requireAuth(req)) return true;
  json(res, 401, { error: 'Unauthorized' });
  return false;
}

function getCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD,
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const path = getPath(req);
  try {
    if (path[0] === 'auth' && path[1] === 'login' && req.method === 'POST') {
      const { username, password } = getBody(req);
      const credentials = getCredentials();
      if (!credentials.password || username !== credentials.username || password !== credentials.password) {
        return json(res, 401, { error: 'Invalid username or password.' });
      }
      return json(res, 200, { token: makeToken(username) });
    }

    const database = await getDatabase();
    if (path[0] === 'tyres' && req.method === 'GET') {
      return json(res, 200, await database.collection('tyres').find({}, { projection: { _id: 0 } }).toArray());
    }
    if (path[0] === 'price-overrides' && req.method === 'GET') {
      return json(res, 200, await database.collection('priceOverrides').find({}, { projection: { _id: 0 } }).toArray());
    }
    if (path[0] === 'price-overrides' && path[1] && req.method === 'PUT' && ensureAdmin(req, res)) {
      const body = getBody(req);
      const allowedFields = ['exVat', 'incVat', 'discount', 'FTC', 'CEAT', 'DSI', 'MRF'];
      if (!allowedFields.includes(body.field)) return json(res, 400, { error: 'Invalid price field.' });
      const key = path[1];
      await database.collection('priceOverrides').updateOne(
        { rowKey: key },
        { $set: { rowKey: key, categoryId: body.categoryId, size: body.size, pattern: body.pattern, [body.field]: body.value } },
        { upsert: true }
      );
      return json(res, 200, { success: true });
    }
    if (path[0] === 'rate-configs' && req.method === 'GET' && ensureAdmin(req, res)) {
      return json(res, 200, await database.collection('rateConfigs').find({}, { projection: { _id: 0 } }).toArray());
    }
    if (path[0] === 'rate-configs' && path[1] && path[2] && req.method === 'PUT' && ensureAdmin(req, res)) {
      const body = getBody(req);
      const brand = path[2];
      const defaults = DEFAULT_RATE_CONFIG[brand];
      if (!defaults || (!body.stepKey && body.focRatio === undefined)) return json(res, 400, { error: 'Invalid rate configuration.' });
      const key = { categoryId: path[1], brand };
      const current = await database.collection('rateConfigs').findOne(key) || { ...defaults, ...key };
      const update = body.stepKey
        ? { steps: current.steps.map((step) => step.key === body.stepKey ? { ...step, rate: Number(body.rate) } : step) }
        : { focRatio: body.focRatio === null ? null : Number(body.focRatio) };
      await database.collection('rateConfigs').updateOne(key, { $set: { ...current, ...update } }, { upsert: true });
      return json(res, 200, { success: true });
    }
    if (path[0] === 'dealer-prices' && req.method === 'GET' && ensureAdmin(req, res)) {
      return json(res, 200, await database.collection('dealerPrices').find({}, { projection: { _id: 0 } }).toArray());
    }
    if (path[0] === 'dealer-prices' && path[1] && req.method === 'PUT' && ensureAdmin(req, res)) {
      const body = getBody(req);
      if (!['ftcExVat', 'CEAT', 'DSI', 'MRF'].includes(body.field)) return json(res, 400, { error: 'Invalid dealer price field.' });
      await database.collection('dealerPrices').updateOne(
        { rowKey: path[1] },
        { $set: { rowKey: path[1], [body.field]: body.value } },
        { upsert: true }
      );
      return json(res, 200, { success: true });
    }
    return json(res, 404, { error: 'Not found' });
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: 'Server error' });
  }
}