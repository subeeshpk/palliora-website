/* ==========================================================================
   Palliora Care Foundation — Site scripts
   Mobile nav toggle, scroll-spy, reveal-on-scroll, copy-to-clipboard, back-to-top.
   No external dependencies.
   ========================================================================== */
(function () {
  "use strict";

  var doc = document;

  /* ---------- Footer year ---------- */
  var yearEl = doc.getElementById("year");
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = doc.getElementById("navToggle");
  var siteNav = doc.getElementById("site-nav");

  function closeNav() {
    if (!siteNav || !navToggle) return;
    siteNav.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = siteNav.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    siteNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    doc.addEventListener("click", function (e) {
      if (!siteNav.classList.contains("is-open")) return;
      if (siteNav.contains(e.target) || navToggle.contains(e.target)) return;
      closeNav();
    });
  }

  /* ---------- Scroll-spy for active nav link ---------- */
  var navLinks = Array.prototype.slice.call(doc.querySelectorAll(".nav-link"));
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute("href");
      return id && id.charAt(0) === "#" ? doc.querySelector(id) : null;
    })
    .filter(Boolean);

  function updateActiveLink() {
    var scrollPos = window.scrollY + 120;
    var currentId = null;

    sections.forEach(function (section) {
      if (section.offsetTop <= scrollPos) {
        currentId = "#" + section.id;
      }
    });

    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === currentId);
    });
  }

  /* ---------- Back to top button ---------- */
  var backToTop = doc.getElementById("backToTop");

  function updateBackToTop() {
    if (!backToTop) return;
    backToTop.classList.toggle("is-visible", window.scrollY > 480);
  }

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateActiveLink();
      updateBackToTop();
      ticking = false;
    });
  });
  updateActiveLink();
  updateBackToTop();

  /* ---------- Reveal on scroll ---------- */
  var revealEls = Array.prototype.slice.call(doc.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Toast helper ---------- */
  var toast = doc.getElementById("toast");
  var toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2200);
  }

  /* ---------- Copy to clipboard ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback for non-secure contexts / older browsers
    var textarea = doc.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    doc.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      doc.execCommand("copy");
    } catch (err) {
      /* no-op */
    }
    doc.body.removeChild(textarea);
    return Promise.resolve();
  }

  doc.querySelectorAll(".bank-value").forEach(function (el) {
    el.addEventListener("click", function () {
      var value = el.getAttribute("data-copy") || el.textContent;
      copyText(value).then(function () {
        showToast("Copied: " + value);
      });
    });
  });

  var copyAllBtn = doc.getElementById("copyBankDetails");
  if (copyAllBtn) {
    copyAllBtn.addEventListener("click", function () {
      var rows = doc.querySelectorAll(".bank-row");
      var lines = Array.prototype.map.call(rows, function (row) {
        var label = row.querySelector(".bank-label");
        var value = row.querySelector(".bank-value");
        return (label ? label.textContent.trim() : "") + ": " + (value ? value.getAttribute("data-copy") || value.textContent.trim() : "");
      });
      copyText(lines.join("\n")).then(function () {
        showToast("Bank details copied to clipboard");
      });
    });
  }
})();
