import { BaseEventTrigger } from './BaseEventTrigger';
import { EventData, MatomoConfig } from '../types';

export class MatomoEventTrigger extends BaseEventTrigger {
  private siteId: string = '';
  private trackerUrl: string = '';
  private apiUrl: string = '';

  public async initialize(config: MatomoConfig): Promise<void> {
    if (!config.siteId || !config.trackerUrl) {
      throw new Error('Matomo configuration requires siteId and trackerUrl');
    }

    this.siteId = config.siteId;
    this.trackerUrl = config.trackerUrl;
    this.apiUrl = config.apiUrl || config.trackerUrl;

    await super.initialize(config);
  }

  protected async sendEvent(eventName: string, eventData: EventData): Promise<void> {
    const url = new URL(this.trackerUrl);
    url.searchParams.append('idsite', this.siteId);
    url.searchParams.append('rec', '1');
    url.searchParams.append('e_c', eventName);
    
    // Add event data as custom dimensions
    Object.entries(eventData).forEach(([key, value], index) => {
      url.searchParams.append(`dimension${index + 1}`, `${key}:${value}`);
    });

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        mode: 'no-cors',
      });

      if (this.config.debug) {
        console.log(`[MatomoEventTrigger] Event sent:`, {
          eventName,
          eventData,
          url: url.toString(),
        });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to send Matomo event: ${error.message}`);
      }
      throw new Error('Failed to send Matomo event: Unknown error occurred');
    }
  }
} 