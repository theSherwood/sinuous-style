import { api, html, svg } from "sinuous";
import { root } from "sinuous/observable";
import scopeApi from "./scopeApi";

let { shtml, ssvg, html: ignoreScopingHtml, svg: ignoreScopingSvg } = scopeApi(
  api,
  html,
  svg,
  root
);

export { shtml, ssvg, ignoreScopingHtml as html, ignoreScopingSvg as svg };
