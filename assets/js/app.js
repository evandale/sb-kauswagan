/* App: shared data loading (one request per page, cached across pages), rendering and events. */
(function (S) {
  var F = S.fn, C = S.CONFIG, $ = F.$;
  var PAGE = document.body.getAttribute("data-page") || "home";
  var HOME = PAGE === "home";
  var DATA = S.FALLBACK_DATA, expanded = {};
  var pageCat = HOME ? null : S.CATS.filter(function (c) { return c.key === PAGE; })[0];

  function readCache() { try { return JSON.parse(localStorage.getItem(C.cacheKey) || "null"); } catch (e) { return null; } }
  function writeCache(d) { try { localStorage.setItem(C.cacheKey, JSON.stringify({ t: Date.now(), d: d })); } catch (e) {} }

  function notice(msg, type, retry) {
    var n = $("notice");
    if (!n) return;
    if (!msg) { n.style.display = "none"; return; }
    n.className = "notice " + (type || "");
    n.innerHTML = F.esc(msg) + (retry ? '<button id="retry" type="button">Try again</button>' : "");
    n.style.display = "block";
    if (retry) $("retry").onclick = function () { load(true); };
  }

  function fetchScriptRows(url) {
    return new Promise(function (resolve, reject) {
      var callback = "__sbkAppsScript" + Date.now() + Math.floor(Math.random() * 1000000);
      var script = document.createElement("script"), settled = false, timer;
      function cleanup() {
        clearTimeout(timer);
        delete window[callback];
        if (script.parentNode) script.parentNode.removeChild(script);
      }
      function fail(error) {
        if (settled) return;
        settled = true;
        cleanup();
        reject(error);
      }
      window[callback] = function (data) {
        if (settled) return;
        settled = true;
        cleanup();
        if (data && data.error) reject(new Error(data.error));
        else if (data && data.records && typeof data.records.length === "number") resolve(data.records);
        else reject(new Error("the Apps Script response was invalid"));
      };
      script.onerror = function () { fail(new Error("the Apps Script endpoint could not be loaded")); };
      timer = setTimeout(function () { fail(new Error("the request timed out")); }, C.timeoutMs);
      script.src = url + (url.indexOf("?") > -1 ? "&" : "?") + "callback=" + encodeURIComponent(callback) + "&_=" + Date.now();
      document.head.appendChild(script);
    });
  }
  function fetchRows() {
    if (C.appsScriptUrl) {
      return fetchScriptRows(C.appsScriptUrl);
    }
    return Promise.reject(new Error("NOCONFIG"));
  }

  function load(force) {
    var cached = readCache();
    if (!force && cached && cached.d && Date.now() - cached.t < C.cacheFreshMs) {   // fresh shared copy: no new request
      DATA = cached.d; notice(""); return ready();
    }
    $("out").innerHTML = '<div class="loading" role="status"><span class="spin"></span>Loading documents...</div>';
    fetchRows().then(function (rows) {
      DATA = F.buildData(rows); notice(""); writeCache(DATA);
    }).catch(function (e) {
      var c = readCache();
      DATA = c && c.d ? c.d : S.FALLBACK_DATA;
      if (e.message === "NOCONFIG") notice("Demo mode: no spreadsheet is connected yet, so sample content is shown.", "info");
      else notice("The latest documents could not be loaded (" + e.message + "). Showing " + (c && c.d ? "the last saved list" : "sample content only") + ". Please try again later.", "warn", true);
    }).then(ready);
  }

  function ready() { buildYears(); render(); }

  function buildYears() {
    var sel = $("fYear"), ys = {}, cur = sel.value;
    (HOME ? S.CATS : [pageCat]).forEach(function (c) { (DATA[c.key] || []).forEach(function (i) { var y = F.year(i); if (y) ys[y] = 1; }); });
    sel.innerHTML = '<option value="">All years</option>' + Object.keys(ys).sort().reverse().map(function (y) { return "<option>" + F.esc(y) + "</option>"; }).join("");
    sel.value = ys[cur] ? cur : "";
  }

  function section(c, items, searching) {
    var showAll = !HOME || expanded[c.key] || searching;
    var shown = showAll ? items : items.slice(0, S.SITE.previewCount);
    var h = '<section class="block" id="sec-' + c.key + '" style="--c:' + c.color + '"><div class="bh">';
    if (HOME) h += '<span class="ico" aria-hidden="true">' + c.icon + '</span><h2><a href="' + F.esc(F.pageUrl(c)) + '">' + F.esc(c.label) + "</a></h2>";
    h += '<span class="cnt">' + items.length + " item" + (items.length === 1 ? "" : "s") + "</span>";
    if (HOME && !searching && items.length > S.SITE.previewCount) h += '<button class="va" type="button" data-va="' + c.key + '">' + (expanded[c.key] ? "Show Less" : "View All") + "</button>";
    h += "<p>" + F.esc(c.desc) + (C.showFolderLinks && F.safeUrl(C.folders[c.key]) ? ' <a href="' + F.esc(C.folders[c.key]) + '" target="_blank" rel="noopener">Open Drive folder</a>' : "") + "</p></div>";
    if (!items.length) h += '<div class="empty">No items published yet in this category.</div>';
    else h += '<div class="' + (c.key === "updates" ? "news" : "list") + '">' + shown.map(function (i) { return c.key === "updates" ? F.newsCard(c, i) : F.card(c, i); }).join("") + "</div>";
    return h + "</section>";
  }

  function render() {
    var q = $("q").value.trim().toLowerCase(), fy = $("fYear").value, fc = $("fCat") ? $("fCat").value : "";
    var searching = !!(q || fc || fy), out = "", total = 0;
    (HOME ? S.CATS : [pageCat]).forEach(function (c) {
      if (fc && fc !== c.key) return;
      var items = F.filterItems(F.sorted(DATA[c.key]), c, q, fy);
      if (HOME && searching && !items.length) return;
      total += items.length;
      out += section(c, items, searching);
    });
    if (searching && !total) out = '<div class="empty"><b>No results found.</b><br>Try a different word, check the spelling, or choose "Show everything".</div>';
    $("out").innerHTML = out;
    Array.prototype.forEach.call(document.querySelectorAll("[data-va]"), function (b) {
      b.onclick = function () { var k = b.getAttribute("data-va"); expanded[k] = !expanded[k]; render(); };
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-count]"), function (n) {
      n.textContent = (DATA[n.getAttribute("data-count")] || []).length + " published";
    });
  }

  function resetFilters() {
    $("q").value = ""; $("fYear").value = ""; if ($("fCat")) $("fCat").value = "";
    expanded = {}; render();
  }

  function init() {
    S.nav.init();
    if ($("fCat")) $("fCat").innerHTML = '<option value="">All categories</option>' + S.CATS.map(function (c) { return '<option value="' + c.key + '">' + F.esc(c.label) + "</option>"; }).join("");
    $("q").oninput = render;
    $("fYear").onchange = render;
    if ($("fCat")) $("fCat").onchange = render;
    $("searchForm").onsubmit = function (e) { e.preventDefault(); render(); };
    $("qClear").onclick = function () { $("q").value = ""; render(); $("q").focus(); };
    $("reset").onclick = resetFilters;
    load(false);
  }

  document.addEventListener("DOMContentLoaded", init);
})(window.SBK);
