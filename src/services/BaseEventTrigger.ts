import { BaseConfig, EventData, EventTrigger } from '../types';

export abstract class BaseEventTrigger implements EventTrigger {
  protected config: BaseConfig;
  protected initialized: boolean = false;

  constructor() {
    this.config = { enabled: false };
  }

  public async initialize(config: BaseConfig): Promise<void> {
    this.config = config;
    this.initialized = true;
    
    if (this.config.debug) {
      console.log(`[${this.constructor.name}] Initialized with config:`, config);
    }
  }

  public async track(eventName: string, eventData: EventData): Promise<void> {
    if (!this.initialized) {
      throw new Error(`${this.constructor.name} not initialized. Call initialize() first.`);
    }

    if (!this.config.enabled) {
      if (this.config.debug) {
        console.log(`[${this.constructor.name}] Tracking disabled for event:`, eventName);
      }
      return;
    }

    try {
      await this.sendEvent(eventName, eventData);
    } catch (error) {
      if (this.config.debug) {
        console.error(`[${this.constructor.name}] Error tracking event:`, error);
      }
      throw error;
    }
  }

  protected abstract sendEvent(eventName: string, eventData: EventData): Promise<void>;
} 