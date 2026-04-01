import { kv } from "@vercel/kv";
import { Visit } from "./types";

const VISITS_KEY = "visits";
const BLOCKLIST_KEY = "blocklist";
const MAX_VISITS = 10000;

export async function saveVisit(visit: Visit): Promise<void> {
  await kv.lpush(VISITS_KEY, JSON.stringify(visit));
  await kv.ltrim(VISITS_KEY, 0, MAX_VISITS - 1);
}

export async function updateVisitCaptcha(visitorId: string): Promise<void> {
  const visits = await getVisits();
  const idx = visits.findIndex((v) => v.visitorId === visitorId && !v.captchaPassed);
  if (idx === -1) return;
  visits[idx].captchaPassed = true;
  await kv.lset(VISITS_KEY, idx, JSON.stringify(visits[idx]));
}

export async function updateTimeOnPage(visitorId: string, seconds: number): Promise<void> {
  const visits = await getVisits();
  const idx = visits.findIndex((v) => v.visitorId === visitorId);
  if (idx === -1) return;
  visits[idx].timeOnPage = seconds;
  await kv.lset(VISITS_KEY, idx, JSON.stringify(visits[idx]));
}

export async function getVisits(): Promise<Visit[]> {
  const raw = await kv.lrange(VISITS_KEY, 0, -1);
  return raw.map((r) => (typeof r === "string" ? JSON.parse(r) : r)) as Visit[];
}

export async function clearVisits(): Promise<void> {
  await kv.del(VISITS_KEY);
}

export async function getBlocklist(): Promise<string[]> {
  const raw = await kv.get<string>(BLOCKLIST_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export async function addToBlocklist(ip: string): Promise<void> {
  const list = await getBlocklist();
  if (!list.includes(ip)) {
    list.push(ip);
    await kv.set(BLOCKLIST_KEY, JSON.stringify(list));
  }
}

export async function removeFromBlocklist(ip: string): Promise<void> {
  const list = await getBlocklist();
  await kv.set(BLOCKLIST_KEY, JSON.stringify(list.filter((i) => i !== ip)));
}

export async function isBlocked(ip: string): Promise<boolean> {
  const list = await getBlocklist();
  return list.some((blocked) => {
    if (blocked.includes("/")) {
      const [network, bits] = blocked.split("/");
      const mask = ~(2 ** (32 - parseInt(bits)) - 1);
      const ipInt = ip.split(".").reduce((acc, o) => (acc << 8) + parseInt(o), 0);
      const netInt = network.split(".").reduce((acc, o) => (acc << 8) + parseInt(o), 0);
      return (ipInt & mask) === (netInt & mask);
    }
    return blocked === ip;
  });
}
