import { BaseEventTrigger } from './BaseEventTrigger';
import { EventData, GoogleAnalyticsConfig } from '../types';

export class GoogleAnalyticsEventTrigger extends BaseEventTrigger {
  private measurementId: string = '';
  private apiSecret: string = '';

  public async initialize(config: GoogleAnalyticsConfig): Promise<void> {
    if (!config.measurementId) {
      throw new Error('Google Analytics configuration requires measurementId');
    }

    this.measurementId = config.measurementId;
    this.apiSecret = config.apiSecret || '';

    await super.initialize(config);
  }

  protected async sendEvent(eventName: string, eventData: EventData): Promise<void> {
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${this.measurementId}${this.apiSecret ? `&api_secret=${this.apiSecret}` : ''}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: eventData.client_id || 'anonymous',
          events: [{
            name: eventName,
            params: {
              ...eventData,
              engagement_time_msec: eventData.engagement_time_msec || 100,
            },
          }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Google Analytics API responded with status: ${response.status}`);
      }

      if (this.config.debug) {
        console.log(`[GoogleAnalyticsEventTrigger] Event sent:`, {
          eventName,
          eventData,
        });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to send Google Analytics event: ${error.message}`);
      }
      throw new Error('Failed to send Google Analytics event: Unknown error occurred');
    }
  }
} 