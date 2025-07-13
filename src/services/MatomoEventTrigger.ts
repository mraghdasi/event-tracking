import { BaseEventTrigger } from "./BaseEventTrigger";
import { EventData, MatomoConfig } from "../types";

export class MatomoEventTrigger extends BaseEventTrigger {
  private siteId: string = "";
  private trackerUrl: string = "";
  private apiUrl: string = "";

  public async initialize(config: MatomoConfig): Promise<void> {
    if (!config.siteId || !config.trackerUrl) {
      throw new Error("Matomo configuration requires siteId and trackerUrl");
    }

    this.siteId = config.siteId;
    this.trackerUrl = config.trackerUrl;
    this.apiUrl = config.apiUrl || config.trackerUrl;

    await super.initialize(config);
  }

  protected async sendEvent(
    eventName: string,
    eventData: EventData
  ): Promise<void> {
    // Build the tracking URL with all required parameters
    const url = new URL(this.trackerUrl);

    // Required Matomo parameters
    url.searchParams.append("idsite", this.siteId);
    url.searchParams.append("rec", "1");

    // Page tracking parameters (required for context)
    url.searchParams.append(
      "action_name",
      eventData.pageTitle || document.title || "Event Tracking"
    );
    url.searchParams.append("url", eventData.pageUrl || window.location.href);
    url.searchParams.append("urlref", eventData.referrer || document.referrer);

    // Event tracking parameters
    url.searchParams.append("e_c", eventData.category || eventName);
    url.searchParams.append("e_a", eventData.action || eventName);
    url.searchParams.append("e_n", eventData.name || eventName);

    if (eventData.value !== undefined) {
      url.searchParams.append("e_v", eventData.value.toString());
    }

    Object.entries(eventData).forEach(([key, value], index) => {
      if (
        ![
          "category",
          "action",
          "name",
          "value",
          "pageTitle",
          "pageUrl",
          "referrer",
        ].includes(key)
      ) {
        url.searchParams.append(`dimension${index + 1}`, `${key}:${value}`);
      }
    });

    if (this.config.debug) {
      console.log(`[MatomoEventTrigger] Sending event:`, {
        eventName,
        eventData,
        url: url.toString(),
      });
    }

    try {
      // Use image beacon approach (standard for Matomo)
      const img = new Image();
      img.src = url.toString();

      // Wait for the image to load (or fail)
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          if (this.config.debug) {
            console.log(
              `[MatomoEventTrigger] Event sent successfully via image beacon`
            );
          }
          resolve();
        };
        img.onerror = () => {
          if (this.config.debug) {
            console.error(
              `[MatomoEventTrigger] Failed to send event via image beacon`
            );
          }
          reject(new Error("Failed to send Matomo event via image beacon"));
        };

        // Timeout after 5 seconds
        setTimeout(() => {
          reject(new Error("Matomo event tracking timeout"));
        }, 5000);
      });
    } catch (error: unknown) {
      if (this.config.debug) {
        console.error(`[MatomoEventTrigger] Error sending event:`, error);
      }

      // Fallback to fetch if image beacon fails
      try {
        const response = await fetch(url.toString(), {
          method: "GET",
          mode: "no-cors",
        });

        if (this.config.debug) {
          console.log(`[MatomoEventTrigger] Event sent via fetch fallback`);
        }
      } catch (fetchError) {
        if (this.config.debug) {
          console.error(
            `[MatomoEventTrigger] Fetch fallback also failed:`,
            fetchError
          );
        }
        throw new Error(
          `Failed to send Matomo event: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  }
}
