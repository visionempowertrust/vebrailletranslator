(function () {
  const TABLE = "tables/unicode.dis,tables/en-ueb-g1.ctb";

  function call(api, method, ...args) {
    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => {
        reject(new Error(`Liblouis ${method} timed out.`));
      }, 15000);

      api[method](...args, (result) => {
        window.clearTimeout(timer);
        resolve(result);
      });
    });
  }

  function patternsToUnicode(patterns) {
    return patterns
      .map((pattern) => (pattern === 0 ? " " : String.fromCharCode(0x2800 + pattern)))
      .join("");
  }

  window.liblouisEngine = {
    ready: false,
    failed: false,
    version: "",
    error: "",
    api: null,
    initPromise: null,

    async init() {
      if (this.ready) return this;
      if (this.failed) throw new Error(this.error || "Liblouis is unavailable.");
      if (this.initPromise) return this.initPromise;

      this.initPromise = (async () => {
        if (!window.LiblouisEasyApiAsync) {
          throw new Error("Liblouis Easy API is not loaded.");
        }

        this.api = new window.LiblouisEasyApiAsync({
          capi: "liblouis-build-utf16.js",
          easyapi: "liblouis-easy-api.js"
        });
        await call(this.api, "enableOnDemandTableLoading", "tables/");
        this.version = await call(this.api, "version");
        this.ready = true;
        return this;
      })();

      try {
        return await this.initPromise;
      } catch (error) {
        this.failed = true;
        this.error = error.message || String(error);
        throw error;
      }
    },

    async backTranslatePatterns(patterns) {
      await this.init();
      const unicodeBraille = patternsToUnicode(patterns);
      return call(this.api, "backTranslateString", TABLE, unicodeBraille);
    },

    patternsToUnicode
  };
})();
