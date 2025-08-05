export type EventTriggerType = 'matomo' | 'googleAnalytics';

export interface EventData {
  [key: string]: any;
}

export interface BaseConfig {
  enabled: boolean;
  debug?: boolean;
}

export interface MatomoConfig extends BaseConfig {
  siteId: string;
  trackerUrl: string;
  apiUrl?: string;
}

export interface GoogleAnalyticsConfig extends BaseConfig {
  measurementId: string;
  apiSecret?: string;
}

export interface EventHubConfig {
  matomo?: MatomoConfig;
  googleAnalytics?: GoogleAnalyticsConfig;
}

export type EventMappingConfig<T extends string = string> = {
  [K in T]: EventTriggerType[];
};

export interface EventTrigger {
  initialize(config: BaseConfig): Promise<void>;
  track(eventName: string, eventData: EventData): Promise<void>;
}

export interface EventHubInstance<T extends EventMappingConfig = EventMappingConfig> {
  initialize(config: EventHubConfig, eventMapping: T): Promise<void>;
  track<K extends keyof T>(eventName: K, eventData: EventData): Promise<void>;
} 