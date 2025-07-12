import { EventHubConfig, EventHubInstance, EventTriggerType, EventData } from './types';
import { MatomoEventTrigger } from './services/MatomoEventTrigger';
import { GoogleAnalyticsEventTrigger } from './services/GoogleAnalyticsEventTrigger';

export class EventHub implements EventHubInstance {
  private static instance: EventHub;
  private triggers: Map<EventTriggerType, any> = new Map();
  private initialized: boolean = false;

  private constructor() {
    this.triggers.set('matomo', new MatomoEventTrigger());
    this.triggers.set('googleAnalytics', new GoogleAnalyticsEventTrigger());
  }

  public static getInstance(): EventHub {
    if (!EventHub.instance) {
      EventHub.instance = new EventHub();
    }
    return EventHub.instance;
  }

  public async initialize(config: EventHubConfig): Promise<void> {
    if (this.initialized) {
      throw new Error('EventHub already initialized');
    }

    const initializationPromises: Promise<void>[] = [];

    if (config.matomo) {
      initializationPromises.push(this.triggers.get('matomo').initialize(config.matomo));
    }

    if (config.googleAnalytics) {
      initializationPromises.push(this.triggers.get('googleAnalytics').initialize(config.googleAnalytics));
    }

    await Promise.all(initializationPromises);
    this.initialized = true;
  }

  public async track(triggerType: EventTriggerType, eventName: string, eventData: EventData): Promise<void> {
    if (!this.initialized) {
      throw new Error('EventHub not initialized. Call initialize() first.');
    }

    const trigger = this.triggers.get(triggerType);
    if (!trigger) {
      throw new Error(`Event trigger '${triggerType}' not found`);
    }

    await trigger.track(eventName, eventData);
  }
} 