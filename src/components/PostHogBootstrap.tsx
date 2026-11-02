"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";

/**
 * Product analytics for the main pharmacy site. Same PostHog project as the
 * clinic (clinic.twilightpharmacy.co.uk) so a visitor who lands here from
 * Google, Maps or ChatGPT and clicks through to the clinic is ONE person
 * with ONE journey: posthog-js persists its id in a cookie on the parent
 * domain, which both subdomains share. Added 2026-11-02 after a paying
 * clinic customer arrived from this site's homepage and nothing here could
 * say where they came from (GA4 property empty, Vercel Analytics login only).
 *
 * Path only, no query strings. No session recording.
 */
export function PostHogBootstrap() {
  const pathname = usePathname();
  const initialised = useRef(false);

  useEffect(() => {
    if (initialised.current) return;
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.posthog.com",
      capture_pageview: false,
      capture_pageleave: true,
      disable_session_recording: true,
      cross_subdomain_cookie: true,
      sanitize_properties: (properties) => {
        const raw = properties.$current_url as string | undefined;
        try {
          const p = raw ? new URL(raw).pathname : (properties.$pathname as string | undefined);
          if (p) {
            properties.$current_url = `https://www.twilightpharmacy.co.uk${p}`;
            properties.$pathname = p;
          }
        } catch {
          delete properties.$current_url;
          delete properties.$pathname;
        }
        return properties;
      },
    });
    initialised.current = true;
  }, []);

  useEffect(() => {
    if (!pathname || !process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    posthog.capture("$pageview");
  }, [pathname]);

  return null;
}
