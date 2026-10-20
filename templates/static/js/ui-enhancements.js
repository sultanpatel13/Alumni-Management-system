(function () {
  const html = document.documentElement;
  const toggle = document.getElementById("themeToggle");
  const themes = ["sunset", "forest"];

  const saved = localStorage.getItem("alumni-theme");
  if (saved && themes.includes(saved)) {
    html.setAttribute("data-theme", saved);
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      const current = html.getAttribute("data-theme") || themes[0];
      const next = current === themes[0] ? themes[1] : themes[0];
      html.setAttribute("data-theme", next);
      localStorage.setItem("alumni-theme", next);
    });
  }

  // Password visibility toggle handler
  const eyeOpenSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
  const eyeSlashSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>';

  document.querySelectorAll(".toggle-password").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (!input) return;
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      this.innerHTML = isPassword ? eyeSlashSvg : eyeOpenSvg;
      this.setAttribute("title", isPassword ? "Hide password" : "Show password");
      this.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
    });
  });

  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach((el) => obs.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  async function hydrateDashboard() {
    const statsRoot = document.getElementById("dashboardStats");
    const eventsRoot = document.getElementById("upcomingEvents");
    if (!statsRoot || !eventsRoot) {
      return;
    }

    try {
      const [summaryRes, eventsRes] = await Promise.all([
        fetch('/api/dashboard-summary'),
        fetch('/api/upcoming-events')
      ]);

      if (summaryRes.ok) {
        const summary = await summaryRes.json();
        Object.keys(summary).forEach((key) => {
          const el = document.querySelector(`[data-stat="${key}"]`);
          if (el) {
            el.textContent = String(summary[key]);
          }
        });
      }

      if (eventsRes.ok) {
        const payload = await eventsRes.json();
        const events = payload.events || [];
        if (!events.length) {
          eventsRoot.innerHTML = '<p class="text-muted mb-0">No events yet. Create one from the Events page.</p>';
          return;
        }
        eventsRoot.innerHTML = events.map((e) => `
          <div class="list-group-item">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <strong>${e.title}</strong><br>
                <small>${e.start_time} | ${e.location}</small>
              </div>
              <a class="btn btn-sm btn-primary" href="/events">Open</a>
            </div>
          </div>
        `).join("");
      }
    } catch (err) {
      console.error(err);
    }
  }

  hydrateDashboard();
})();
