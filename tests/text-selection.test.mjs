import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../app/components/academy-interactions.tsx', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;

function harness() {
  const effects = [], refs = [], listeners = new Map(), timers = new Map();
  let timerId = 0, clearedSelections = 0;
  const selection = { isCollapsed: true, removeAllRanges() { clearedSelections++; } };
  class Element {
    constructor(tag, parent = null, text = '') { this.tag = tag; this.parent = parent; this.childNodes = text ? [{ nodeType: 3, textContent: text }] : []; }
    closest(selector) { return selector.split(',').includes(this.tag) ? this : this.parent?.closest(selector) ?? null; }
  }
  const root = { dataset: {}, removeAttribute() {} };
  const document = { body: { style: { userSelect: '' } }, documentElement: { dataset: {} }, addEventListener() {}, removeEventListener() {} };
  const window = {
    innerWidth: 1440, innerHeight: 900, devicePixelRatio: 1, performance: { now: () => 0 },
    addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener() {},
    setTimeout: (fn) => { timers.set(++timerId, fn); return timerId; }, clearTimeout: (id) => timers.delete(id),
    requestAnimationFrame: () => 1, cancelAnimationFrame() {}, getSelection: () => selection,
  };
  const exports = {};
  runInNewContext(compiled, {
    exports, window, document, Element, HTMLElement: Element, Node: { TEXT_NODE: 3 },
    require(name) {
      if (name === 'react') return {
        useCallback: fn => fn, useEffect: fn => effects.push(fn), useRef: value => { const ref = { current: value }; refs.push(ref); return ref; }, useState: value => [value, () => {}],
      };
      if (name === 'react/jsx-runtime') return { jsx: () => null, jsxs: () => null };
      if (name === './motion-preference') return { useMotionEnabled: () => true };
      return { default: {} };
    },
  });
  exports.AcademyInteractions();
  refs[0].current = { width: 1, height: 1 };
  refs[1].current = root;
  effects.forEach(fn => fn());
  const down = target => listeners.get('pointerdown')({ target, isPrimary: true, button: 0, pointerType: 'mouse', pointerId: 1, clientX: 10, clientY: 10 });
  return { Element, down, timers, selection, root, document, canvas: refs[0].current, clearedSelections: () => clearedSelections };
}

test('holding selectable text never starts drawing or clears a selection', () => {
  for (const tag of ['p', 'h1', 'h2', 'h3', 'h4', 'li', 'dt', 'dd', 'time', 'code', 'td', 'span']) {
    const h = harness();
    h.down(new h.Element('b', new h.Element(tag)));
    assert.equal(h.timers.size, 0, tag);
    assert.equal(h.canvas.width, 1);
    assert.equal(h.clearedSelections(), 0);
    assert.equal(h.document.body.style.userSelect, '');
  }
  const h = harness();
  h.down(new h.Element('div', null, 'Research · 2026'));
  assert.equal(h.timers.size, 0, 'unwrapped text also stays selectable');
});

test('blank space still draws, but an existing text selection takes priority', () => {
  const h = harness();
  h.down(new h.Element('div'));
  assert.equal(h.timers.size, 1);
  [...h.timers.values()][0]();
  assert.equal(h.root.dataset.drawing, 'true');
  assert.equal(h.canvas.width, 1440);
  const selected = harness();
  selected.down(new selected.Element('div'));
  selected.selection.isCollapsed = false;
  [...selected.timers.values()][0]();
  assert.equal(selected.root.dataset.drawing, undefined);
  assert.equal(selected.clearedSelections(), 0);
});
