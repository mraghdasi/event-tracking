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

export interface EventTrigger {
  initialize(config: BaseConfig): Promise<void>;
  track(eventName: string, eventData: EventData): Promise<void>;
}

export interface EventHubInstance {
  initialize(config: EventHubConfig): Promise<void>;
  track(triggerType: EventTriggerType, eventName: string, eventData: EventData): Promise<void>;
} 