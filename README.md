# sinuous-style

![Badge size](https://img.badgesize.io/https://unpkg.com/sinuous-style/dist/min.js?v=1&compression=gzip&label=gzip&style=flat-square)

Scoped styles for [Sinuous](https://github.com/luwes/sinuous) à la [styled-jsx](https://github.com/zeit/styled-jsx).

## Installation

There are two ways to consume sinuous-style

### ESM

Run the following inside your project directory:

`npm install sinuous-style`

At present, there is no configuration. You can use it wherever you are using [Sinuous](https://github.com/luwes/sinuous). It's possible this may change to make it more flexible.

[Example CodeSandbox](https://codesandbox.io/s/sinuous-style-esm-tkf5d)

### CDN

Put this into your HTML:

```html
<script src="https://unpkg.com/sinuous-style/dist/min.js"></script>
```

Consumed this way, sinuous-style must be configured. This script take will put the variable `sinuousStyle` into the global scope. Let's assume you have fetched [Sinuous](https://github.com/luwes/sinuous) in a similar fashion:

```html
<script src="https://unpkg.com/sinuous/dist/all.js"></script>
```

To get the sinuous-style api, you need to pass in some of the api from [Sinuous](https://github.com/luwes/sinuous) for wrapping: `api`, `html`, `svg`, and `root`.

```js
let { shtml, ssvg, html, svg } = window.sinuousStyle(
  S.api,
  S.html,
  S.svg,
  S.root
);
```

[Example CodeSandbox](https://codesandbox.io/s/sinuous-style-cdn-szdbi)

## Usage

### `shtml` and `ssvg`

These are used just like the native [Sinuous](https://github.com/luwes/sinuous) `html` and `svg` except that they take an optional first argument that sets a scope name.

```js
let view = shtml`${"scope-name"}
  <p>Some text.</p>
`;
```

That results in:

```html
<p class="scope-name">Some text.</p>
```

`shtml` and `ssvg` can also be nested to allow nested components with individually scoped styles.

```js
let aBoolean = true;
let view = shtml`${"scope-name"}
  <p>Some text.</p>
  ${() =>
    aBoolean &&
    shtml`${"other-scope-name"}
    <p>Some more text.</p>
  `}
`;
```

Which results in:

```html
<p class="scope-name">Some text.</p>
<p class="other-scope-name">Some more text.</p>
```

Alternatively, `shtml` and `ssvg` can be passed no new scope name, in which case the included elements use the outside scope.

```js
let aBoolean = true;
let view = shtml`${"scope-name"}
  <p>Some text.</p>
  ${() =>
    aBoolean &&
    shtml`
    <p>Some more text.</p>
  `}
`;
```

Resulting in:

```html
<p class="scope-name">Some text.</p>
<p class="scope-name">Some more text.</p>
```

### `html` and `svg`

The sinuous-style `html` and `svg` block scope and ought to be used in place of the [Sinuous](https://github.com/luwes/sinuous) `html` and `svg`, which will allow scopes to propagate. Use the sinuous-style `html` and `svg` like so:

```js
let aBoolean = true;
let view = shtml`${"scope-name"}
  <p>Some text.</p>
  ${() => aBoolean && html` <p>Some more text.</p> `}
`;
```

Which results in:

```html
<p class="scope-name">Some text.</p>
<p>Some more text.</p>
```

### `<style>`

Regular style tags with no passed attributes (`<style>`) act the same way they always do in [Sinuous](https://github.com/luwes/sinuous).

#### `<style global>`

Passed a `global` attribute, only one style element will be added to the dom regardless of how many times the component is rendered. It will also be appended directly to the `<body>` instead of being added where the component is rendered to the dom.

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

#### `<style scoped>`

Passed a `scoped` attribute, the style element acts exactly like `<style global>` except that all selectors will be scoped to the scope name.

For example:

```js
let view = shtml`${"scope-name"}
  <p class="some-other-class">Some text.</p>
  <style scoped>
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
  padding: 5px
}
```

Separating dynamic `scoped` styles from static `scoped` styles works in the same fashion as it does for `global` styles.

## Limitations

At present, because of the way sinuous-style hijacks style elements, the style elements will not be removed from the dom when all corresponding component instances are removed from the dom.

Usage of `>`, `~`, and `+` in selectors must be surrounded by whitespace.
Do `div > p`, not `div>p`.

Scoping within any @-rules, such as media queries, is not supported.

Scoping individual selectors with `:global()` as in [styled-jsx](https://github.com/zeit/styled-jsx) is not currently supported.

## Acknowledgments and Thanks

[Wesley Luyten](https://github.com/luwes)

- Author of [Sinuous](https://github.com/luwes/sinuous)

The whole team behind [styled-jsx](https://github.com/zeit/styled-jsx)

- The inspiration behind this library
