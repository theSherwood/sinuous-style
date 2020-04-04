import { scopeStyles } from "./scopeStyles";

/**
 * Wraps `api.h` and `api.hs` and returns a new api to use in place of `html` and `svg`.
 *
 * @param {Object} api - The default Sinuous api object
 * @param {Function} html - The default Sinuous `html` function
 * @param {Function} svg - The default Sinuous `svg` function
 * @param {Function} root - The default Sinuous `root` function
 * @return {{shtml, ssvg, html, svg}} `shtml` and `ssvg` for respecting scopes. `html` and `svg` for ignoring them. Note: the native sinuous `html` and `svg` will passively respect scopes. Do not use them if working with scoped styles.
 */
export default function scopeApi(api, html, svg, root) {
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
    if (args[0] === "style" && args[1] && (args[1].scoped || args[1].global)) {
      let scoped = args[1].scoped;
      let className = args[1].class;
      let modifiedScopeName =
        (scoped ? scopeName + "-scoped" : scopeName + "-global") +
        (className ? "-" + className : "");
      if (
        scopeNamesCache.has(modifiedScopeName) ||
        document.getElementById(modifiedScopeName)
      ) {
        return [];
      }
      scopeNamesCache.add(modifiedScopeName);
      args[1].id = modifiedScopeName;
      let rest = scoped ? scopeStyles(args.slice(2), scopeName) : args.slice(2);
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
    obj.class = obj.class ? obj.class + " " + scopeName : scopeName;
    args[1] = obj;
    return args;
  }

  // Creates a new `html` or `svg` that propagate the scope
  function respectScoping(fn) {
    return (...args) => {
      // If a new scopeName is set...
      if (args[0][0] === "" && typeof args[1] === "string") {
        // ...create a new scope...
        let outerScopeName = scopeName;
        scopeName = args[1];
        args[1] = "";
        // ...call the Sinuous `html` or `svg`...
        let result = fn(...args);
        // ...and return to the outer scope.
        scopeName = outerScopeName;
        return result;
      }
      // Otherwise, simply respect the outer scope.
      return fn(...args);
    };
  }

  const respectScopingHtml = respectScoping(html);
  const respectScopingSvg = respectScoping(svg);

  // Creates a new `html` and `svg` that block scope
  function blockScoping(fn) {
    return (...args) => {
      let outerScopeName = scopeName;
      // Create new, empty scope...
      scopeName = "";
      // ...call the Sinuous `html` or `svg`...
      let result = fn(...args);
      // ...and return to the outer scope.
      scopeName = outerScopeName;
      return result;
    };
  }

  const blockScopingHtml = blockScoping(html);
  const blockScopingSvg = blockScoping(svg);

  return {
    shtml: respectScopingHtml,
    ssvg: respectScopingSvg,
    html: blockScopingHtml,
    svg: blockScopingSvg,
  };
}
