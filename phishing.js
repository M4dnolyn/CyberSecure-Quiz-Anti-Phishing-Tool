// phishing.js
// Vérification locale simple : charge phishing-db.json et compare l'URL entrée.

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("url-input");
  const btn = document.getElementById("check-btn");
  const resultArea = document.getElementById("result-area");

  btn.addEventListener("click", async () => {
    const raw = (input.value || "").trim();
    if (!raw) {
      resultArea.innerHTML = `<div class="result warning">⚠️ Merci d'entrer une URL.</div>`;
      return;
    }
    await checkPhishing(raw);
  });

  // support touche Enter
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      btn.click();
    }
  });

  async function checkPhishing(rawUrl) {
    resultArea.innerHTML = `<div class="result muted">🔎 Vérification du lien en cours…</div>`;

    // 1) tenter de parser l'URL (ajoute https:// si nécessaire)
    let urlObj;
    try {
      urlObj = new URL(rawUrl);
    } catch {
      try {
        urlObj = new URL("https://" + rawUrl);
      } catch {
        resultArea.innerHTML = `<div class="result danger">❌ URL invalide.</div>`;
        return;
      }
    }

    const normalizedTarget = normalize(urlObj.toString());
    const targetHost = urlObj.hostname.toLowerCase();

    // 2) charger la DB locale
    let db;
    try {
      const resp = await fetch("phishing-db.json", { cache: "no-store" });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      db = await resp.json();
    } catch (err) {
      console.error("Erreur chargement phishing-db.json:", err);
      resultArea.innerHTML = `<div class="result danger">❌ Impossible de charger la base locale (phishing-db.json).</div>`;
      return;
    }

    const list = Array.isArray(db.phishing_sites) ? db.phishing_sites : db;

    // 3) recherche : exact normalized -> hostname -> substring
    let found = list.find((entry) => {
      const candidate = typeof entry === "string" ? entry : entry.url;
      return candidate && normalize(candidate) === normalizedTarget;
    });

    if (!found) {
      found = list.find((entry) => {
        const candidate = typeof entry === "string" ? entry : entry.url;
        try {
          return new URL(candidate).hostname.toLowerCase() === targetHost;
        } catch {
          return false;
        }
      });
    }

    if (!found) {
      const rawLower = rawUrl.toLowerCase();
      found = list.find((entry) => {
        const candidate = (
          typeof entry === "string" ? entry : entry.url || ""
        ).toLowerCase();
        return candidate.includes(rawLower) || rawLower.includes(candidate);
      });
    }

    // 4) affichage
    if (found) {
      const entryObj = typeof found === "string" ? { url: found } : found;
      resultArea.innerHTML = `
        <div class="result danger">
          <strong>⚠️ POTENTIEL PHISHING</strong><br>
          <small>Source: ${escapeHtml(
            entryObj.source || "locale"
          )} · ajouté: ${escapeHtml(entryObj.date || "inconnu")}</small>
          <div style="margin-top:8px;">
            <button id="open-btn" class="small-btn">Ouvrir</button>
            <button id="copy-btn" class="small-btn">Copier</button>
          </div>
          <div style="margin-top:6px; word-break:break-all;"><small>${escapeHtml(
            entryObj.url
          )}</small></div>
        </div>`;
      document
        .getElementById("open-btn")
        .addEventListener("click", () =>
          window.open(entryObj.url, "_blank", "noopener")
        );
      document
        .getElementById("copy-btn")
        .addEventListener("click", () =>
          navigator.clipboard.writeText(entryObj.url)
        );
    } else {
      resultArea.innerHTML = `<div class="result safe">✅ Aucune correspondance dans la base locale.</div>`;
    }
  }

  // helpers
  function normalize(u) {
    try {
      const p = new URL(u);
      p.hash = "";
      if (p.pathname !== "/") p.pathname = p.pathname.replace(/\/+$/, "");
      p.hostname = p.hostname.toLowerCase();
      return p.toString();
    } catch {
      return u.trim();
    }
  }

  function escapeHtml(s) {
    return String(s).replace(
      /[&<>"']/g,
      (m) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[m])
    );
  }
});
