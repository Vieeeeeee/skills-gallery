export const STORAGE_KEYS = {
  data: 'SKILLS_GALLERY_DATA_V2026_CLEAN_V14',
  dataModified: 'SKILLS_DATA_CUSTOM_MODIFIED',
  dataVersion: 'SKILLS_DATA_VERSION_V2026_CLEAN_V14',
  bookmarks: 'SKILLS_GALLERY_BOOKMARKS_V4_FEED',
  appMode: 'SKILLS_APP_MODE_KEY',
  theme: 'wibi_theme'
};

export function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

// 运行时崩溃恢复只清理可能导致崩溃的应用数据，
// 不动用户的收藏和主题偏好，也不清理同域下的其他数据。
export function clearRecoverableAppData() {
  [
    STORAGE_KEYS.data,
    STORAGE_KEYS.dataModified,
    STORAGE_KEYS.dataVersion,
    STORAGE_KEYS.appMode
  ].forEach(removeStorage);
}
