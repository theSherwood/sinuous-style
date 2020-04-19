import { html } from '../src/index';
import test from 'tape';

let head = document.querySelector('head');
function getStyleElement(selector) {
  return head.querySelector(selector);
}

test('html: simple markup', (t) => {
  let view = html`<p>foo</p>`;

  t.equal(view.outerHTML, '<p>foo</p>');
  t.end();
});

test('html(): simple markup', (t) => {
  let view = html()`<p>foo</p>`;

  t.equal(view.outerHTML, '<p>foo</p>');
  t.end();
});

test('html("scope"): simple markup', (t) => {
  let view = html('scope')`<p>foo</p>`;

  t.equal(view.outerHTML, '<p class="scope">foo</p>');
  t.end();
});

test('html("scope") and html: simple markup', (t) => {
  let view = html('scope')`<p>foo${() => html`<span>bar</span>`}</p>`;

  t.equal(view.outerHTML, '<p class="scope">foo<span>bar</span></p>');
  t.end();
});

test('html("scope") and html(): simple markup', (t) => {
  let view = html('scope')`<p>foo${() => html()`<span>bar</span>`}</p>`;

  t.equal(
    view.outerHTML,
    '<p class="scope">foo<span class="scope">bar</span></p>'
  );
  t.end();
});

test('html("scope") and html("inner-scope"): simple markup', (t) => {
  let view = html('scope')`<p>foo${() =>
    html('inner-scope')`<span>bar</span>`}</p>`;

  t.equal(
    view.outerHTML,
    '<p class="scope">foo<span class="inner-scope">bar</span></p>'
  );
  t.end();
});

test('html("scope"): global style', (t) => {
  let view = html('scope')`<p>foo</p><style global>p {}</style>`;
  t.equal(view.children[0].outerHTML, '<p class="scope">foo</p>');

  let globalStyle = getStyleElement('#scope-global');
  t.assert(globalStyle);
  if (globalStyle) {
    t.assert(globalStyle instanceof HTMLElement);
    t.assert(globalStyle.classList.contains('scope'));
    t.assert(globalStyle.textContent.includes('p {'));
  }

  t.end();
});

test('html("scope"): local style', (t) => {
  let view = html('scope')`<p>foo</p><style local>p {}</style>`;
  t.equal(view.children[0].outerHTML, '<p class="scope">foo</p>');

  let localStyle = getStyleElement('#scope-local');
  t.assert(localStyle);
  if (localStyle) {
    t.assert(localStyle instanceof HTMLElement);
    t.assert(localStyle.classList.contains('scope'));
    t.assert(localStyle.textContent.includes('p.scope {'));
  }

  t.end();
});

test('html("scope"): global and local styles', (t) => {
  let view = html(
    'scope'
  )`<p>foo</p><style global>p {}</style><style local>p {}</style>`;
  t.equal(view.children[0].outerHTML, '<p class="scope">foo</p>');

  let globalStyle = getStyleElement('#scope-global');
  t.assert(globalStyle);
  if (globalStyle) {
    t.assert(globalStyle instanceof HTMLElement);
    t.assert(globalStyle.classList.contains('scope'));
    t.assert(globalStyle.textContent.includes('p {'));
  }

  let localStyle = getStyleElement('#scope-local');
  t.assert(localStyle);
  if (localStyle) {
    t.assert(localStyle instanceof HTMLElement);
    t.assert(localStyle.classList.contains('scope'));
    t.assert(localStyle.textContent.includes('p.scope {'));
  }

  t.end();
});

test('html("scope"): global, local, and dynamic styles', (t) => {
  let view = html('scope')`
    <p>foo</p>
    <style global class="dynamic">p {}</style>
    <style global class="dynamic2">p {}</style>
    <style global>p {}</style>
    <style local class="dynamic">p {}</style>
    <style local class="dynamic2">p {}</style>
    <style local>p {}</style>
  `;
  t.equal(view.children[0].outerHTML, '<p class="scope">foo</p>');

  let globalStyleDynamic = getStyleElement('#scope-global-dynamic');
  t.assert(globalStyleDynamic);
  if (globalStyleDynamic) {
    t.assert(globalStyleDynamic instanceof HTMLElement);
    t.assert(globalStyleDynamic.classList.contains('scope'));
    t.assert(globalStyleDynamic.textContent.includes('p {'));
  }

  let globalStyleDynamic2 = getStyleElement('#scope-global-dynamic2');
  t.assert(globalStyleDynamic2);
  if (globalStyleDynamic2) {
    t.assert(globalStyleDynamic2 instanceof HTMLElement);
    t.assert(globalStyleDynamic2.classList.contains('scope'));
    t.assert(globalStyleDynamic2.textContent.includes('p {'));
  }

  let globalStyle = getStyleElement('#scope-global');
  t.assert(globalStyle);
  if (globalStyle) {
    t.assert(globalStyle instanceof HTMLElement);
    t.assert(globalStyle.classList.contains('scope'));
    t.assert(globalStyle.textContent.includes('p {'));
  }

  let localStyleDynamic = getStyleElement('#scope-local-dynamic');
  t.assert(localStyleDynamic);
  if (localStyleDynamic) {
    t.assert(localStyleDynamic instanceof HTMLElement);
    t.assert(localStyleDynamic.classList.contains('scope'));
    t.assert(localStyleDynamic.textContent.includes('p.scope {'));
  }

  let localStyleDynamic2 = getStyleElement('#scope-local-dynamic2');
  t.assert(localStyleDynamic2);
  if (localStyleDynamic2) {
    t.assert(localStyleDynamic2 instanceof HTMLElement);
    t.assert(localStyleDynamic2.classList.contains('scope'));
    t.assert(localStyleDynamic2.textContent.includes('p.scope {'));
  }

  let localStyle = getStyleElement('#scope-local');
  t.assert(localStyle);
  if (localStyle) {
    t.assert(localStyle instanceof HTMLElement);
    t.assert(localStyle.classList.contains('scope'));
    t.assert(localStyle.textContent.includes('p.scope {'));
  }

  t.end();
});
