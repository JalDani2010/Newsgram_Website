import Cookies from "js-cookie";

// Cookie configuration
const COOKIE_OPTIONS = {
  expires: 30, // 30 days
  path: "/",
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};

// Cookie keys
export const COOKIE_KEYS = {
  USER_DATA: "newsapp_user_data",
  PROFILE_COMPLETION: "newsapp_profile_completion",
  THEME: "newsapp_theme",
  AUTH_TOKEN: "newsapp_auth_token",
  NOTIFICATION_PREFS: "newsapp_notification_prefs",
  PRIVACY_SETTINGS: "newsapp_privacy_settings",
  BOOKMARKS: "newsapp_bookmarks",
  READ_LATER: "newsapp_read_later",
  CONSENT: "newsapp_cookie_consent",
};

interface CookieOptions {
  expires?: number | Date;
  path?: string;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

const DEFAULT_COOKIE_OPTIONS: CookieOptions = {
  path: "/",
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};

// Set a cookie with the provided key and value
export function setCookie(
  key: string,
  value: any,
  expiresInDays?: number
): void {
  try {
    const stringValue =
      typeof value === "object" ? JSON.stringify(value) : String(value);

    const options: CookieOptions = {
      ...DEFAULT_COOKIE_OPTIONS,
      ...(expiresInDays ? { expires: expiresInDays } : {}),
    };

    Cookies.set(key, stringValue, options);
  } catch (error) {
    console.error(`Error setting cookie "${key}":`, error);
  }
}

// Get a cookie value by key
export function getCookie(key: string): any {
  try {
    const value = Cookies.get(key);
    if (!value) return null;

    // Try to parse as JSON, return as string if not valid JSON
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    console.error(`Error getting cookie ${key}:`, error);
    return null;
  }
}

// Remove a cookie by key
export function removeCookie(key: string): void {
  try {
    Cookies.remove(key, { path: "/" });
  } catch (error) {
    console.error(`Error removing cookie ${key}:`, error);
  }
}

// Check if a cookie exists
export function hasCookie(key: string): boolean {
  return !!getCookie(key);
}

// Set user data in cookies
export function setUserData(userData: any): void {
  setCookie(COOKIE_KEYS.USER_DATA, userData);
}

// Get user data from cookies
export function getUserData(): any {
  return getCookie(COOKIE_KEYS.USER_DATA);
}

// Set profile completion percentage
export function setProfileCompletion(percentage: number): void {
  setCookie(COOKIE_KEYS.PROFILE_COMPLETION, percentage);
}

// Get profile completion percentage
export function getProfileCompletion(): number {
  return Number(getCookie(COOKIE_KEYS.PROFILE_COMPLETION) || 0);
}

// Set theme preference
export function setThemePreference(theme: string): void {
  setCookie(COOKIE_KEYS.THEME, theme);
}

// Get theme preference
export function getThemePreference(): string {
  return getCookie(COOKIE_KEYS.THEME) || "dark";
}

// Set notification preferences
export function setNotificationPreferences(preferences: any): void {
  setCookie(COOKIE_KEYS.NOTIFICATION_PREFS, preferences);
}

// Get notification preferences
export function getNotificationPreferences(): any {
  return getCookie(COOKIE_KEYS.NOTIFICATION_PREFS);
}

// Set privacy settings
export function setPrivacySettings(settings: any): void {
  setCookie(COOKIE_KEYS.PRIVACY_SETTINGS, settings);
}

// Get privacy settings
export function getPrivacySettings(): any {
  return getCookie(COOKIE_KEYS.PRIVACY_SETTINGS);
}

// Set bookmarks
export function setBookmarks(bookmarks: string[]): void {
  setCookie(COOKIE_KEYS.BOOKMARKS, bookmarks);
}

// Get bookmarks
export function getBookmarks(): string[] {
  return getCookie(COOKIE_KEYS.BOOKMARKS) || [];
}

// Set read later articles
export function setReadLater(articles: string[]): void {
  setCookie(COOKIE_KEYS.READ_LATER, articles);
}

// Get read later articles
export function getReadLater(): string[] {
  return getCookie(COOKIE_KEYS.READ_LATER) || [];
}

// Set cookie consent
export function setCookieConsent(hasConsented: boolean): void {
  setCookie(COOKIE_KEYS.CONSENT, hasConsented);
}

// Get cookie consent
export function getCookieConsent(): boolean {
  return getCookie(COOKIE_KEYS.CONSENT) === true;
}

// Clear all app cookies
export function clearAllCookies(): void {
  Object.values(COOKIE_KEYS).forEach((key) => {
    removeCookie(key);
  });
}
