/**
 * Cloudflare Worker: Skills & 风格大赏 多管理员实时数据同步服务
 * 
 * 接口特性：
 * 1. GET  /api/skills       -> 获取全量最新条目 (支持缓存与即时刷新)
 * 2. POST /api/skills       -> 管理员更新或新增单个条目 (带 x-admin-passcode 校验)
 * 3. POST /api/skills/batch -> 管理员全量替换/同步最新条目数组
 * 4. DELETE /api/skills/:id -> 管理员删除指定条目
 * 
 * 绑定：
 * - KV 命名空间: SKILLS_KV
 * - 环境变量: ADMIN_PASSCODE (默认 admin888)
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;
    const passcode = request.headers.get("x-admin-passcode") || "";
    const expectedPasscode = env.ADMIN_PASSCODE || "admin888";

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-admin-passcode, Authorization",
      "Content-Type": "application/json; charset=utf-8"
    };

    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 1. GET /api/skills
    if (url.pathname === "/api/skills" && method === "GET") {
      try {
        const cached = await env.SKILLS_KV.get("SKILLS_DATA", "json");
        if (!cached || !Array.isArray(cached)) {
          return new Response(JSON.stringify({ status: "empty", data: [] }), { headers: corsHeaders });
        }
        return new Response(JSON.stringify({ status: "ok", count: cached.length, data: cached }), { headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
      }
    }

    // 鉴权检查 (除 GET 以外的所有写操作)
    if (passcode !== expectedPasscode) {
      return new Response(JSON.stringify({ error: "口令错误，无权执行管理员写入操作" }), { status: 401, headers: corsHeaders });
    }

    // 2. POST /api/skills/batch (全量同步覆盖)
    if (url.pathname === "/api/skills/batch" && method === "POST") {
      try {
        const body = await request.json();
        if (!Array.isArray(body)) {
          return new Response(JSON.stringify({ error: "数据必须为数组" }), { status: 400, headers: corsHeaders });
        }
        await env.SKILLS_KV.put("SKILLS_DATA", JSON.stringify(body));
        return new Response(JSON.stringify({ status: "ok", count: body.length, message: "全量数据已成功同步到云端！" }), { headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
      }
    }

    // 3. POST /api/skills (增补或更新单条)
    if (url.pathname === "/api/skills" && method === "POST") {
      try {
        const item = await request.json();
        if (!item || !item.id || !item.title) {
          return new Response(JSON.stringify({ error: "缺少条目必填字段 (id, title)" }), { status: 400, headers: corsHeaders });
        }
        let list = (await env.SKILLS_KV.get("SKILLS_DATA", "json")) || [];
        const idx = list.findIndex(x => x.id === item.id);
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...item };
        } else {
          list.unshift(item);
        }
        await env.SKILLS_KV.put("SKILLS_DATA", JSON.stringify(list));
        return new Response(JSON.stringify({ status: "ok", item, count: list.length }), { headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
      }
    }

    // 4. DELETE /api/skills/:id
    if (url.pathname.startsWith("/api/skills/") && method === "DELETE") {
      try {
        const id = decodeURIComponent(url.pathname.replace("/api/skills/", ""));
        let list = (await env.SKILLS_KV.get("SKILLS_DATA", "json")) || [];
        const beforeLen = list.length;
        list = list.filter(x => x.id !== id);
        if (list.length === beforeLen) {
          return new Response(JSON.stringify({ error: "未找到该条目" }), { status: 404, headers: corsHeaders });
        }
        await env.SKILLS_KV.put("SKILLS_DATA", JSON.stringify(list));
        return new Response(JSON.stringify({ status: "ok", deletedId: id, count: list.length }), { headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
      }
    }

    return new Response(JSON.stringify({ error: "Not Found" }), { status: 404, headers: corsHeaders });
  }
};
