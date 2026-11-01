// The frame around every page: the phase banner, the tabs along the top and the account corner. Wireframe only:
// every required element is here, unstyled and with placeholder text, for the real design to replace.
import { html } from 'htm/preact';
import { useEffect, useRef } from 'preact/hooks';
import { discordProfile, signOut } from '../lib/supabase.js';

// The tabs along the top. `who` is who will see each tab once roles exist; the wireframe shows them all.
export const tabs = [
  { href: '/', label: 'Home', who: 'everyone' },
  { href: '/rules', label: 'Rules', who: 'everyone' },
  { href: '/faq', label: 'FAQ', who: 'everyone' },
  { href: '/teams', label: 'Teams', who: 'everyone' },
  { href: '/players', label: 'Players', who: 'everyone' },
  { href: '/scrims', label: 'Scrims', who: 'everyone' },
  { href: '/schedule', label: 'Schedule', who: 'everyone' },
  { href: '/bracket', label: 'Bracket', who: 'everyone' },
  { href: '/champions', label: 'Champions', who: 'everyone' },
  { href: '/me', label: 'Dashboard', who: 'signed in' },
  { href: '/profile', label: 'Profile', who: 'signed in' },
  { href: '/ref', label: 'Ref', who: 'refs' },
  { href: '/admin', label: 'Admin', who: 'admin' },
];

// "/teams/abc" still counts as being in Teams.
const inSection = (href, path) => (href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`));
const current = (href, path) => (inSection(href, path) ? 'page' : undefined);

let arrived = false; // false until the first page has rendered

// Every page calls this. It sets the tab title, and when the player comes from another page it starts at the top
// with focus on the page's heading (or on `selector`, such as one rules section), so keyboard and screen reader
// users land on the new page instead of the link they followed.
export function usePage(title, selector = 'h1') {
  useEffect(() => {
    document.title = title ? `${title} · Deadlock Tournament` : 'Deadlock Tournament';
  }, [title]);

  useEffect(() => {
    const firstLoad = !arrived;
    arrived = true;
    if (firstLoad && selector === 'h1') return; // a fresh page load keeps the browser's own focus
    const target = document.querySelector(`main ${selector}`);
    if (!target) return;
    if (selector === 'h1') window.scrollTo(0, 0);
    else target.scrollIntoView({ block: 'start' });
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }, [selector]);
}

function Account({ auth }) {
  if (!auth.session) return html`<a href="#/login">Sign in</a>`;
  return html`
    <span>[Avatar] ${discordProfile(auth.session).name}</span>
    <button type="button" onClick=${signOut}>Sign out</button>
  `;
}

export function Layout({ path, auth, children }) {
  const main = useRef(null);
  const skipToMain = event => {
    event.preventDefault(); // "#main" would otherwise be read as a route
    main.current?.focus();
  };

  return html`
    <a class="skip-link" href="#main" onClick=${skipToMain}>Skip to content</a>
    <p class="phase-banner">[Phase] · [Time until the next deadline]</p>
    <header class="site-header">
      <a class="site-name" href="#/">[Tournament name]</a>
      <nav aria-label="Main">
        <ul class="tabs">
          ${tabs.map(tab => html`
            <li key=${tab.href}>
              <a href=${`#${tab.href}`} aria-current=${current(tab.href, path)}>
                ${tab.label}${tab.who !== 'everyone' && html` <span class="audience">(${tab.who})</span>`}
              </a>
            </li>
          `)}
        </ul>
      </nav>
      <div class="account"><${Account} auth=${auth} /></div>
    </header>
    <p class="wireframe-note">
      Wireframe: text in [brackets] is a placeholder. P1 before signups open · P2 before scrim week · P3 before Round 1 · P4 nice to have.
    </p>
    ${auth.error && html`<p class="notice" role="alert">[Sign-in error message] (${auth.error})</p>`}
    <main id="main" ref=${main} tabindex="-1">${children}</main>
    <footer>[Footer: friends-only, run by fans, not affiliated with or endorsed by Valve]</footer>
  `;
}
