import test from "tape";
import { html } from "sinuous";
import { scopeStyles } from "../src/scopeStyles";

// test("test", function (t) {
//   t.equal(1, 1);
//   t.end();
// });

test("test", function (t) {
  let view = html`<p>Something</p>`;
  console.log(view);
  t.equal(1, 1);
  t.end();
});
