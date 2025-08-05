import { EventHubConfig, EventHubInstance, EventTriggerType, EventData, EventMappingConfig } from './types';
import { MatomoEventTrigger } from './services/MatomoEventTrigger';
import { GoogleAnalyticsEventTrigger } from './services/GoogleAnalyticsEventTrigger';

export class EventHub<T extends EventMappingConfig = EventMappingConfig> implements EventHubInstance<T> {
  private static instance: EventHub;
  private triggers: Map<EventTriggerType, any> = new Map();
  private eventMapping: T | null = null;
  private initialized: boolean = false;

  private constructor() {
    this.triggers.set('matomo', new MatomoEventTrigger());
    this.triggers.set('googleAnalytics', new GoogleAnalyticsEventTrigger());
  }

  public static getInstance<U extends EventMappingConfig = EventMappingConfig>(): EventHub<U> {
    if (!EventHub.instance) {
      EventHub.instance = new EventHub();
    }
    return EventHub.instance as EventHub<U>;
  }

  private validateEventName(eventName: string): void {
    const eventNameRegex = /^[a-z]+(_[a-z]+)*_event$/;
    if (!eventNameRegex.test(eventName)) {
      throw new Error(`Event name '${eventName}' must be in snake_case format and end with '_event'`);
    }
  }

  private validateEventMapping(eventMapping: T): void {
    const availableTriggers = Array.from(this.triggers.keys());
    
    for (const [eventName, triggerTypes] of Object.entries(eventMapping)) {
      this.validateEventName(eventName);
      
      for (const triggerType of triggerTypes) {
        if (!availableTriggers.includes(triggerType as EventTriggerType)) {
          throw new Error(`Event trigger '${triggerType}' not available. Available triggers: ${availableTriggers.join(', ')}`);
        }
      }
    }
  }

  public async initialize(config: EventHubConfig, eventMapping: T): Promise<void> {
    if (this.initialized) {
      throw new Error('EventHub already initialized');
    }

    this.validateEventMapping(eventMapping);
    this.eventMapping = eventMapping;

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

  public async track<K extends keyof T>(eventName: K, eventData: EventData): Promise<void> {
    if (!this.initialized || !this.eventMapping) {
      throw new Error('EventHub not initialized. Call initialize() first.');
    }

    const triggerTypes = this.eventMapping[eventName];
    if (!triggerTypes) {
      throw new Error(`Event '${String(eventName)}' not found in event mapping configuration`);
    }

    const trackingPromises: Promise<void>[] = [];

    for (const triggerType of triggerTypes) {
      const trigger = this.triggers.get(triggerType);
      if (!trigger) {
        throw new Error(`Event trigger '${triggerType}' not found`);
      }
      trackingPromises.push(trigger.track(String(eventName), eventData));
    }

    await Promise.all(trackingPromises);
  }
} 