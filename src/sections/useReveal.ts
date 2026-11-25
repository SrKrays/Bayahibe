import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Anima la entrada de todo lo que tenga [data-reveal] dentro de `ref`
 * cuando entra en pantalla. Los grupos [data-reveal-group] escalonan a sus hijos.
 */
export function useReveal(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]', root).forEach((el) => {
        gsap.from(el, {
          autoAlpha: 0,
          y: reduced ? 0 : 40,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal-group]', root).forEach((group) => {
        gsap.from(group.children, {
          autoAlpha: 0,
          y: reduced ? 0 : 36,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: { trigger: group, start: 'top 82%', once: true },
        });
      });
    }, root);

    return () => ctx.revert();
  }, [ref]);
}
