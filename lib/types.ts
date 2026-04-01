export interface Visit {
  id: string;
  timestamp: string;
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  isp: string;
  userAgent: string;
  browser: string;
  os: string;
  device: string;
  referer: string;
  refererPlatform: string;
  utmSource: string;
  utmCampaign: string;
  utmMedium: string;
  visitorId: string;
  isReturning: boolean;
  captchaPassed: boolean;
  timeOnPage: number;
  fingerprint: string;
  blocked: boolean;
}
