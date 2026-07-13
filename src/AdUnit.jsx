import { useEffect, useRef } from 'react';

export default function AdUnit({ slot, style, width, height }) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // adsbygoogle.js may be blocked (ad blocker) or not yet loaded — fail silently
    }
  }, []);

  // Fixed width/height (no data-ad-format / full-width-responsive) locks the
  // ad to this exact shape — Google's "auto" responsive sizing otherwise
  // picks its own height and can render a full-width square on narrow screens.
  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'inline-block', width, height, ...style }}
      data-ad-client="ca-pub-6612118969935438"
      data-ad-slot={slot}
    />
  );
}
