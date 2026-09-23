"use client";

import Script from "next/script";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface TurnstileRenderOptions {
  sitekey: string;
  theme?: "light" | "dark" | "auto";
  callback: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
}

interface TurnstileApi {
  render(
    container: HTMLElement,
    options: TurnstileRenderOptions
  ): string;

  reset(widgetId?: string): void;

  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

interface TurnstileWidgetProps {
  onTokenChange: (
    token: string | null
  ) => void;

  resetSignal?: number;
}

export function TurnstileWidget({
  onTokenChange,
  resetSignal = 0,
}: TurnstileWidgetProps) {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const widgetIdRef =
    useRef<string | null>(null);

  const [scriptReady, setScriptReady] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const siteKey =
    process.env
      .NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const renderWidget =
    useCallback(() => {
      if (
        !siteKey ||
        !scriptReady ||
        !window.turnstile ||
        !containerRef.current ||
        widgetIdRef.current
      ) {
        return;
      }

      widgetIdRef.current =
        window.turnstile.render(
          containerRef.current,
          {
            sitekey: siteKey,
            theme: "auto",

            callback(token) {
              setErrorMessage("");
              onTokenChange(token);
            },

            "expired-callback"() {
              onTokenChange(null);
            },

            "error-callback"() {
              onTokenChange(null);

              setErrorMessage(
                "Security verification failed. Please try again."
              );
            },
          }
        );
    }, [
      onTokenChange,
      scriptReady,
      siteKey,
    ]);

  useEffect(() => {
    renderWidget();
  }, [renderWidget]);

  useEffect(() => {
    if (
      resetSignal <= 0 ||
      !widgetIdRef.current ||
      !window.turnstile
    ) {
      return;
    }

    window.turnstile.reset(
      widgetIdRef.current
    );
  }, [resetSignal]);

  useEffect(() => {
    return () => {
      if (
        widgetIdRef.current &&
        window.turnstile
      ) {
        window.turnstile.remove(
          widgetIdRef.current
        );
      }

      widgetIdRef.current = null;
    };
  }, []);

  if (!siteKey) {
    return (
      <p
        role="alert"
        className="text-sm text-red-400"
      >
        Security verification is
        unavailable. Turnstile is not
        configured.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => {
          setScriptReady(true);
        }}
      />

      <div
        ref={containerRef}
        className="flex min-h-16 justify-center"
      />

      {errorMessage && (
        <p
          role="alert"
          className="text-sm text-red-400"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}