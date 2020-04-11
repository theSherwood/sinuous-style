import { scopeStyles } from "./scopeStyles";
import { api, html as sinuousHtml, svg as sinuousSvg } from "sinuous";
import { root, cleanup } from "sinuous/observable";

let scopeName;
let scopeNameCounts = {};
let styleElementIds = new Set([]);

const pipe = (f, g) => (...args) => g(...f(...args));

let originalH = api.h;
// Wrap the native apis
api.h = pipe(scopeElementClasses, api.h);
api.hs = pipe(
  // Assume there will be no style elements nested inside svg
  injectScopeName,
  api.hs
);

let head = document.querySelector("head");

function addStyleElement(styleElement) {
  head.append(styleElement);
}
function removeStyleByClassName(className) {
  for (let element of head.querySelectorAll("." + className)) {
    if (element.nodeName === "STYLE") {
      /*
        Remove the style element id from the styleElementIds so that if another
        corresponding component is added, the style element will again
        be appended to the dom.
      */
      styleElementIds.delete(element.id);
      // Remove the style element from the dom.
      element.remove();
    }
  }
}

/* 
    If an appropriate style element, scope all selectors and inject the style element
    directly onto the body of the page. Otherwise, inject the scopeName. Return the
    `args` to be passed into `api.h`.
  */
function scopeElementClasses(...args) {
  if (args[0] === "style" && args[1] && (args[1].local || args[1].global)) {
    let props = args[1];
    let local = props.local;
    let className = props.class;
    props.class = scopeName + " " + (props.class || "");
    let modifiedScopeName =
      (local ? scopeName + "-local" : scopeName + "-global") +
      (className ? "-" + className : "");
    if (
      styleElementIds.has(modifiedScopeName) ||
      head.querySelector("#" + modifiedScopeName)
    ) {
      return [];
    }
    styleElementIds.add(modifiedScopeName);

    /* 
      Create a style element and append it to the document head rather than
      passing it through to be created by api.h in the normal fashion.
    */
    props.id = modifiedScopeName;
    let rest = local ? scopeStyles(args.slice(2), scopeName) : args.slice(2);
    let styleElement = root(() => originalH(args[0], props, ...rest));
    addStyleElement(styleElement);

    return [];
  } else {
    return injectScopeName(...args);
  }
}

/*
  Wraps the callback in a newScopeName.
*/
function wrapInScope(newScopeName, callback) {
  // Keep a reference to the outer scope.
  let outerScopeName = scopeName;
  // Create new scope.
  scopeName = newScopeName;
  let result = callback();
  // Reset the scope to the outer scope.
  scopeName = outerScopeName;
  return result;
}

/* 
  Inject the scopeName into every element as an additional className.
  Ensure that passed children are scoped lexically rather than dynamically.
  Return the `args` to be passed into `api.h` or `api.hs`.  
*/
function injectScopeName(...args) {
  /*
    If the node is a component wrap its children in the scope
    of where they apppear in the markup, not the scope of this
    component. The `$s` annotation on this component contains
    that `scopeName`.

    This makes the scope lexical rather than dynamic.
  */
  if (typeof args[0] === "function") {
    let staticScopeName = args[0].$s;
    for (let i = 2; i < args.length; i++) {
      let temp = args[i];
      args[i] = () => wrapInScope(staticScopeName, temp);
    }
  }

  let props = args[1] || {};
  let baseClass = props.class || "";
  /*
    Set the current value of `scopeName` to a variable so that the changing 
    `scopeName` variable (in the case that the `baseClass` is a function) 
    is not captured by the closure.
  */
  let staticScopeName = scopeName || "";
  props.class =
    typeof baseClass === "function"
      ? () => baseClass() + " " + staticScopeName
      : baseClass + " " + staticScopeName;
  args[1] = props;
  return args;
}

/*
  Wraps Sinuous `html` or `svg`. The wrapped functions handle scoping.

  The usage of that wrapped function is as follows:
    1. html('new-scope-name')`...` - sets a new scope ('new-scope-name')
    2. html()`...` - propagates the outer scope (useful in the case of conditionals)
    3. html`...` - blocks the outer scope
*/
function wrapApiFunction(fn) {
  return (...args) => {
    if (Array.isArray(args[0])) {
      // html`...` - block outer scope
      return wrapInScope("", () => fn(...args));
    } else {
      // html(scopeName)`...` - set a new scope
      // html()`...` - propagate outer scope
      return (...templateArgs) => {
        return wrapInScope(args.length ? args[0] : scopeName, () => {
          /*
            Annotate each child function with `$s` so that any
            child components that render passed children can give
            their children this `scopeName` rather than the `scopeName`
            of that component.

            This makes the scope lexical rather than dynamic.
          */
          for (let item of templateArgs) {
            if (typeof item === "function") {
              item.$s = scopeName;
            }
          }

          // Track how many elements using this particular scopeName
          // are present on the dom.
          let staticScopeName = scopeName;
          if (!scopeNameCounts[staticScopeName]) {
            scopeNameCounts[staticScopeName] = 1;
          } else scopeNameCounts[staticScopeName]++;
          // Remove the corresponding style elements when the
          // number of elements using this scopeName goes to 0.
          cleanup(() => {
            if (--scopeNameCounts[staticScopeName] < 1) {
              delete scopeNameCounts[staticScopeName];
              removeStyleByClassName(staticScopeName);
            }
          });
          return fn(...templateArgs);
        });
      };
    }
  };
}

// To be used in place of Sinuous `html` and `svg`
const html = wrapApiFunction(sinuousHtml);
const svg = wrapApiFunction(sinuousSvg);

export { html, svg };
