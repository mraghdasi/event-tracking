# Event Hub

A cross-platform event triggering package for React and Vue.js applications. This package provides a unified interface for sending events to various analytics services including Matomo, PostHog, and Google Analytics.

## Features

- Support for multiple analytics services (Matomo, PostHog, Google Analytics)
- Framework-agnostic implementation
- TypeScript support
- Easy to extend with new event tracking services
- Configurable through a simple JSON configuration
- Error handling and debugging support

## Installation

```bash
npm install event-hub
```

## Usage

### Basic Setup

```typescript
import { EventHub } from 'event-hub';

// Get the EventHub instance
const eventHub = EventHub.getInstance();

// Initialize with configuration
await eventHub.initialize({
  matomo: {
    enabled: true,
    siteId: 'your-site-id',
    trackerUrl: 'https://your-matomo-instance.com/matomo.php',
    debug: true
  },
  posthog: {
    enabled: true,
    apiKey: 'your-api-key',
    apiHost: 'https://app.posthog.com',
    debug: true
  },
  googleAnalytics: {
    enabled: true,
    measurementId: 'G-XXXXXXXXXX',
    apiSecret: 'your-api-secret',
    debug: true
  }
});

// Track an event
await eventHub.track('matomo', 'button_click', {
  buttonId: 'submit-button',
  page: 'checkout'
});
```

### Configuration Options

#### Matomo Configuration
```typescript
{
  enabled: boolean;
  siteId: string;
  trackerUrl: string;
  apiUrl?: string;
  debug?: boolean;
}
```

#### PostHog Configuration
```typescript
{
  enabled: boolean;
  apiKey: string;
  apiHost: string;
  debug?: boolean;
}
```

#### Google Analytics Configuration
```typescript
{
  enabled: boolean;
  measurementId: string;
  apiSecret?: string;
  debug?: boolean;
}
```

### React Example

```typescript
import React, { useEffect } from 'react';
import { EventHub } from 'event-hub';

const MyComponent: React.FC = () => {
  useEffect(() => {
    const eventHub = EventHub.getInstance();
    
    // Initialize event hub
    eventHub.initialize({
      matomo: {
        enabled: true,
        siteId: 'your-site-id',
        trackerUrl: 'https://your-matomo-instance.com/matomo.php'
      }
    });
  }, []);

  const handleClick = async () => {
    const eventHub = EventHub.getInstance();
    await eventHub.track('matomo', 'button_click', {
      buttonId: 'my-button',
      page: 'home'
    });
  };

  return <button onClick={handleClick}>Click Me</button>;
};
```

### Vue.js Example

```typescript
import { defineComponent, onMounted } from 'vue';
import { EventHub } from 'event-hub';

export default defineComponent({
  setup() {
    onMounted(async () => {
      const eventHub = EventHub.getInstance();
      
      // Initialize event hub
      await eventHub.initialize({
        posthog: {
          enabled: true,
          apiKey: 'your-api-key',
          apiHost: 'https://app.posthog.com'
        }
      });
    });

    const handleClick = async () => {
      const eventHub = EventHub.getInstance();
      await eventHub.track('posthog', 'button_click', {
        buttonId: 'my-button',
        page: 'home'
      });
    };

    return {
      handleClick
    };
  }
});
```

## Error Handling

The package includes built-in error handling and debugging capabilities. When `debug: true` is set in the configuration, detailed logs will be output to the console.

```typescript
try {
  await eventHub.track('matomo', 'button_click', {
    buttonId: 'submit-button'
  });
} catch (error) {
  console.error('Failed to track event:', error);
}
```

## Extending with New Event Triggers

To add a new event tracking service, create a new class that extends the `BaseEventTrigger` class:

```typescript
import { BaseEventTrigger } from 'event-hub';
import { EventData, BaseConfig } from 'event-hub';

export class CustomEventTrigger extends BaseEventTrigger {
  public async initialize(config: BaseConfig): Promise<void> {
    // Initialize your custom trigger
    await super.initialize(config);
  }

  protected async sendEvent(eventName: string, eventData: EventData): Promise<void> {
    // Implement your custom event sending logic
  }
}
```

## License

MIT 