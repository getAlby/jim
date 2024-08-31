export function getAlbyHubUrl() {
  const albyHubUrl = process.env.ALBYHUB_URL || process.env.ALBY_HUB_URL;
  if (!albyHubUrl) {
    throw new Error("No ALBYHUB_URL set");
  }
  return removeTrailingSlash(albyHubUrl);
}

export function getBaseUrl() {
  if (!process.env.BASE_URL) {
    throw new Error("No BASE_URL set");
  }

  return removeTrailingSlash(process.env.BASE_URL);
}

export function getDailyWalletLimit(): number {
  return parseInt(process.env.DAILY_WALLET_LIMIT || "10");
}

export function getDomain() {
  let domain = getBaseUrl().split("//")[1];

  return domain;
}

function removeTrailingSlash(url: string) {
  if (url.endsWith("/")) {
    url = url.substring(0, url.length - 1);
  }
  return url;
}
