export const normalizeUrl = (url: string) => {
  try {
    const u = new URL(url);
    return u.origin + u.pathname.replace(/\/$/, "");
  } catch (e) {
    return url;
  }
};

export const extractDomain = (url: string) => {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch (e) {
    return "";
  }
};

export const getFaviconUrl = (url: string) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (e) {
    return "";
  }
};
