(() => {
  const root = document.documentElement;
  const body = document.body;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const savedTheme = localStorage.getItem("portfolio-theme");
  const initialTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  root.setAttribute("data-bs-theme", initialTheme);

  const setThemeButtonText = (theme) => {
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      const icon = button.querySelector("i");
      const label = button.querySelector("span");
      if (icon) {
        icon.className = theme === "dark" ? "bi bi-sun" : "bi bi-moon-stars";
      }
      if (label) {
        label.textContent = theme === "dark" ? "Light mode" : "Dark mode";
      }
    });
  };

  setThemeButtonText(initialTheme);

  window.addEventListener("load", () => {
    body.classList.add("loaded");
  });

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextTheme = root.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-bs-theme", nextTheme);
      localStorage.setItem("portfolio-theme", nextTheme);
      setThemeButtonText(nextTheme);
    });
  });

  const typingTarget = document.getElementById("typingText");
  const titles = [
    "Full Stack Software Engineer",
    "Enterprise Application Developer",
    "API and Systems Builder",
    "Cloud-ready Product Engineer"
  ];

  if (typingTarget && !prefersReducedMotion) {
    let titleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const type = () => {
      const currentTitle = titles[titleIndex];
      typingTarget.textContent = currentTitle.slice(0, charIndex);

      if (!deleting && charIndex < currentTitle.length) {
        charIndex += 1;
        window.setTimeout(type, 72);
        return;
      }

      if (!deleting) {
        deleting = true;
        window.setTimeout(type, 1600);
        return;
      }

      if (charIndex > 0) {
        charIndex -= 1;
        window.setTimeout(type, 36);
        return;
      }

      deleting = false;
      titleIndex = (titleIndex + 1) % titles.length;
      window.setTimeout(type, 360);
    };

    type();
  }

  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll("#desktopNav .nav-link");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      // If the section is currently visible on the screen
      if (entry.isIntersecting) {
        // Clear active classes from all links
        navLinks.forEach((link) => {
          link.classList.remove("active");
          link.removeAttribute("aria-current");
        });

        // Find the link that matches the current section's ID
        const activeId = entry.target.getAttribute("id");
        const activeLink = document.querySelector(`#desktopNav .nav-link[href="#${activeId}"]`);

        // Add active class to the correct link
        if (activeLink) {
          activeLink.classList.add("active");
          activeLink.setAttribute("aria-current", "page");
        }
      }
    });
  }, {
    // Trigger when just 20% of the section enters the screen
    threshold: 0.2
  });

  sections.forEach((section) => observer.observe(section));

  const counters = document.querySelectorAll("[data-counter]");
  const progressItems = document.querySelectorAll("[data-progress]");
  const revealItems = document.querySelectorAll(".reveal");

  const animateCounter = (counter) => {
    if (counter.dataset.counted === "true") {
      return;
    }

    counter.dataset.counted = "true";
    const target = Number(counter.dataset.counter);
    const duration = 1100;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(progress * target);
      counter.textContent = `${value}+`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        counter.textContent = `${target}+`;
      }
    };

    requestAnimationFrame(tick);
  };

  const animateProgress = (item) => {
    const bar = item.querySelector(".progress-bar");
    if (bar) {
      bar.style.width = `${item.dataset.progress}%`;
      bar.setAttribute("aria-valuenow", item.dataset.progress);
      bar.setAttribute("aria-valuemin", "0");
      bar.setAttribute("aria-valuemax", "100");
      bar.setAttribute("role", "progressbar");
    }
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");

        if (entry.target.matches("[data-counter]")) {
          animateCounter(entry.target);
        }

        if (entry.target.matches("[data-progress]")) {
          animateProgress(entry.target);
        }

        observer.unobserve(entry.target);
      });
    }, { threshold: 0.18 });

    [...revealItems, ...counters, ...progressItems].forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    counters.forEach(animateCounter);
    progressItems.forEach(animateProgress);
  }

  const filterButtons = document.querySelectorAll("[data-filter]");
  const projectCards = document.querySelectorAll(".project-card");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((item) => item.classList.toggle("active", item === button));

      projectCards.forEach((card) => {
        const shouldShow = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !shouldShow);
      });
    });
  });

  const backToTop = document.querySelector(".back-to-top");

  const updateBackToTop = () => {
    if (backToTop) {
      backToTop.classList.toggle("show", window.scrollY > 520);
    }
  };

  updateBackToTop();
  window.addEventListener("scroll", updateBackToTop, { passive: true });

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  const form = document.getElementById("contactForm");
  const formAlert = document.getElementById("formAlert");

  if (form && formAlert) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        formAlert.className = "form-alert error";
        formAlert.textContent = "Please complete the required fields before sending.";
        return;
      }

      form.classList.add("was-validated");
      formAlert.className = "form-alert success";
      formAlert.textContent = "Message ready. Connect this form to your preferred email or CRM endpoint.";
      form.reset();
      form.classList.remove("was-validated");
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || href === "#") {
        return;
      }

      const target = document.querySelector(href);
      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      history.pushState(null, "", href);
    });
  });

  const scrollSpy = bootstrap.ScrollSpy.getOrCreateInstance(body, {
    target: "#desktopNav",
    rootMargin: "0px 0px -45%"
  });

  window.addEventListener("load", () => scrollSpy.refresh());
})();
