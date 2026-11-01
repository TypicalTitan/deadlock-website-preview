// Navigation disclosures use ordinary buttons and links, including on touch and keyboards.
import { html } from 'htm/preact';
import { useEffect, useRef, useState } from 'preact/hooks';

export const navigationGroups = [
  { id: 'event', label: 'Event', links: [
    { href: '/rules', label: 'Rules' },
    { href: '/faq', label: 'FAQ' },
    { href: '/scrims', label: 'Scrims' },
    { href: '/schedule', label: 'Schedule' },
    { href: '/bracket', label: 'Bracket' },
    { href: '/champions', label: 'Champions' },
  ] },
  { id: 'players', label: 'Players', links: [
    { href: '/teams', label: 'Teams' },
    { href: '/players', label: 'Players' },
  ] },
  { id: 'mine', label: 'My tournament', links: [
    { href: '/me', label: 'Dashboard', who: 'signed in' },
    { href: '/profile', label: 'Profile', who: 'signed in' },
  ] },
  { id: 'tools', label: 'Tools', links: [
    { href: '/ref', label: 'Ref', who: 'refs' },
    { href: '/admin', label: 'Admin', who: 'admin' },
  ] },
];

const inSection = (href, path) => path === href || path.startsWith(`${href}/`);

export function Navigation({ path }) {
  const [expanded, setExpanded] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const navigation = useRef(null);
  const menuButton = useRef(null);
  const groupButtons = useRef({});

  const close = () => {
    setOpenGroup(null);
    setExpanded(false);
  };

  useEffect(close, [path]);

  useEffect(() => {
    const outside = event => {
      if (!navigation.current?.contains(event.target)) close();
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);

  const escape = event => {
    if (event.key !== 'Escape') return;
    if (openGroup !== null) {
      groupButtons.current[openGroup]?.focus();
      setOpenGroup(null);
    } else if (expanded) {
      menuButton.current?.focus();
      setExpanded(false);
    } else return;
    event.preventDefault();
    event.stopPropagation();
  };

  const follow = href => {
    // Following the current link does not remount the page, so keep focus on a visible control.
    if (href === path) {
      const button = menuButton.current;
      if (button?.getClientRects().length) button.focus();
      else groupButtons.current[openGroup]?.focus();
    }
    close();
  };

  return html`
    <nav class="site-navigation" aria-label="Main" ref=${navigation} onKeyDown=${escape}
      onFocusOut=${event => {
        if (event.relatedTarget && !navigation.current?.contains(event.relatedTarget)) close();
      }}>
      <button class="nav-menu-toggle" type="button" ref=${menuButton}
        aria-label=${expanded ? 'Close navigation' : 'Open navigation'}
        aria-expanded=${expanded} aria-controls="primary-navigation"
        onClick=${() => { setExpanded(!expanded); setOpenGroup(null); }}>
        <svg class="nav-menu-icon" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path d=${expanded ? 'M5 5l14 14M19 5L5 19' : 'M3 5h18M3 12h18M3 19h18'} />
        </svg>
        <span>Menu</span>
      </button>
      <div id="primary-navigation" class="nav-panel" data-expanded=${expanded}>
        <ul class="nav-groups">
          ${navigationGroups.map(group => {
            const active = group.links.some(link => inSection(link.href, path));
            return html`
              <li class="nav-group" key=${group.id} data-active=${active}>
                <button class="nav-group-toggle" id=${`nav-trigger-${group.id}`} type="button"
                  ref=${element => { groupButtons.current[group.id] = element; }}
                  data-active=${active} aria-expanded=${openGroup === group.id}
                  aria-controls=${`nav-panel-${group.id}`}
                  onClick=${() => setOpenGroup(openGroup === group.id ? null : group.id)}>
                  ${group.label}
                  <svg class="nav-chevron" width="12" height="8" viewBox="0 0 12 8" aria-hidden="true">
                    <path d="M1 1l5 5 5-5" />
                  </svg>
                </button>
                <ul class="nav-dropdown" id=${`nav-panel-${group.id}`} hidden=${openGroup !== group.id}
                  aria-labelledby=${`nav-trigger-${group.id}`}>
                  ${group.links.map(link => html`
                    <li key=${link.href}>
                      <a href=${`#${link.href}`} aria-current=${inSection(link.href, path) ? 'page' : undefined}
                        onClick=${() => follow(link.href)}>
                        ${link.label}${link.who && html` <span class="audience">(${link.who})</span>`}
                      </a>
                    </li>
                  `)}
                </ul>
              </li>
            `;
          })}
        </ul>
      </div>
    </nav>
  `;
}
