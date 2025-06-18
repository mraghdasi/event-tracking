import { BaseEventTrigger } from './BaseEventTrigger';
import { EventData, PostHogConfig } from '../types';

export class PostHogEventTrigger extends BaseEventTrigger {
  private apiKey: string = '';
  private apiHost: string = '';

  public async initialize(config: PostHogConfig): Promise<void> {
    if (!config.apiKey || !config.apiHost) {
      throw new Error('PostHog configuration requires apiKey and apiHost');
    }

    this.apiKey = config.apiKey;
    this.apiHost = config.apiHost;

    await super.initialize(config);
  }

  protected async sendEvent(eventName: string, eventData: EventData): Promise<void> {
    const url = `${this.apiHost}/capture/`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          event: eventName,
          properties: {
            ...eventData,
            distinct_id: eventData.distinct_id || 'anonymous',
            time: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`PostHog API responded with status: ${response.status}`);
      }

      if (this.config.debug) {
        console.log(`[PostHogEventTrigger] Event sent:`, {
          eventName,
          eventData,
        });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to send PostHog event: ${error.message}`);
      }
      throw new Error('Failed to send PostHog event: Unknown error occurred');
    }
  }
} 