import { scopeStyles } from "./scopeStyles";

/**
 * Wraps `api.h` and `api.hs` and returns a new api to use in place of `html` and `svg`.
 *
 * @param {Object} api - The default Sinuous api object
 * @param {Function} html - The default Sinuous `html` function
 * @param {Function} svg - The default Sinuous `svg` function
 * @param {Function} root - The default Sinuous `root` function
 * @return {{html, svg}} Replaces the `html` and `svg` sinuous functions
 */
export default function scopeApi(api, sinuousHtml, sinuousSvg, root) {
  let scopeName;
  let scopeNamesCache = new Set([]);

  const pipe = (f, g) => (...args) => g(...f(...args));

  let originalH = api.h;
  // Wrap the native apis
  api.h = pipe(scopeElementClasses, api.h);
  api.hs = pipe(injectScopeName, api.hs);

  /* 
    If an appropriate style element, scope all selectors and inject the style element
    directly onto the body of the page. Otherwise, inject the scopeName. Return the
    `args` to be passed into `api.h`.
  */
  function scopeElementClasses(...args) {
    if (args[0] === "style" && args[1] && (args[1].local || args[1].global)) {
      let local = args[1].local;
      let className = args[1].class;
      let modifiedScopeName =
        (local ? scopeName + "-local" : scopeName + "-global") +
        (className ? "-" + className : "");
      if (
        scopeNamesCache.has(modifiedScopeName) ||
        document.getElementById(modifiedScopeName)
      ) {
        return [];
      }
      scopeNamesCache.add(modifiedScopeName);
      args[1].id = modifiedScopeName;
      let rest = local ? scopeStyles(args.slice(2), scopeName) : args.slice(2);
      let styleElement = root(() => originalH(args[0], args[1], ...rest));
      document.querySelector("body").append(styleElement);
      return [];
    } else {
      return injectScopeName(...args);
    }
  }

  /* 
    Inject the scopeName into every element as an additional className.
    Return the `args` to be passed into `api.h` or `api.hs`.  
  */
  function injectScopeName(...args) {
    let obj = args[1] ? args[1] : {};
    let baseClass = obj.class || "";
    /*
      Set the current value of `scopeName` to a variable so that the changing 
      `scopeName` variable (in the case that the `baseClass` is a function) 
      is not captured by the closure.
    */
    let scope = scopeName;
    obj.class =
      typeof baseClass === "function"
        ? () => baseClass() + " " + scope
        : baseClass + " " + scope;
    args[1] = obj;
    return args;
  }

  /*
    Wraps Sinuous `html` or `svg`. The wrapped functions handle scoping.

    The usage of that wrapped function is as follows:
      1. html('new-scope-name')`...` - sets a new scope ('new-scope-name')
      2. html()`...` - propagates the outer scope (useful in the case of conditionals)
      3. html`...` - blocks the outer scope
  */
  function createApi(fn) {
    return (...args) => {
      if (!arguments.length) {
        // html()`...` - propagate outer scope
        return () => fn(arguments);
      } else if (typeof args[0] === "string") {
        // html(scopeName)`...` - set a new scope
        return (...templateArgs) => {
          let outerScopeName = scopeName;
          // Create a new scope
          scopeName = args[0];
          // Call the Sinuous `html` or `svg`
          let result = fn(...templateArgs);
          // Return to outer scope
          scopeName = outerScopeName;
          return result;
        };
      } else if (Array.isArray(args[0])) {
        // html`...` - block outer scope
        let outerScopeName = scopeName;
        // Create empty scope
        scopeName = "";
        // Call the Sinuous `html` or `svg`
        let result = fn(...args);
        // Return to outer scope
        scopeName = outerScopeName;
        return result;
      }
    };
  }

  const html = createApi(sinuousHtml);
  const svg = createApi(sinuousSvg);

  return { html, svg };
}
