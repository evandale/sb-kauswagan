/* Shared header, navigation (active state + mobile menu) and footer, built once for every page. */
(function (S) {
  var F = S.fn, N = {};

  function logo(url, fallbackText, alt) {
    var box = document.createElement("div");
    box.className = "logo";
    box.textContent = fallbackText;
    if (url) {
      var img = new Image();
      img.alt = alt;
      img.onload = function () { box.textContent = ""; box.appendChild(img); };
      img.src = F.assetUrl(url);   // if the file is missing, the text placeholder stays
    }
    return box;
  }

  N.init = function () {
    var page = document.body.getAttribute("data-page") || "home";
    var header = F.$("site-header"), nav = F.$("site-nav"), footer = F.$("site-footer");

    if (S.SITE.faviconUrl) {
      var favicon = document.createElement("link");
      favicon.rel = "icon";
      favicon.href = F.assetUrl(S.SITE.faviconUrl);
      document.head.appendChild(favicon);
    }

    if (header) {
      var top = document.createElement("div");
      top.className = "top";
      top.appendChild(logo(S.SITE.sealUrl, "SEAL", "Municipal seal of Kauswagan"));
      var t = document.createElement("div");
      t.className = "titles";
      t.innerHTML = '<p class="site-name">SANGGUNIANG BAYAN OF KAUSWAGAN</p><div class="sub">LANAO DEL NORTE</div><div class="des">OFFICIAL DIGITAL BULLETIN BOARD</div>';
      top.appendChild(t);
      top.appendChild(logo(S.SITE.sbLogoUrl, "SB", "Sangguniang Bayan logo"));
      var btn = document.createElement("button");
      btn.className = "menubtn"; btn.type = "button"; btn.textContent = "Menu";
      btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "site-nav");
      btn.onclick = function () { btn.setAttribute("aria-expanded", String(nav.classList.toggle("open"))); };
      top.appendChild(btn);
      header.appendChild(top);
    }

    if (nav) {
      var items = [{ href: F.homeUrl(), text: "Home", on: page === "home" }].concat(S.CATS.map(function (c) {
        return { href: F.pageUrl(c), text: c.short, on: page === c.key };
      }));
      nav.innerHTML = '<ul>' + items.map(function (i) {
        return '<li><a href="' + F.esc(i.href) + '"' + (i.on ? ' aria-current="page"' : "") + ">" + F.esc(i.text) + "</a></li>";
      }).join("") + "</ul>";
    }

    if (footer) {
      var links = [{ href: F.homeUrl(), text: "Home" }].concat(["ordinances", "resolutions", "announcements"].map(function (k) {
        var c = S.CATS.filter(function (x) { return x.key === k; })[0];
        return { href: F.pageUrl(c), text: c.short };
      }));
      var contactDetails = [S.SITE.address, S.SITE.phone, S.SITE.email].filter(function (value) {
        return value != null && String(value).trim() !== "";
      }).map(F.esc).join("<br>");
      var facebookUrl = F.safeUrl(S.SITE.facebookUrl);
      footer.innerHTML = '<div class="wrap"><div class="fg"><div><h2>Sangguniang Bayan of Kauswagan</h2>Legislative Body of the Municipal Government of Kauswagan, Lanao del Norte, Philippines</div>' +
        "<div><h2>Contact</h2>" + contactDetails + "</div>" +
        "<div><h2>Quick links</h2>" + links.map(function (l) { return '<a href="' + F.esc(l.href) + '">' + F.esc(l.text) + "</a>"; }).join("") + "</div>" +
        (facebookUrl ? '<div><h2>Social Media</h2><a href="' + F.esc(facebookUrl) + '" target="_blank" rel="noopener noreferrer">Visit our Facebook page</a></div>' : "") + "</div>" +
        '<div class="copy">&copy; ' + new Date().getFullYear() + " Sangguniang Bayan of Kauswagan, Lanao del Norte. All rights reserved.</div></div>";
    }

    /* Homepage category tiles */
    var cats = F.$("cats");
    if (cats) cats.innerHTML = S.CATS.map(function (c) {
      return '<a class="cat" style="--c:' + c.color + '" href="' + F.esc(F.pageUrl(c)) + '"><span class="ico" aria-hidden="true">' + c.icon + '</span><span><b>' + F.esc(c.label) +
        "</b><small>" + F.esc(c.desc) + '</small><span class="n" data-count="' + c.key + '"></span></span></a>';
    }).join("");
  };

  S.nav = N;
})(window.SBK);
