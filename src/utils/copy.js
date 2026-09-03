// 统一剪贴板出口：navigator.clipboard 在部分 WebView（微信内置浏览器等）不存在或被拒绝，
// 直接调用会静默失败甚至让 UI 谎报成功。所有复制动作必须走这里。
export async function copyText(text) {
  if (!text) return false;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // 权限拒绝 / 文档失焦 → 落到下面的兜底
  }

  // ponytail: execCommand 已废弃，但仍是老 WebView 里唯一可靠的兜底
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

export const COPY_FAIL_MSG = '复制失败，请长按选中文字手动复制';
