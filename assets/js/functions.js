/* Reusable helpers: formatting, escaping, parsing, filtering, card markup. */
(function (S) {
  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var F = {};

  F.$ = function (id) { return document.getElementById(id); };
  F.root = function () { return document.body.getAttribute("data-root") || ""; };
  F.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  };
  F.safeUrl = function (u) { return /^https?:\/\//i.test(u || "") ? u : ""; };
  /* Site asset: full URLs stay as-is, relative paths are resolved from the site root. */
  F.assetUrl = function (u) { return !u ? "" : (/^https?:\/\//i.test(u) ? u : F.root() + u); };
  F.pageUrl = function (cat) { return F.root() + "pages/" + cat.page.replace(/\.html$/, ""); };
  F.homeUrl = function () { return F.root(); };

  F.fmt = function (d) {
    var p = String(d || "").split("-");
    if (p.length < 3 || !MONTHS[+p[1] - 1]) return F.esc(d);
    return MONTHS[+p[1] - 1] + " " + (+p[2]) + ", " + p[0];
  };
  F.isNew = function (d) {
    var t = new Date(d + "T00:00:00");
    return !isNaN(t) && (Date.now() - t) / 864e5 <= S.SITE.newDays && t <= Date.now() + 864e5;
  };
  F.year = function (i) { return String(i.year || String(i.date).slice(0, 4)); };
  F.sorted = function (arr) { return (arr || []).slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); }); };

  F.driveId = function (u) {
    var m = String(u || "").match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?[^#]*id=|thumbnail\?id=)([\w-]+)/);
    return m ? m[1] : "";
  };
  F.imgUrl = function (u) { var id = F.driveId(u); return id ? "https://drive.google.com/thumbnail?id=" + id + "&sz=w800" : F.safeUrl(u); };
  F.downloadUrl = function (u) {
    var m = u.match(/drive\.google\.com\/file\/d\/([^\/?#]+)/) || u.match(/[?&]id=([^&]+)/);
    return m && /drive\.google\.com/.test(u) ? "https://drive.google.com/uc?export=download&id=" + m[1] : u;
  };

  /* ---------- spreadsheet data processing ---------- */
  F.norm = function (k) { return String(k).toLowerCase().replace(/[^a-z0-9]/g, ""); };
  F.catKey = function (v) {
    var s = F.norm(v), k = "";
    if (!s) return "";
    S.CATS.forEach(function (c) {
      [c.key, c.label, c.single].concat(c.alias).forEach(function (a) { if (F.norm(a) === s) k = c.key; });
    });
    return k;
  };
  F.isoDate = function (v) {
    v = String(v || "").trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
    var d = new Date(v);
    if (isNaN(d)) return "";
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  };
  F.parseCSV = function (t) {
    var rows = [], r = [], f = "", q = false, i, c;
    for (i = 0; i < t.length; i++) {
      c = t.charAt(i);
      if (q) { if (c === '"') { if (t.charAt(i + 1) === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true;
      else if (c === ",") { r.push(f); f = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && t.charAt(i + 1) === "\n") i++; r.push(f); f = ""; rows.push(r); r = []; }
      else f += c;
    }
    if (f !== "" || r.length) { r.push(f); rows.push(r); }
    var h = rows.shift() || [];
    return rows.filter(function (x) { return x.join("").trim() !== ""; }).map(function (x) {
      var o = {}; h.forEach(function (k, j) { o[k] = x[j] || ""; }); return o;
    });
  };
  F.buildData = function (rows) {
    var d = {}, skipped = 0;
    S.CATS.forEach(function (c) { d[c.key] = []; });
    rows.forEach(function (raw) {
      var r = {};
      Object.keys(raw).forEach(function (k) { r[F.norm(k)] = String(raw[k] == null ? "" : raw[k]).trim(); });
      if ((r.status || "").toLowerCase() !== "published") return;
      var k = F.catKey(r.category);
      if (!k || !r.title) { skipped++; return; }
      var dt = F.isoDate(r.datepublished || r.date);
      d[k].push({ id: r.id, title: r.title, number: r.documentnumber || r.number, description: r.description, date: dt,
        year: r.year || dt.slice(0, 4), fileUrl: r.googledrivefileurl || r.fileurl, imageUrl: r.imageurl,
        availability: /^public$/i.test(r.availability) ? "Public" : "Upon Request",
        featured: /^(true|yes|y|1|x)$/i.test(r.featured) });
    });
    if (skipped && window.console) console.warn("Bulletin board: " + skipped + " published row(s) skipped (unknown Category or empty Title).");
    return d;
  };

  /* ---------- search / filter ---------- */
  F.matches = function (item, cat, q) {
    if (!q) return true;
    return [item.title, item.number, item.description, cat.label, cat.single, item.date].join(" ").toLowerCase().indexOf(q) > -1;
  };
  F.filterItems = function (items, cat, q, year) {
    return items.filter(function (i) { return (!year || F.year(i) === year) && F.matches(i, cat, q); });
  };

  /* ---------- card markup ---------- */
  F.card = function (c, i) {
    var u = i.availability === "Public" ? F.safeUrl(i.fileUrl) : "", requestUrl = F.safeUrl(S.CONFIG.requestDocumentUrl);
    var h = '<article class="card" style="--c:' + c.color + '"><div class="tag"><span class="k">' + F.esc(c.single) + "</span>";
    if (F.isNew(i.date)) h += '<span class="badge">New</span>';
    if (i.featured) h += '<span class="st">Featured</span>';
    h += "</div><h3>" + F.esc(i.title) + "</h3>";
    if (i.number) h += '<div class="num">' + F.esc(i.number) + "</div>";
    if (i.date) h += '<div class="meta">Date: ' + F.fmt(i.date) + "</div>";
    if (i.description) h += "<p>" + F.esc(i.description) + "</p>";
    h += '<div class="btns">';
    if (u) h += '<a class="btn" href="' + F.esc(u) + '" target="_blank" rel="noopener">View Document</a><a class="btn alt" href="' + F.esc(F.downloadUrl(u)) + '" target="_blank" rel="noopener">Download PDF</a>';
    else if (requestUrl) h += '<a class="btn" href="' + F.esc(requestUrl) + '" target="_blank" rel="noopener">Request Document</a>';
    else h += '<span class="btn off" aria-disabled="true">Request link not configured</span>';
    return h + "</div></article>";
  };
  F.newsCard = function (c, i) {
    var u = F.safeUrl(i.fileUrl), img = F.imgUrl(i.imageUrl);
    return '<article class="ncard" style="--c:' + c.color + '"><div class="img"' + (img ? " style=\"background-image:url('" + F.esc(img) + "')\"" : "") + ">" + (img ? "" : "Sangguniang Bayan of Kauswagan") +
      '</div><div class="bd"><div class="tag">' + (F.isNew(i.date) ? '<span class="badge">New</span>' : "") + (i.featured ? '<span class="st">Featured</span>' : "") +
      '<span class="meta">' + F.fmt(i.date) + "</span></div><h3>" + F.esc(i.title) + "</h3>" + (i.description ? "<p>" + F.esc(i.description) + "</p>" : "") +
      (u ? '<div class="btns"><a class="btn alt" href="' + F.esc(u) + '" target="_blank" rel="noopener">Read More</a></div>' : "") + "</div></article>";
  };

  S.fn = F;
})(window.SBK);
