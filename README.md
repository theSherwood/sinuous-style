# sinuous-style

![Badge size](https://img.badgesize.io/https://unpkg.com/sinuous-style/dist/min.js?v=1&compression=gzip&label=gzip&style=flat-square)

Scoped styles for [Sinuous](https://github.com/luwes/sinuous) à la [styled-jsx](https://github.com/zeit/styled-jsx).

## Installation

There are two ways to consume sinuous-style

### ESM

Run the following inside your project directory:

`npm install sinuous-style`

At present, there is no configuration. You can use it wherever you are using [Sinuous](https://github.com/luwes/sinuous). It's possible this may change to make it more flexible.


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
let {shtml, ssvg, html, svg} = window.sinuousStyle(S.api, S.html, S.svg, S.root)
```

## Usage

TODO

## Limitations

At present, because of the way sinuous-style hijacks style elements, the style elements will not be removed from the dom when all corresponding component instances are removed from the dom. 

Usage of `>`, `~`, and `+` in selectors must be surrounded by whitespace.
Do `div > p`, not `div>p`.

## Acknowledgments and Thanks

[Wesley Luyten](https://github.com/luwes) 

- Author of [Sinuous](https://github.com/luwes/sinuous)

The whole team behind [styled-jsx](https://github.com/zeit/styled-jsx)

- The inspiration behind this library