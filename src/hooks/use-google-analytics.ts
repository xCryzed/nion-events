import { useEffect } from "react";

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

const GA_TRACKING_ID = "G-K8X4NT6DHP";

export const useGoogleAnalytics = () => {
  useEffect(() => {
    const checkConsent = () => {
      const consent = localStorage.getItem("cookieConsent");
      if (consent) {
        const preferences = JSON.parse(consent);
        if (preferences.marketing) {
          loadGoogleAnalytics();
        } else {
          removeGoogleAnalytics();
        }
      }
    };

    const loadGoogleAnalytics = () => {
      // Check if GA is already loaded
      if (
        document.querySelector(
          `script[src*="googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}"]`,
        )
      ) {
        // GA is already loaded, just configure it
        window.gtag("consent", "update", {
          analytics_storage: "granted",
        });
        return;
      }

      // Create and insert the gtag script
      const script1 = document.createElement("script");
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
      document.head.appendChild(script1);

      // Initialize dataLayer and gtag function
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };

      // Configure Google Analytics
      window.gtag("js", new Date());
      window.gtag("config", GA_TRACKING_ID, {
        page_title: document.title,
        page_location: window.location.href,
      });

      // Set consent
      window.gtag("consent", "default", {
        analytics_storage: "granted",
      });
    };

    const removeGoogleAnalytics = () => {
      // Remove GA scripts
      const gaScripts = document.querySelectorAll(
        'script[src*="googletagmanager.com"]',
      );
      gaScripts.forEach((script) => script.remove());

      // Disable GA if it's loaded
      if (window.gtag) {
        window.gtag("consent", "update", {
          analytics_storage: "denied",
        });
      }

      // Clear GA cookies
      const gaCookies = document.cookie
        .split(";")
        .filter(
          (cookie) =>
            cookie.trim().startsWith("_ga") ||
            cookie.trim().startsWith("_gid") ||
            cookie.trim().startsWith("_gat"),
        );

      gaCookies.forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name =
          eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
    };

    // Check initial consent
    checkConsent();

    // Listen for consent changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cookieConsent") {
        checkConsent();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for changes in the same tab
    const handleConsentChange = () => {
      setTimeout(checkConsent, 100); // Small delay to ensure localStorage is updated
    };

    window.addEventListener("cookieConsentChanged", handleConsentChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cookieConsentChanged", handleConsentChange);
    };
  }, []);
};

// Utility function to track page views
export const trackPageView = (path: string, title?: string) => {
  if (window.gtag) {
    const consent = localStorage.getItem("cookieConsent");
    if (consent) {
      const preferences = JSON.parse(consent);
      if (preferences.marketing) {
        window.gtag("config", GA_TRACKING_ID, {
          page_path: path,
          page_title: title || document.title,
        });
      }
    }
  }
};

// Utility function to track events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number,
) => {
  if (window.gtag) {
    const consent = localStorage.getItem("cookieConsent");
    if (consent) {
      const preferences = JSON.parse(consent);
      if (preferences.marketing) {
        window.gtag("event", action, {
          event_category: category,
          event_label: label,
          value: value,
        });
      }
    }
  }
};

// Utility function to track errors
export const trackError = (
  error: Error | string,
  category: string,
  component?: string,
  additionalData?: any,
) => {
  if (window.gtag) {
    const consent = localStorage.getItem("cookieConsent");
    if (consent) {
      const preferences = JSON.parse(consent);
      if (preferences.marketing) {
        const errorMessage = typeof error === "string" ? error : error.message;
        const errorStack =
          typeof error === "object" && error.stack ? error.stack : "";

        // Track as exception event
        window.gtag("event", "exception", {
          description: errorMessage,
          fatal: false,
        });

        // Track as custom error event with more details
        window.gtag("event", "client_error", {
          event_category: category,
          event_label: component || "unknown",
          custom_map: {
            error_message: errorMessage,
            error_stack: errorStack.substring(0, 500), // Limit stack trace length
            component: component || "unknown",
            additional_data: additionalData
              ? JSON.stringify(additionalData).substring(0, 500)
              : undefined,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            url: window.location.href,
          },
        });

        console.error(`[Error Tracking] ${category}:`, {
          error: errorMessage,
          component,
          additionalData,
          stack: errorStack,
        });
      }
    }
  }
};
