/* global Log, Module, moment */

/* MagicMirror
 * Module: MMM-Face-Multi-User-Recognition-SMAI
 *
 * By James Macdonald
 * MIT Licensed.
 */

const DAY_PART = {
  MORNING: "morning",
  AFTERNOON: "afternoon",
  EVENING: "evening"
};

Module.register("MMM-Face-Multi-User-Recognition-SMAI", {
  defaults: {
    updateInterval: 10000,
    retryDelay: 5000,
    width: "200px",
    position: "lower_third",
    useMMMFaceRecoDNN: true,
    interval: 2000,
    morningStartTime: 3,
    morningEndTime: 12,
    afternoonStartTime: 12,
    afternoonEndTime: 17,
    imageType: "jpg",
    imageExtensions: ["jpg", "jpeg", "png", "webp", "gif"],
    animationSpeed: 300
  },

  requiresVersion: "2.35.0",

  start() {
    this.loggedIn = false;
    this.loaded = false;
    this.isLoading = false;
    this.errorMessage = null;
    this.timer = null;
    this.userName = this.getGuestName();
    this.userImage = "guest.gif";
    this.currentImageSrc = "";

    this.initializeModule().catch((error) => {
      this.errorMessage = `${this.getTranslation("ERROR_LOADING_IMAGE", "Could not load profile image.")} ${error.message}`;
      Log.error(`[${this.name}] Failed to initialize module: ${error.message}`);
      this.updateDom(this.config.animationSpeed);
    });
  },

  async initializeModule() {
    await this.loadUserImage(this.userImage);
    this.loaded = true;
    this.updateDom(this.config.animationSpeed);
  },

  getDom() {
    const wrapper = document.createElement("div");
    wrapper.className = "face-image";

    const title = document.createElement("div");
    title.className = "face-image__title";
    title.textContent = this.getTranslation("TITLE", "Face Login");
    wrapper.appendChild(title);

    if (this.errorMessage) {
      const errorElement = document.createElement("div");
      errorElement.className = "face-image__error";
      errorElement.textContent = this.errorMessage;
      wrapper.appendChild(errorElement);
      return wrapper;
    }

    if (!this.loaded || this.isLoading) {
      const loadingElement = document.createElement("div");
      loadingElement.className = "face-image__loading";
      loadingElement.textContent = this.getTranslation("LOADING", "Loading profile...");
      wrapper.appendChild(loadingElement);
      return wrapper;
    }

    const infoElement = document.createElement("div");
    infoElement.classList.add("face-image__content", this.config.position);
    infoElement.style.width = this.config.width;

    const greetingElement = document.createElement("p");
    greetingElement.className = "face-image__greeting";
    greetingElement.textContent = `${this.getGreetingMessage()} ${this.capitalizeWords(this.userName)}`;

    const img = document.createElement("img");
    img.className = "face-image__avatar";
    img.src = this.currentImageSrc;
    img.alt = `${this.capitalizeWords(this.userName)} profile image`;
    img.loading = "lazy";

    infoElement.append(greetingElement, img);
    wrapper.appendChild(infoElement);

    return wrapper;
  },

  getScripts() {
    return [];
  },

  getStyles() {
    return ["MMM-Face-Multi-User-Recognition-SMAI.css"];
  },

  getTranslations() {
    return {
      de: "translations/de.json",
      en: "translations/en.json",
      es: "translations/es.json",
      ko: "translations/ko.json"
    };
  },

  notificationReceived(notification, payload) {
    if (!this.config.useMMMFaceRecoDNN) {
      return;
    }

    if (notification === "USERS_LOGIN") {
      this.handleUserLogin(payload);
      return;
    }

    if (notification === "USERS_LOGOUT_MODULES") {
      this.handleUserLogout(payload);
    }
  },

  async handleUserLogin(payload) {
    if (this.loggedIn) {
      return;
    }

    const normalizedUser = this.normalizeUserName(payload);
    if (!normalizedUser) {
      this.errorMessage = this.getTranslation("INVALID_USER_PAYLOAD", "Received an invalid user payload.");
      Log.warn(`[${this.name}] Invalid USERS_LOGIN payload: ${payload}`);
      this.updateDom(this.config.animationSpeed);
      return;
    }

    this.loggedIn = true;
    this.userName = normalizedUser;

    const preferredImage = `${normalizedUser}.${this.config.imageType}`;
    await this.loadUserImage(preferredImage, normalizedUser);

    Log.info(`[${this.name}] User logged in: ${normalizedUser}`);
    this.updateDom(this.config.animationSpeed);
  },

  async handleUserLogout(payload) {
    Log.info(`[${this.name}] User logged out: ${payload || "unknown"}`);

    this.loggedIn = false;
    this.userName = this.getGuestName();

    await this.loadUserImage("guest.gif");
    this.updateDom(this.config.animationSpeed);
  },

  async loadUserImage(fileName, baseName = "") {
    this.isLoading = true;
    this.errorMessage = null;
    this.updateDom(this.config.animationSpeed);

    const candidateImages = this.getCandidateImageNames(fileName, baseName);

    for (const candidate of candidateImages) {
      const source = this.file(`public/${candidate}`);
      const exists = await this.canLoadImage(source);
      if (exists) {
        this.userImage = candidate;
        this.currentImageSrc = source;
        this.isLoading = false;
        return;
      }
    }

    this.isLoading = false;

    if (this.loggedIn) {
      this.errorMessage = `${this.getTranslation("ERROR_LOADING_IMAGE", "Could not load profile image for")} ${this.capitalizeWords(this.userName)}.`;
      this.currentImageSrc = this.file("public/guest.gif");
      return;
    }

    throw new Error(`Missing required fallback image: ${fileName}`);
  },

  getCandidateImageNames(fileName, baseName = "") {
    const imageExtensions = Array.isArray(this.config.imageExtensions)
      ? this.config.imageExtensions
      : [this.config.imageType];

    const candidates = new Set();

    if (fileName && fileName.includes(".")) {
      candidates.add(fileName);
    }

    if (baseName) {
      imageExtensions.forEach((extension) => candidates.add(`${baseName}.${extension}`));
    }

    if (fileName && !fileName.includes(".")) {
      imageExtensions.forEach((extension) => candidates.add(`${fileName}.${extension}`));
    }

    if (!this.loggedIn) {
      candidates.add("guest.gif");
    }

    return [...candidates];
  },

  canLoadImage(source) {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = source;
    });
  },

  normalizeUserName(name) {
    if (typeof name !== "string") {
      return "";
    }

    return name.trim();
  },

  getGuestName() {
    return this.getTranslation("GUEST_NAME", "Guest");
  },

  getGreetingMessage() {
    if (!this.loggedIn) {
      return this.getTranslation("WELCOME", "Welcome,");
    }

    const dayPart = this.timeOfDay();
    if (dayPart === DAY_PART.MORNING) {
      return this.getTranslation("GOOD_MORNING", "Good Morning,");
    }

    if (dayPart === DAY_PART.AFTERNOON) {
      return this.getTranslation("GOOD_AFTERNOON", "Good Afternoon,");
    }

    return this.getTranslation("GOOD_EVENING", "Good Evening,");
  },

  getTranslation(key, fallbackText) {
    const translated = this.translate(key);
    return translated === key ? fallbackText : translated;
  },

  capitalizeWords(value) {
    return value
      .toString()
      .toLowerCase()
      .split(" ")
      .filter(Boolean)
      .map((word) => `${word.charAt(0).toUpperCase()}${word.substring(1)}`)
      .join(" ");
  },

  timeOfDay() {
    const hour = moment().hour();

    if (hour >= this.config.morningStartTime && hour < this.config.morningEndTime) {
      return DAY_PART.MORNING;
    }

    if (hour >= this.config.afternoonStartTime && hour < this.config.afternoonEndTime) {
      return DAY_PART.AFTERNOON;
    }

    return DAY_PART.EVENING;
  }
});
