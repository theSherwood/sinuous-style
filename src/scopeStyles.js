import { isFunction } from "./utils";

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
    typeof section === "string" ? section.split("") : section
  );

  let tokens = [];
  let bracketStack = 0;
  let chars = [];
  let type;

  function pushToken() {
    tokens.push({
      token: chars.join(""),
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
      if (char === "{") {
        bracketStack++;
      } else if (char === "}") {
        bracketStack--;
        if (!bracketStack) {
          pushToken();
        }
      }
    } else {
      if (char === "{") {
        if (charsLength) {
          pushToken();
        }
        bracketStack++;
        type = RULE_BLOCK;
        chars.push(char);
      } else if (char === ",") {
        if (charsLength && type !== AT_RULE) {
          pushToken();
        }
        type = COMMA;
        chars.push(char);
        pushToken();
      } else if (">+~".includes(char) && type !== SELECTOR) {
        if (charsLength && type !== AT_RULE) {
          pushToken();
          tokens.push({ token: char, type: LIMITER });
        } else {
          chars.push(char);
        }
      } else if (" \n\t\r".includes(char)) {
        if (charsLength && ![WHITESPACE, AT_RULE].includes(type)) {
          pushToken();
        }
        type = WHITESPACE;
        chars.push(char);
      } else if (char === "@") {
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
  while (!"#.:[".includes(selector[i]) && i !== selector.length) {
    i++;
  }
  let first = selector.slice(0, i);
  let second = selector.slice(i);
  return first + "." + scopeName + second;
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
        sections.push(current.join(""));
        sections.push(token.token);
        current = [];
      } else if (token.type === END) {
        sections.push(current.join(""));
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
export function scopeStyles(styles, scopeName) {
  return scopeSelectors(tokenize(styles), scopeName);
}
