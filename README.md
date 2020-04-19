# sinuous-style

![Badge size](https://img.badgesize.io/https://unpkg.com/sinuous-style/dist/min.js?v=1&compression=gzip&label=gzip&style=flat-square)

Scoped styles for [Sinuous](https://github.com/luwes/sinuous) à la [styled-jsx](https://github.com/zeit/styled-jsx).

## Installation

There are two ways to consume sinuous-style

### ESM

Run the following inside your project directory:

```
npm install sinuous-style
```

At present, there is no configuration. You can use it wherever you are using [Sinuous](https://github.com/luwes/sinuous). It's possible this may change to make it more flexible.

[Example CodeSandbox](https://codesandbox.io/s/sinuous-style-esm-tkf5d)

### CDN

Put this into your HTML:

```html
<script src="https://unpkg.com/sinuous-style/dist/min.js"></script>
```

Be sure you place it below your [Sinuous](https://github.com/luwes/sinuous) CDN, like this:

```html
<script src="https://unpkg.com/sinuous/dist/all.js"></script>
<script src="https://unpkg.com/sinuous-style/dist/min.js"></script>
```

This places a `sinuousStyle` property on the `window` object.

[Example CodeSandbox](https://codesandbox.io/s/sinuous-style-cdn-szdbi)

## Usage

Start by importing the sinuous-style api.

For ESM:

```js
import { html, svg } from 'sinuous-style';
```

For CDN:

```js
let { html, svg } = window.sinuousStyle;
```

Then simply use the sinuous-style `html` and `svg` throughout your project in place of the [Sinuous](https://github.com/luwes/sinuous) `html` and `svg`.

### `html` and `svg`

The syntax for `html` and `svg` is similar to the [Sinuous](https://github.com/luwes/sinuous) `html` and `svg`. The difference is that they they can be passed a string that will be used to scope the elements and styles within the markup.

With regards to scoping, there are three things that you might want a call to `html` or `svg` to do.

1. Set a new scope
2. Propagate the outer scope
3. Block outer scopes

For all examples, I will use `html`, but the examples apply similarly to `svg`.

**Set a New Scope**

The user must pass a string to the call to `html` that will be injected as a class name on all elements within that scope.

```js
let view = html('scope-name')`
  <p>Some text.</p>
`;
```

Results in:

```html
<p class="scope-name">Some text.</p>
```

**Propagate the Outer Scope**

This is particularly useful in the case of conditionals and other nested calls to `html` that logically ought to belong to the same scope as the rest of the elements in the component.

```js
let view = html('scope-name')`
  <p>Some text.</p>
  ${() =>
    condition &&
    html()`
    <p>Some more text.</p>
  `}
`;
```

Results in:

```html
<p class="scope-name">Some text.</p>
<p class="scope-name">Some more text.</p>
```

**Block Outer Scopes**

```js
let view = html` <p>Some text.</p> `;
```

Results in:

```html
<p>Some text.</p>
```

And:

```js
let view = html('scope-name')`
  <p>Some text.</p>
  ${() => condition && html` <p>Some more text.</p> `}
`;
```

Results in:

```html
<p class="scope-name">Some text.</p>
<p>Some more text.</p>
```

**Warning:**
[Sinuous](https://github.com/luwes/sinuous)' `html` and `svg` will propagate scopes, not block them. So be careful if mixing the api from [Sinuous](https://github.com/luwes/sinuous) and the api from sinuous-style. It is recommended that you not do that.

### `<style>`

Regular style tags with no `local` or `global` directives (`<style>`) act the same way they always do in [Sinuous](https://github.com/luwes/sinuous).

#### `<style global>`

Passed the `global` directive, only one style element will be added to the dom regardless of how many times the component is rendered. It will also be appended directly to the `<body>` instead of being added where the component is rendered to the dom.

As in [styled-jsx](https://github.com/zeit/styled-jsx), dynamic styling rules can be placed in separate style elements for performance reasons. To support multiple `global` style elements, give each a class unique to that scope.

For example:

```html
<!-- Dynamic Style -->
<style global class="dynamic">
  p {
    color: ${color}
  }
</style>

<!-- Static Style -->
<style global>
  p {
    padding: 5px;
  }
</style>
```

#### `<style local>`

Passed the `local` directive, the style element acts exactly like `<style global>` except that all selectors will be scoped to the scope name.

For example:

```js
let view = html('scope-name')`
  <p class="some-other-class">Some text.</p>
  <style local>
    p {
      padding: 5px
    }
  </style>
`;
```

The component renders to the dom as:

```html
<p class="some-other-class scope-name">Some text.</p>
```

And the style element renders to the dom as:

```css
p.scope-name {
  padding: 5px;
}
```

Separating dynamic `local` styles from static `local` styles works in the same fashion as it does for `global` styles.

## Limitations

Usage of `>`, `~`, and `+` in selectors must be surrounded by whitespace.
Do `div > p`, not `div>p`.

Scoping within any @-rules, such as media queries, is not supported.

Scoping individual selectors with `:global()` as in [styled-jsx](https://github.com/zeit/styled-jsx) is not currently supported.

## Differences from Styled-JSX

Unlike [styled-jsx](https://github.com/zeit/styled-jsx), sinuous-style is a runtime library. So it lacks some of the affordances of a compiler/transpiler library.

Namely, in sinuous-style, the unique string for establishing the scope must be entered by the user, whereas in [styled-jsx](https://github.com/zeit/styled-jsx) the scope string is generated by the library. So there are a few syntax differences as a result.

Another difference, as mentioned above, there is presently no support for `:global()` to selectively block scoping on a particular selector.

## Contributions

Pull requests and feedback are welcome! Please raise any issues or bugs that you find.

## Acknowledgments and Thanks

[Wesley Luyten](https://github.com/luwes)

- Author of [Sinuous](https://github.com/luwes/sinuous)

The whole team behind [styled-jsx](https://github.com/zeit/styled-jsx)

- The inspiration behind this library
