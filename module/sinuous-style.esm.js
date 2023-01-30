import { api, html as html$1, svg as svg$1 } from 'sinuous';
import { root, cleanup } from 'sinuous/observable';

const isFunction = (item) => typeof item === 'function';

// Token types
const RULE_BLOCK = 1;
const COMMA = 2;
const AT_RULE = 3;
const WHITESPACE = 4;
const LIMITER = 5;
const FUNCTION = 6;
const SELECTOR = 7;
const END = 8;

/**
 * Tokenizes an array of style strings from a <style /> element.
 * Style elements can contain observables (or other values),
 * making the array of the following form:
 *
 * ['div { background: ', observableFn, '; }']
 *
 * Note: only obserables within a rule-block are expected.
 * Observables or other values in the place of selectors
 * or other css entities will lead to unexpected behavior.
 *
 * @param {Array} styles - An array of strings potentially interspersed with observables and other values
 * @return {Array} An array of tokens: RULE_BLOCK | COMMA | AT_RULE | WHITESPACE | LIMITER | FUNCTION | SELECTOR
 */
function tokenize(styles) {
  styles = styles.flatMap((section) =>
    typeof section === 'string' ? section.split('') : section
  );

  let tokens = [];
  let bracketStack = 0;
  let chars = [];
  let type;

  function pushToken() {
    tokens.push({
      token: chars.join(''),
      type,
    });
    type = undefined;
    chars = [];
  }

  let char;
  let charsLength;
  for (let i = 0; i < styles.length; i++) {
    char = styles[i];
    charsLength = chars.length;
    if (isFunction(char)) {
      if (charsLength) {
        pushToken();
      }
      tokens.push({ token: char, type: FUNCTION });
    } else if (bracketStack) {
      if (!charsLength) {
        type = RULE_BLOCK;
      }
      chars.push(char);
      if (char === '{') {
        bracketStack++;
      } else if (char === '}') {
        bracketStack--;
        if (!bracketStack) {
          pushToken();
        }
      }
    } else {
      if (char === '{') {
        if (charsLength) {
          pushToken();
        }
        bracketStack++;
        type = RULE_BLOCK;
        chars.push(char);
      } else if (char === ',') {
        if (charsLength && type !== AT_RULE) {
          pushToken();
        }
        type = COMMA;
        chars.push(char);
        pushToken();
      } else if ('>+~'.includes(char) && type !== SELECTOR) {
        if (charsLength && type !== AT_RULE) {
          pushToken();
          tokens.push({ token: char, type: LIMITER });
        } else {
          chars.push(char);
        }
      } else if (' \n\t\r'.includes(char)) {
        if (charsLength && ![WHITESPACE, AT_RULE].includes(type)) {
          pushToken();
        }
        type = WHITESPACE;
        chars.push(char);
      } else if (char === '@') {
        if (charsLength) {
          pushToken();
        }
        type = AT_RULE;
        chars.push(char);
      } else {
        if (!charsLength) {
          type = SELECTOR;
          chars.push(char);
        } else if ([SELECTOR, AT_RULE].includes(type)) {
          chars.push(char);
        } else {
          pushToken();
          type = SELECTOR;
          chars.push(char);
        }
      }
    }
  }

  if (chars.length) {
    pushToken();
  }

  return tokens;
}

/**
 * Adds the `scopeName` after tags but before ids, other classNames,
 * pseudoSelectors, and attribute selectors. For example:
 *
 * `div.some-class` becomes `div.<scopeName>.some-class`
 *
 * @param {String} selector - A css selector
 * @param {String} scopeName - The className used to scope the `selector`
 * @return {String}
 */
function insertScopeName(selector, scopeName) {
  let i = 0;
  while (!'#.:['.includes(selector[i]) && i !== selector.length) {
    i++;
  }
  let first = selector.slice(0, i);
  let second = selector.slice(i);
  return first + '.' + scopeName + second;
}

/**
 * @param {Array} styleTokens - The result of `tokenize(styles)`
 * @param {String} scopeName - The className used to scope the `Selector` tokens
 * @return {Array} An array of the form of `styles` passed to `tokenize`,
 * but with all the selectors scoped to `scopeName`
 */
function scopeSelectors(styleTokens, scopeName) {
  styleTokens.push({ type: END });
  let styles = styleTokens.reduce(
    (acc, token) => {
      let current = acc[0];
      let sections = acc[1];
      if (token.type === SELECTOR) {
        current.push(insertScopeName(token.token, scopeName));
      } else if (token.type === FUNCTION) {
        sections.push(current.join(''));
        sections.push(token.token);
        current = [];
      } else if (token.type === END) {
        sections.push(current.join(''));
        return sections;
      } else {
        current.push(token.token);
      }
      return [current, sections];
    },
    [
      [], // current section
      [], // sections thus far
    ]
  );
  return styles;
}

/**
 * Scopes `styles` from a <style /> element.
 * Style elements can contain observables (or other values),
 * making the `styles` array of the following form:
 *
 * ['div.classes { background: ', observableFn, '; }']
 *
 * It returns an array of the following form:
 *
 * ['div.scopeName.classes { background: ', observableFn, '; }']
 *
 * Note: only obserables within a rule-block are expected.
 * Observables or other values in the place of selectors
 * or other css entities will lead to unexpected behavior.
 *
 * @param {Array} styles - An array of style strings and inclusions (observables and other values)
 * @param {Array} scopeName - A string representing a className to inject into the styles
 * @return {Array} A `styles` array but with css selectors now scoped to the `scopeName`
 */
function scopeStyles(styles, scopeName) {
  return scopeSelectors(tokenize(styles), scopeName);
}

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

let head = document.querySelector('head');

function addStyleElement(styleElement) {
  head.append(styleElement);
}
function removeStyleByClassName(className) {
  for (let element of head.querySelectorAll('.' + className)) {
    if (element.nodeName === 'STYLE') {
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
  if (args[0] === 'style' && args[1] && (args[1].local || args[1].global)) {
    let props = args[1];
    let local = props.local;
    let className = props.class;
    props.class = scopeName + ' ' + (props.class || '');
    let modifiedScopeName =
      (local ? scopeName + '-local' : scopeName + '-global') +
      (className ? '-' + className : '');
    if (
      styleElementIds.has(modifiedScopeName) ||
      head.querySelector('#' + modifiedScopeName)
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
  if (isFunction(args[0])) {
    let staticScopeName = args[0].$s;
    for (let i = 2; i < args.length; i++) {
      if (isFunction(args[i])) {
        let temp = args[i];
        args[i] = () => wrapInScope(staticScopeName, temp);
      }
    }
  }

  /*
  Set the current value of `scopeName` to a variable so that the changing 
  `scopeName` variable (in the case that the `baseClass` is a function) 
  is not captured by the closure.
  */
  let staticScopeName = scopeName || '';
  if (staticScopeName) {
    let props = args[1] || {};
    let baseClass = props.class || '';
    props.class = isFunction(baseClass)
      ? () => baseClass() + ' ' + staticScopeName
      : baseClass
      ? baseClass + ' ' + staticScopeName
      : staticScopeName;
    args[1] = props;
  }
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
      return wrapInScope('', () => fn(...args));
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
            if (isFunction(item)) {
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
const html = wrapApiFunction(html$1);
const svg = wrapApiFunction(svg$1);

export { html, svg };
//# sourceMappingURL=sinuous-style.esm.js.map
