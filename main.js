document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");
  const header = document.querySelector(".site-header");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animatedItems = Array.from(document.querySelectorAll("[data-animate]"));

  const closeNav = () => {
    if (nav && nav.classList.contains("open")) {
      nav.classList.remove("open");
      navToggle?.setAttribute("aria-expanded", "false");
    }
  };

  navToggle?.addEventListener("click", () => {
    const isOpen = nav?.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  });

  document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      const headerOffset = header ? header.offsetHeight : 0;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerOffset - 8;

      window.scrollTo({
        top: targetPosition,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });

      if (link.closest("#primary-nav")) {
        closeNav();
      }
    });
  });

  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  if (animatedItems.length) {
    if (!prefersReducedMotion && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const target = entry.target;
              const delay = target.getAttribute("data-delay");
              if (delay) {
                target.style.transitionDelay = `${delay}ms`;
              }
              target.classList.add("animated");
              observer.unobserve(target);
            }
          });
        },
        { threshold: 0.18 }
      );

      animatedItems.forEach((item) => observer.observe(item));
    } else {
      animatedItems.forEach((item) => item.classList.add("animated"));
    }
  }
});
