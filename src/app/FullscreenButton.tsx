import { useEffect, useState } from 'react';

/**
 * Full-screen toggle. Works standalone and inside embeds (e.g. Google Sites). If the embedding
 * iframe doesn't allow fullscreen, it opens the game in its own browser tab instead.
 */
export function FullscreenButton() {
  const [full, setFull] = useState(false);
  useEffect(() => {
    const on = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', on);
    return () => document.removeEventListener('fullscreenchange', on);
  }, []);

  const openInNewTab = () => {
    // Re-open this exact page (it is a single self-contained file) in a new tab.
    const html = '<!doctype html>\n' + (window as unknown as { __S26_SOURCE__?: string }).__S26_SOURCE__;
    if ((window as unknown as { __S26_SOURCE__?: string }).__S26_SOURCE__) {
      const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
      window.open(url, '_blank');
    } else {
      window.open(window.location.href, '_blank');
    }
  };

  const toggle = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.fullscreenEnabled) await document.documentElement.requestFullscreen();
      else openInNewTab();
    } catch {
      openInNewTab();
    }
  };

  return (
    <button className="fs-btn" onClick={toggle} title={full ? 'Exit full screen' : 'Full screen'} aria-label={full ? 'Exit full screen' : 'Full screen'}>
      {full ? '⤡' : '⛶'}
    </button>
  );
}
