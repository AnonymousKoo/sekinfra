"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./premium-home.module.css";

export function OperationsSchematic() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const context = gsap.context(() => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        // One short signal pass; the diagram remains legible without animation.
        gsap.fromTo("[data-signal]", { strokeDashoffset: 440, opacity: 0 }, {
          strokeDashoffset: 0, opacity: 0.85, duration: 2.6, stagger: 0.15, ease: "power1.inOut",
        });
        gsap.fromTo("[data-pulse]", { scale: 1, opacity: 0.65 }, {
          scale: 1.8, opacity: 0, transformOrigin: "50% 50%", duration: 1.1,
          repeat: 1, delay: 0.6, stagger: 0.15, ease: "power1.out",
        });
      });
      return () => media.revert();
    }, root);
    return () => context.revert();
  }, []);

  return (
    <figure ref={root} className={styles.schematic} aria-labelledby="schematic-caption">
      <div className={styles.schematicTop}><span>WHEN THE PIECES WORK TOGETHER</span><span aria-hidden="true">↗</span></div>
      <svg className={styles.diagram} viewBox="0 0 440 330" role="img" aria-labelledby="schematic-title schematic-description">
        <title id="schematic-title">People, processes and technology working toward outcomes</title>
        <desc id="schematic-description">An illustrative schematic connects three business foundations to shared outcomes. It is not a live system status.</desc>
        <g fill="none" stroke="#52737a" strokeWidth="1.5">
          <path d="M202 88 H238" /><path d="M202 242 H238" /><path d="M112 144 V186" /><path d="M328 144 V186" />
        </g>
        <g fill="none" stroke="#b9ef70" strokeWidth="2" strokeDasharray="12 440">
          <path data-signal="" d="M202 88 H238" /><path data-signal="" d="M112 144 V186" /><path data-signal="" d="M328 144 V186" /><path data-signal="" d="M202 242 H238" />
        </g>
        <g fill="#102229" stroke="#52737a">
          <rect x="22" y="32" width="180" height="112" rx="12" /><rect x="238" y="32" width="180" height="112" rx="12" />
          <rect x="22" y="186" width="180" height="112" rx="12" />
        </g>
        <g fill="#8ed7c6"><circle cx="44" cy="56" r="3" /><circle cx="260" cy="56" r="3" /><circle cx="44" cy="210" r="3" /></g>
        <g fill="none" stroke="#8ed7c6"><circle data-pulse="" cx="44" cy="56" r="6" /><circle data-pulse="" cx="260" cy="56" r="6" /><circle data-pulse="" cx="44" cy="210" r="6" /></g>
        <g fill="#b9ef70" fontSize="13" fontWeight="650" letterSpacing="1.1">
          <text x="40" y="83">PEOPLE</text><text x="256" y="83">PROCESSES</text><text x="40" y="237">TECHNOLOGY</text>
        </g>
        <g fill="#d2e1e1" fontSize="14">
          <text x="40" y="112">Clear ownership</text><text x="256" y="112">Less chasing</text><text x="40" y="266">Reliable systems</text>
        </g>
        <rect x="238" y="186" width="180" height="112" rx="12" fill="#b9ef70" />
        <text x="256" y="237" fill="#091217" fontSize="13" fontWeight="750" letterSpacing="1.1">OUTCOMES</text>
        <text x="256" y="266" fill="#112125" fontSize="14">Better operations</text>
      </svg>
      <figcaption id="schematic-caption" className={styles.schematicCaption}>
        <span aria-hidden="true">↳</span> One operation. Clearer decisions.
      </figcaption>
    </figure>
  );
}
