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
