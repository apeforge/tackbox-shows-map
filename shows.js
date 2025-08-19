// /api/shows.js
export default async function handler(req, res) {
  // CORS (lets you embed from anywhere, including Adalo’s Web wrapper)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(204).end();

  const ADALO_API_KEY = process.env.ADALO_API_KEY; // set in Vercel (do NOT hardcode)
  if (!ADALO_API_KEY) {
    return res.status(500).json({ error: "Missing ADALO_API_KEY env var" });
  }

  // Defaults; override via query if needed
  const appId = req.query.appId || "b8f3b3de-427f-4c38-a845-6b7d66de48fe";
  const collectionId = req.query.collectionId || "t_5heq2yr6wbw7z2ug87i8h7kde";
  const limit = Math.min(parseInt(req.query.limit || "500", 10), 1000);

  const base = `https://api.adalo.com/v0/apps/${appId}/collections/${collectionId}`;
  const headers = {
    Authorization: `Bearer ${ADALO_API_KEY}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  try {
    let offset = 0;
    let all = [];

    while (true) {
      const url = `${base}?offset=${offset}&limit=${limit}`;
      const resp = await fetch(url, { headers });
      if (!resp.ok) {
        return res.status(resp.status).json({ error: `Adalo HTTP ${resp.status}` });
      }
      const json = await resp.json();
      const records = Array.isArray(json.records) ? json.records : [];
      all = all.concat(records);

      if (!records.length || records.length < limit) break;
      offset += records.length;
    }

    return res.status(200).json({ records: all });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
