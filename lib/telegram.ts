import { Visit } from "./types";

const PLATFORM_EMOJI: Record<string, string> = {
  Instagram: "📸", TikTok: "🎵", "Twitter/X": "🐦", Facebook: "👥",
  YouTube: "📺", WhatsApp: "💬", Telegram: "✈️", Discord: "🎮",
  Reddit: "🔴", Google: "🔍", Direct: "🔗", Other: "🌐",
};

const DEVICE_EMOJI: Record<string, string> = {
  mobile: "📱", tablet: "📟", desktop: "💻",
};

export async function sendTelegramNotification(visit: Visit): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const platEmoji = PLATFORM_EMOJI[visit.refererPlatform] || "🌐";
  const devEmoji = DEVICE_EMOJI[visit.device] || "💻";
  const flag = visit.countryCode && visit.countryCode !== "??"
    ? String.fromCodePoint(...visit.countryCode.toUpperCase().split("").map((c) => 127397 + c.charCodeAt(0)))
    : "🏳️";

  const returning = visit.isReturning ? "🔁 *Retour*" : "🆕 *Nouveau*";
  const lines = [
    `🔔 *Nouveau visiteur !* ${returning}`,
    ``,
    `${flag} \`${visit.ip}\` — ${visit.city}, ${visit.country}`,
    `${platEmoji} Source : *${visit.refererPlatform}*`,
    `${devEmoji} Device : ${visit.device} · ${visit.os} · ${visit.browser}`,
    `📡 FAI : ${visit.isp}`,
    `🕐 ${new Date(visit.timestamp).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}`,
    visit.utmSource ? `📌 UTM : ${visit.utmSource} / ${visit.utmCampaign}` : "",
  ].filter(Boolean).join("\n");

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: lines, parse_mode: "Markdown" }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {}
}

export async function sendSpikeAlert(count: number): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: `🚨 *Spike de trafic !* ${count} visites en 10 minutes sur ton lien.`,
      parse_mode: "Markdown",
    }),
  });
}
