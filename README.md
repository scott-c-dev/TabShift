# TabShift

**A lightning-fast, keyboard-driven tool to split and merge Chrome tabs across windows.**

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-v1.0.0-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/tabshift/odalnjcnidkkapngkahmgjdakmajghge)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

**[Install from the Chrome Web Store →](https://chromewebstore.google.com/detail/tabshift/odalnjcnidkkapngkahmgjdakmajghge)**

<!-- TODO: add a demo GIF here — e.g. ![TabShift demo](docs/demo.gif) -->

---

## The problem

Chrome gives you no fast way to reshape your windows. Splitting a research tangent into its own
window means dragging tabs out one at a time; pulling a dozen scattered windows back together means
dragging them back. Both are mouse-only, both are slow, and both break your focus.

TabShift makes each operation a single keystroke or click.

## What it does

**Split** — move the active tab plus everything to its right (or left) into a brand-new window.

| Action | Shortcut (Win/Linux) | Shortcut (macOS) |
| --- | --- | --- |
| Split current + tabs to the right | `Alt+Shift+→` | `Ctrl+Shift+→` |
| Split current + tabs to the left | `Alt+Shift+←` | `Ctrl+Shift+←` |
| Open the merge popup | `Alt+Shift+M` | `Ctrl+Shift+M` |

Both split actions are also in the right-click menu on any page. The menu items disable themselves
when the split would be a no-op — for example when the active tab is the only tab, or when the split
would move every tab and just recreate the same window somewhere else.

**Merge** — the toolbar popup lists every other open window with a favicon strip of its tabs, so you
can recognize a window at a glance instead of by title. Tick the ones you want and merge them all
into your current window in one move.

## Design notes

A few decisions worth calling out, since they're the parts that took the most iteration:

- **The split logic is a pure function.** [`calculateTabIdsToMove`](src/tabs/calculateTabIdsToMove.ts)
  takes tabs, an active index, and a direction, and returns tab IDs — no Chrome API calls. The same
  function drives both the actual split and the enabled/disabled state of the context menu items, so
  the menu can never offer an action that would do nothing. It's also directly unit-testable without
  mocking the extension runtime.
- **Left splits prepend, right splits append.** Chrome's `tabs.move` doesn't preserve relative order
  for you. Moving a left-split with `index: -1` reverses the tabs; the new window is created around
  the active tab and the rest are inserted at `index: 0` so left-to-right order survives the move.
- **Focus follows intent.** The new window is created *with* the active tab rather than created empty
  and filled, which keeps the user's focus on the tab they invoked the split from.
- **Menu state is debounced.** Eight `chrome.tabs` / `chrome.windows` events can fire in a burst
  during a single drag; recomputing menu state on each one is wasted work, so updates are coalesced
  over a 200ms window.
- **Two permissions, no host access.** `tabs` and `contextMenus` — nothing else. TabShift never reads
  page content, and it makes no network requests of any kind.

## Tech stack

React 19 · TypeScript · Tailwind CSS v4 · Vite · [@crxjs/vite-plugin](https://crxjs.dev/) ·
Vitest · Manifest V3

## Development

Requires [pnpm](https://pnpm.io/) (enforced via `only-allow`).

```bash
pnpm install
pnpm dev     # dev server with HMR for the popup
pnpm build   # type-check + production build into dist/
pnpm test    # run the unit tests
pnpm lint    # eslint
```

To load the extension locally: run `pnpm build`, then open `chrome://extensions`, enable
**Developer mode**, and click **Load unpacked** on the generated `dist/` folder.

### Project layout

```
src/
├── background.ts                    # service worker: commands, context menus, split
├── App.tsx                          # popup root: window selection + merge
├── components/                      # popup UI
├── tabs/calculateTabIdsToMove.ts    # pure split logic (unit tested)
├── popup/calculateFaviconWindow.ts  # favicon strip windowing (unit tested)
└── utils/debounce.ts
manifest.config.ts                   # MV3 manifest, generated from package.json
```

## License

MIT © Xiaoyang (Scott) Chen — see [LICENSE](./LICENSE).
