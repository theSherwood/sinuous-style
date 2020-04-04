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
 * @return {Array} An array of tokens: Rule-Block | Comma | @-Rule | Whitespace | Limiter | Selector
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
  for (let i = 0; i < styles.length; i++) {
    char = styles[i];
    if (typeof char === "function") {
      if (chars.length) {
        pushToken();
      }
      tokens.push({ token: char, type: "Function" });
    } else if (bracketStack) {
      if (!chars.length) {
        type = "Rule-Block";
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
        if (chars.length) {
          pushToken();
        }
        bracketStack++;
        type = "Rule-Block";
        chars.push(char);
      } else if (char === ",") {
        if (chars.length && type !== "@-Rule") {
          pushToken();
        }
        type = "Comma";
        chars.push(char);
        pushToken();
      } else if (">+~".includes(char) && type !== "Selector") {
        if (chars.length && type !== "@-Rule") {
          pushToken();
          tokens.push({ token: char, type: "Limiter" });
        } else {
          chars.push(char);
        }
      } else if (" \n\t\r".includes(char)) {
        if (chars.length && !["Whitespace", "@-Rule"].includes(type)) {
          pushToken();
        }
        type = "Whitespace";
        chars.push(char);
      } else if (char === "@") {
        if (chars.length) {
          pushToken();
        }
        type = "@-Rule";
        chars.push(char);
      } else {
        if (!chars.length) {
          type = "Selector";
          chars.push(char);
        } else if (["Selector", "@-Rule"].includes(type)) {
          chars.push(char);
        } else {
          pushToken();
          type = "Selector";
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
 *
 * @param {Array} styleTokens - The result of `tokenize(styles)`
 * @param {String} scopeName - The className used to scope the `Selector` tokens
 * @return {Array} An array of the form of `styles` passed to `tokenize`,
 * but with all the selectors scoped to `scopeName`
 */
function scopeSelectors(styleTokens, scopeName) {
  styleTokens.push({ type: "End" });
  let sections = styleTokens.reduce(
    (acc, token) => {
      if (token.type === "Selector") {
        acc.currentSection.push(insertScopeName(token.token, scopeName));
      } else if (token.type === "Function") {
        acc.sections.push(acc.currentSection.join(""));
        acc.sections.push(token.token);
        acc.currentSection = [];
      } else if (token.type === "End") {
        acc.sections.push(acc.currentSection.join(""));
        return acc.sections;
      } else {
        acc.currentSection.push(token.token);
      }
      return acc;
    },
    { currentSection: [], sections: [] }
  );
  return sections;
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
