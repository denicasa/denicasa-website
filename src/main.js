// src/main.js
(() => {
  console.log("main.js loaded ✅");

  // =========================
  // Footer year
  // =========================
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // =========================
  // Find Property Modal
  // =========================
  const openBtn = document.getElementById("openFindModal");
  const modal = document.getElementById("findModal");
  const form = document.getElementById("findForm");

  function openModal() {
    if (!modal) return;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    const focusable = modal.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) focusable.focus();
  }

  function closeModal() {
    if (!modal) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    if (openBtn) openBtn.focus();
  }

  if (openBtn && modal) {
    openBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });

    modal.addEventListener("click", (e) => {
      const t = e.target;
      if (t && t.dataset && t.dataset.close === "true") closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = new FormData(form);

      let type = "all";
      const status = String(data.get("status") || "").trim();
      if (status === "sales") type = "sales";
      if (status === "new") type = "new";
      if (status === "rentals") type = "rentals";

      const area = String(data.get("area") || "").trim();
      const beds = String(data.get("beds") || "").trim();
      const min = String(data.get("minPrice") || "").trim();
      const max = String(data.get("maxPrice") || "").trim();

      const params = new URLSearchParams();
      params.set("type", type);
      if (area) params.set("q", area);
      if (beds) params.set("beds", beds);
      if (min) params.set("min", min);
      if (max) params.set("max", max);

      window.location.href = `/properties.html?${params.toString()}`;
    });
  }

  // =========================
  // Mobile Nav Toggle (robust)
  // =========================
  (() => {
    const header = document.querySelector(".site-header");
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.getElementById("primary-nav");
    if (!header || !toggle || !nav) return;

    const open = () => {
      nav.classList.add("is-open");          // <— key
      header.classList.add("nav-open");
      document.body.classList.add("nav-open");
      toggle.setAttribute("aria-expanded", "true");
    };

    const close = () => {
      nav.classList.remove("is-open");       // <— key
      header.classList.remove("nav-open");
      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    const isOpen = () => nav.classList.contains("is-open");

    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      isOpen() ? close() : open();
    });

    // close when clicking a link
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) close();
    });

    // close when clicking outside nav + toggle
    document.addEventListener("click", (e) => {
      if (!isOpen()) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      close();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  })();

  // =========================================================
  // DC SELECT (Reusable Premium Dropdown)
  // - IMPORTANT: This expects selects with class "dc-native-select"
  // - Your CSS already hides the native select; JS builds the pill UI.
  // =========================================================
  function closeAllSelects(except) {
    document.querySelectorAll(".dc-select").forEach((w) => {
      if (except && w === except) return;
      const btn = w.querySelector(".dc-select__btn");
      const list = w.querySelector(".dc-select__list");
      if (btn && list && !list.hidden) {
        list.hidden = true;
        btn.setAttribute("aria-expanded", "false");
      }
    });
  }

  function enhanceSelect(nativeSelect) {
    // Avoid double-enhancing
    if (nativeSelect.closest(".dc-select")) return;

    const wrap = document.createElement("div");
    wrap.className = "dc-select";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dc-select__btn";
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");

    const valueSpan = document.createElement("span");
    valueSpan.className = "dc-select__value";

    const arrow = document.createElement("span");
    arrow.className = "dc-select__arrow";
    arrow.setAttribute("aria-hidden", "true");

    btn.appendChild(valueSpan);
    btn.appendChild(arrow);

    const list = document.createElement("div");
    list.className = "dc-select__list";
    list.setAttribute("role", "listbox");
    list.hidden = true;

    // Build options
    const opts = Array.from(nativeSelect.options);

    opts.forEach((o) => {
      const optBtn = document.createElement("button");
      optBtn.type = "button";
      optBtn.className = "dc-select__opt";
      optBtn.setAttribute("role", "option");
      optBtn.dataset.value = o.value;
      optBtn.textContent = o.textContent;

      optBtn.setAttribute("aria-selected", o.selected ? "true" : "false");

      optBtn.addEventListener("click", () => {
        nativeSelect.value = o.value;
        nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));

        valueSpan.textContent = o.textContent;

        list.querySelectorAll(".dc-select__opt").forEach((b) =>
          b.setAttribute("aria-selected", "false")
        );
        optBtn.setAttribute("aria-selected", "true");

        list.hidden = true;
        btn.setAttribute("aria-expanded", "false");
      });

      list.appendChild(optBtn);
    });

    const selectedOpt = nativeSelect.selectedOptions[0];
    valueSpan.textContent = selectedOpt ? selectedOpt.textContent : "Choose…";

    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      closeAllSelects(wrap);

      if (isOpen) {
        list.hidden = true;
        btn.setAttribute("aria-expanded", "false");
      } else {
        list.hidden = false;
        btn.setAttribute("aria-expanded", "true");
      }
    });

    // Wrap + insert
    nativeSelect.parentNode.insertBefore(wrap, nativeSelect);
    wrap.appendChild(btn);
    wrap.appendChild(list);
    wrap.appendChild(nativeSelect);
  }

  document.querySelectorAll("select.dc-native-select").forEach(enhanceSelect);

  document.addEventListener("click", (e) => {
    const inside = e.target.closest(".dc-select");
    if (!inside) closeAllSelects();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllSelects();
  });

  // =========================================================
  // AREAS SECTION (ALL LOCATIONS)
  // =========================================================
  const areaSelect = document.getElementById("areaSelect");
  const areaCard = document.getElementById("areaCard");
  const areaKicker = document.getElementById("areaKicker");
  const areaTitle = document.getElementById("areaTitle");
  const areaIntro = document.getElementById("areaIntro");
  const areaText = document.getElementById("areaText");
  const areaCta = document.getElementById("areaCta");

  // Only run on pages that actually have the Areas section
  if (
    areaSelect &&
    areaCard &&
    areaKicker &&
    areaTitle &&
    areaIntro &&
    areaText &&
    areaCta
  ) {
    const areas = {
      lalinea: {
        intro:
          "A practical coastal town with direct access to Gibraltar and true year-round living.",
        title: "La Línea de la Concepción",
        text:
          "La Línea offers an authentic Spanish lifestyle with beaches overlooking Gibraltar, established neighbourhoods and full everyday amenities. It remains active throughout the year rather than seasonal, creating a grounded and community-led atmosphere.",
        text2:
          "The town is particularly suited to full-time residents and professionals working across the border. From a property perspective, it appeals to buyers seeking affordability, stability and strong long-term rental demand supported by Gibraltar-based workers.",
      },
      santamargarita: {
        intro:
          "A peaceful residential enclave offering space, privacy and proximity to Gibraltar.",
        title: "Santa Margarita",
        text:
          "Santa Margarita has a more suburban feel, with larger villas and townhouses set along quieter streets. It provides a calmer alternative to town-centre living while remaining conveniently close to La Línea and the border.",
        text2:
          "It suits families, professionals and retirees looking for space and privacy without sacrificing accessibility. Properties here tend to perform best as long-term residences, offering steady tenant demand and a relaxed lifestyle setting.",
      },
      alcaidesa: {
        intro:
          "Modern coastal living with golf, sea views and a relaxed international feel.",
        title: "Alcaidesa",
        text:
          "Alcaidesa is defined by open landscapes, beachfront access and well-maintained residential developments overlooking Gibraltar and Africa. The setting feels peaceful and residential, with a strong international presence and emphasis on outdoor living.",
        text2:
          "It appeals to both permanent residents and second-home buyers seeking security and views. For investors, its proximity to Gibraltar and Sotogrande provides flexibility for medium-term tenants and seasonal golf-oriented rentals.",
      },
      sotogrande: {
        intro: "Prestigious marina living defined by privacy, golf and exclusivity.",
        title: "Sotogrande",
        text:
          "Sotogrande is one of Southern Spain’s most established luxury destinations, centred around its marina, championship golf courses and polo fields. The atmosphere is refined, discreet and community-focused rather than tourist-driven.",
        text2:
          "It attracts international buyers seeking space, privacy and long-term lifestyle value. Investment here is typically driven by capital preservation and premium positioning, with selective seasonal rental potential in prime properties.",
      },
      duquesa: {
        intro: "A charming marina setting with relaxed coastal energy.",
        title: "Duquesa",
        text:
          "La Duquesa blends beach access with a welcoming marina atmosphere, offering restaurants, cafés and an easy-going international community. It feels vibrant without being overwhelming, making it an approachable coastal base.",
        text2:
          "It suits retirees, second-home owners and lifestyle buyers looking for walkability and convenience. Apartments near the marina and beach often attract strong interest for both holiday and medium-term rentals.",
      },
      sabinillas: {
        intro: "Beachfront living with the stability of a real Spanish town.",
        title: "Sabinillas",
        text:
          "Sabinillas combines seaside charm with everyday practicality, supported by schools, supermarkets and year-round services. Unlike purely seasonal resorts, it maintains a strong permanent community.",
        text2:
          "This makes it particularly attractive for long-term residents and investors seeking stable rental demand. Its promenade and beach add lifestyle appeal while preserving a grounded, local atmosphere.",
      },
      casares: {
        intro:
          "Traditional Andalusian character combined with modern coastal developments.",
        title: "Casares",
        text:
          "Casares offers two distinct lifestyles: the picturesque white village in the hills and contemporary golf and beach communities along the coast. The contrast allows buyers to choose between rustic charm and resort-style convenience.",
        text2:
          "Village properties tend to attract those prioritising tranquillity and heritage, while coastal homes often provide stronger rental potential due to proximity to golf and the sea.",
      },
      estepona: {
        intro: "A revitalised coastal town balancing charm, growth and family living.",
        title: "Estepona",
        text:
          "Estepona has evolved into one of the Costa del Sol’s most desirable locations, known for its flower-lined old town, long promenade and continued infrastructure investment. It blends community character with modern coastal development.",
        text2:
          "It suits families, retirees and professionals seeking a balanced lifestyle. With demand from both permanent residents and holidaymakers, the property market here offers steady appeal and broad buyer interest.",
      },
      marbella: {
        intro: "Internationally recognised coastal living with prestige and vibrancy.",
        title: "Marbella",
        text:
          "Marbella combines historic Andalusian charm with luxury beach clubs, high-end retail and globally recognised marina districts. The lifestyle is dynamic, energetic and internationally visible.",
        text2:
          "It attracts buyers seeking quality, status and strong resale positioning. While entry levels are higher, long-term desirability and demand support premium property values in prime areas.",
      },
      benahavis: {
        intro: "Peaceful luxury living surrounded by golf, mountains and privacy.",
        title: "Benahavís",
        text:
          "Benahavís is characterised by gated communities, panoramic mountain views and high-quality residential developments just inland from the coast. The village itself retains charm and a reputation for fine dining.",
        text2:
          "It appeals particularly to retirees and high-end buyers seeking space and discretion. Investment here is typically focused on long-term appreciation within established premium communities.",
      },
      fuengirola: {
        intro: "A lively, well-connected coastal town with strong year-round energy.",
        title: "Fuengirola",
        text:
          "Fuengirola offers extensive beaches, a long promenade and direct train links to Málaga and the airport. It feels active and practical, supported by a strong permanent population.",
        text2:
          "It suits full-time residents and international buyers seeking convenience and accessibility. The mix of tourism and residential stability supports consistent rental demand and market liquidity.",
      },
      mijas: {
        intro:
          "Diverse living from traditional village charm to modern coastal communities.",
        title: "Mijas",
        text:
          "Mijas spans the hilltop charm of Mijas Pueblo and coastal areas such as La Cala, offering varied settings and property styles. This diversity creates flexibility across budgets and lifestyle preferences.",
        text2:
          "It appeals to both holiday buyers and long-term residents depending on micro-location. The range of options supports steady interest across different segments of the market.",
      },
      benalmadena: {
        intro:
          "A balanced mix of marina lifestyle, residential comfort and strong infrastructure.",
        title: "Benalmádena",
        text:
          "Benalmádena combines vibrant marina districts and beaches with quieter traditional neighbourhoods. Its accessibility and year-round amenities create a well-rounded living environment.",
        text2:
          "It suits families, retirees and professionals alike. For investors, the blend of tourism appeal and established residential demand offers balanced long-term potential.",
      },
    };

    function showArea(key) {
      const a = areas[key];
      if (!a) return;

      // Fill text WITHOUT nested <p> problems
      areaKicker.textContent = a.intro;
      areaTitle.textContent = a.title;
      areaIntro.textContent = a.text;
      areaText.textContent = a.text2;

      areaCta.textContent = `View properties in ${a.title}`;
      areaCta.href = `./properties.html?type=all&q=${encodeURIComponent(a.title)}`;

      areaCard.hidden = false;
      requestAnimationFrame(() => areaCard.classList.add("is-visible"));
    }

    areaSelect.addEventListener("change", (e) => showArea(e.target.value));
  }

})();

