
(() => {
  const header = document.querySelector("#header");
  const menuToggle = document.querySelector("#menu-toggle");
  const navLinks = document.querySelector("#nav-links");
  const form = document.querySelector("#booking-form");
  const submitButton = document.querySelector("#submit-button");
  const status = document.querySelector("#form-status");
  const serviceSelect = document.querySelector("#service");
  const dateInput = document.querySelector("#date");

  document.querySelector("#year").textContent = new Date().getFullYear();

  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  dateInput.min = today.toISOString().slice(0, 10);

  const updateHeader = () => {
    header.classList.toggle("scrolled", window.scrollY > 18);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
    navLinks.classList.remove("open");
    document.body.classList.remove("menu-open");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Abrir menú" : "Cerrar menú");
    navLinks.classList.toggle("open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) closeMenu();
  });

  document.querySelectorAll(".service-select").forEach(button => {
    button.addEventListener("click", () => {
      serviceSelect.value = button.dataset.service;
      serviceSelect.dispatchEvent(new Event("change", { bubbles: true }));

      document.querySelector("#turno").scrollIntoView({
        behavior: "smooth"
      });

      window.setTimeout(() => {
        serviceSelect.focus({ preventScroll: true });
      }, 450);
    });
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll(".reveal").forEach(element => {
      observer.observe(element);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(element => {
      element.classList.add("is-visible");
    });
  }

  const validators = {
    name: value =>
      value.trim().length >= 2
        ? ""
        : "Ingresá tu nombre (mínimo 2 caracteres).",

    phone: value =>
      value.replace(/\D/g, "").length >= 8
        ? ""
        : "Ingresá un teléfono con al menos 8 dígitos.",

    email: value =>
      !value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
        ? ""
        : "Revisá el formato del correo.",

    service: value =>
      value
        ? ""
        : "Elegí el servicio que te interesa.",

    date: value =>
      !value || value >= dateInput.min
        ? ""
        : "Elegí una fecha válida desde hoy."
  };

  const validateField = field => {
    const validator = validators[field.name];

    if (!validator) return true;

    const error = validator(field.value);
    const errorElement = document.querySelector(`#${field.name}-error`);

    field.setAttribute("aria-invalid", String(Boolean(error)));

    if (errorElement) {
      errorElement.textContent = error;
    }

    return !error;
  };

  Object.keys(validators).forEach(name => {
    const field = form.elements.namedItem(name);

    field.addEventListener("input", () => validateField(field));
    field.addEventListener("change", () => validateField(field));
    field.addEventListener("blur", () => validateField(field));
  });

  const setStatus = (message, isError = false) => {
    status.textContent = message;
    status.classList.toggle("error", isError);
    status.classList.add("visible");
  };

  form.addEventListener("submit", event => {
    event.preventDefault();

    status.classList.remove("visible", "error");

    const fields = Object.keys(validators).map(name =>
      form.elements.namedItem(name)
    );

    const results = fields.map(validateField);
    const isValid = results.every(Boolean);

    if (!isValid) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      firstInvalid?.focus();

      setStatus(
        "Revisá los campos marcados antes de continuar.",
        true
      );

      return;
    }

    submitButton.disabled = true;
    submitButton.classList.add("loading");
    submitButton.querySelector(".submit-label").textContent = "Procesando...";
    submitButton.querySelector(".submit-arrow").textContent = "";

    window.setTimeout(() => {
      const name = form.elements.namedItem("name")
        .value.trim().split(/\s+/)[0];

      const service = serviceSelect.value;

      setStatus(
        `¡Gracias, ${name}! Los datos de tu consulta por "${service}" son válidos. Esta es una demostración: la solicitud no se envió ni se guardó.`
      );

      submitButton.disabled = false;
      submitButton.classList.remove("loading");
      submitButton.querySelector(".submit-label").textContent = "Consulta validada";
      submitButton.querySelector(".submit-arrow").textContent = "✓";
    }, 1100);
  });
})();
