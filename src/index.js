import { api, html as sinuousHtml, svg as sinuousSvg } from "sinuous";
import { root } from "sinuous/observable";
import scopeApi from "./scopeApi";

let { html, svg } = scopeApi(
  api,
  sinuousHtml,
  sinuousSvg,
  root
);

export { html, svg };
