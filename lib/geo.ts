interface GeoResult {
  country: string;
  countryCode: string;
  city: string;
  isp: string;
}

export async function getGeoData(ip: string): Promise<GeoResult> {
  const cleanIp = ip.replace("::ffff:", "");
  if (cleanIp === "127.0.0.1" || cleanIp === "::1" || cleanIp === "localhost") {
    return { country: "Local", countryCode: "XX", city: "Localhost", isp: "Local Network" };
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${cleanIp}?fields=country,countryCode,city,isp,status`, {
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    if (data.status === "success") {
      return { country: data.country || "Unknown", countryCode: data.countryCode || "??", city: data.city || "Unknown", isp: data.isp || "Unknown" };
    }
  } catch {}
  return { country: "Unknown", countryCode: "??", city: "Unknown", isp: "Unknown" };
}

export function truncateIp(ip: string): string {
  const clean = ip.replace("::ffff:", "").trim();
  const parts = clean.split(".");
  if (parts.length === 4) return parts.slice(0, 3).join(".") + ".xxx";
  return clean.substring(0, clean.lastIndexOf(":") + 1) + "xxxx";
}

export function detectPlatform(referer: string): string {
  if (!referer) return "Direct";
  const r = referer.toLowerCase();
  if (r.includes("instagram")) return "Instagram";
  if (r.includes("tiktok")) return "TikTok";
  if (r.includes("twitter") || r.includes("x.com")) return "Twitter/X";
  if (r.includes("facebook")) return "Facebook";
  if (r.includes("youtube")) return "YouTube";
  if (r.includes("snapchat")) return "Snapchat";
  if (r.includes("whatsapp")) return "WhatsApp";
  if (r.includes("telegram")) return "Telegram";
  if (r.includes("discord")) return "Discord";
  if (r.includes("reddit")) return "Reddit";
  if (r.includes("google")) return "Google";
  if (r.includes("bing")) return "Bing";
  if (r.includes("linkedin")) return "LinkedIn";
  return "Other";
}
