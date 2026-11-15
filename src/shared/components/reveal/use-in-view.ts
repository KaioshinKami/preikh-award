import { useEffect, useState, type RefObject } from 'react';

// threshold 0 + negative bottom margin: fires for elements taller than the viewport too.
const OBSERVER_OPTIONS: IntersectionObserverInit = { threshold: 0, rootMargin: '0px 0px -10% 0px' };

export function useInView(elementRef: RefObject<Element | null>): boolean {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      setIsInView(true);
      observer.disconnect();
    }, OBSERVER_OPTIONS);

    observer.observe(element);
    return () => observer.disconnect();
  }, [elementRef]);

  return isInView;
}
