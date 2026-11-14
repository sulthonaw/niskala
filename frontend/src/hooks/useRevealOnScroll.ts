import { useEffect, useState } from 'react';

export function useRevealOnScroll(): [boolean, (el: HTMLElement | null) => void] {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    if (visible || !node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.01, rootMargin: '160px 0px 160px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [node, visible]);

  return [visible, setNode];
}
