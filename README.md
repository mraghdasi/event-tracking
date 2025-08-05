# Event Hub

A cross-platform event triggering package for React and Vue.js applications. This package provides a unified interface for sending events to various analytics services including Matomo, and Google Analytics.

## Features

- Support for multiple analytics services (Matomo, Google Analytics)
- Framework-agnostic implementation
- TypeScript support
- Easy to extend with new event tracking services
- Configurable through a simple JSON configuration
- Error handling and debugging support

## Installation

```bash
npm install zarinpal-event-hub
yarn add zarinpal-event-hub
pnpm add zarinpal-event-hub
```

## Usage

### Basic Setup

```typescript
import { EventHub } from 'zarinpal-event-hub';

// Define your event mapping type for better TypeScript support
type MyEventMapping = {
  button_click_event: ['matomo', 'googleAnalytics'];
  page_view_event: ['googleAnalytics'];
  form_submit_event: ['matomo'];
};

// Get the EventHub instance with type support
const eventHub = EventHub.getInstance<MyEventMapping>();

// Initialize with configuration and event mapping
await eventHub.initialize(
  {
    matomo: {
      enabled: true,
      siteId: 'your-site-id',
      trackerUrl: 'https://your-matomo-instance.com/matomo.php',
      debug: true
    },
    googleAnalytics: {
      enabled: true,
      measurementId: 'G-XXXXXXXXXX',
      apiSecret: 'your-api-secret',
      debug: true
    }
  },
  {
    button_click_event: ['matomo', 'googleAnalytics'],
    page_view_event: ['googleAnalytics'],
    form_submit_event: ['matomo']
  }
);

// Track an event - will automatically send to configured SDKs
await eventHub.track('button_click_event', {
  category: 'User Interaction',
  action: 'Button Click',
  name: 'Submit Button',
  value: 1,
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
import { EventHub } from 'zarinpal-event-hub';

type AppEventMapping = {
  button_click_event: ['matomo'];
  page_view_event: ['googleAnalytics'];
};

const MyComponent: React.FC = () => {
  useEffect(() => {
    const eventHub = EventHub.getInstance<AppEventMapping>();
    
    // Initialize event hub with event mapping
    eventHub.initialize(
      {
        matomo: {
          enabled: true,
          siteId: 'your-site-id',
          trackerUrl: 'https://your-matomo-instance.com/matomo.php'
        },
        googleAnalytics: {
          enabled: true,
          measurementId: 'G-XXXXXXXXXX'
        }
      },
      {
        button_click_event: ['matomo'],
        page_view_event: ['googleAnalytics']
      }
    );
  }, []);

  const handleClick = async () => {
    const eventHub = EventHub.getInstance<AppEventMapping>();
    await eventHub.track('button_click_event', {
      category: 'User Interaction',
      action: 'Button Click',
      name: 'My Button',
      buttonId: 'my-button',
      page: 'home'
    });
  };

  return <button onClick={handleClick}>Click Me</button>;
};
```

### Vue.js 3 & Nuxt Example

#### Plugin Setup (`plugins/event-hub.client.js`)

```javascript
import { EventHub } from 'zarinpal-event-hub'

export default defineNuxtPlugin(async (nuxtApp) => {
  const eventHub = EventHub.getInstance()
  
  await eventHub.initialize(
    {
      matomo: {
        enabled: true,
        siteId: 'your-site-id',
        trackerUrl: 'https://your-matomo-instance.com/matomo.php',
        debug: true
      },
      googleAnalytics: {
        enabled: true,
        measurementId: 'G-XXXXXXXXXX',
        debug: true
      }
    },
    {
      button_click_event: ['matomo', 'googleAnalytics'],
      page_view_event: ['googleAnalytics'],
      form_submit_event: ['matomo']
    }
  )

  return {
    provide: {
      eventHub
    }
  }
})
```

#### Component Usage

```vue
<template>
  <div>
    <button @click="trackButtonClick">Track Button Click</button>
    <button @click="trackPageView">Track Page View</button>
  </div>
</template>

<script setup>
const { $eventHub } = useNuxtApp()

const trackButtonClick = async () => {
  try {
    await $eventHub.track('button_click_event', {
      category: 'User Interaction',
      action: 'Button Click',
      name: 'Example Button',
      buttonId: 'example-button',
      page: 'home'
    })
    console.log('Event tracked successfully!')
  } catch (error) {
    console.error('Failed to track event:', error)
  }
}

const trackPageView = async () => {
  try {
    await $eventHub.track('page_view_event', {
      page_title: 'Home Page',
      page_location: '/'
    })
    console.log('Page view tracked successfully!')
  } catch (error) {
    console.error('Failed to track page view:', error)
  }
}
</script>
```

## Matomo Event Tracking

### How Matomo Events Work

Matomo events require specific parameters to be properly tracked:

- **`category`** (e_c): The event category (e.g., "User Interaction", "E-commerce")
- **`action`** (e_a): The event action (e.g., "Button Click", "Form Submit")
- **`name`** (e_n): The event name (e.g., "Submit Button", "Contact Form")
- **`value`** (e_v): Optional numeric value for the event

### Where to Find Events in Matomo

After tracking events, you can find them in your Matomo dashboard:

1. **Events** section in the left sidebar
2. **Custom Events** report
3. **Event Tracking** section
4. **Real-time visitors** (if someone is currently on the site)

### Troubleshooting

If events are not appearing in Matomo:

1. **Check your configuration**:
   - Verify `siteId` is correct
   - Ensure `trackerUrl` points to your Matomo instance
   - Make sure `debug: true` is enabled to see console logs

2. **Test with the provided test files**:
   ```bash
   # Option 1: Open test-matomo.html in your browser
   # Option 2: Run test-matomo.js in browser console
   # Edit both files with your actual siteId and trackerUrl
   ```

3. **Check browser network tab**:
   - Look for requests to your Matomo URL
   - Verify the request parameters are correct

4. **Common issues**:
   - CORS issues (use `apiUrl` for server-side tracking)
   - Incorrect site ID
   - Matomo not configured for event tracking

### Example Event Structure

```typescript
await eventHub.track('button_click_event', {
  category: 'User Interaction',    // Required for Matomo
  action: 'Button Click',          // Required for Matomo  
  name: 'Submit Button',           // Required for Matomo
  value: 1,                        // Optional
  buttonId: 'submit-button',       // Custom dimension
  page: 'checkout'                 // Custom dimension
});
```

### Event Naming Convention

All event names must follow these rules:
- Use snake_case format (lowercase with underscores)
- End with `_event` suffix
- Examples: `button_click_event`, `form_submit_event`, `page_view_event`
- Invalid: `buttonClick`, `button-click`, `button_click` (missing _event suffix)

## Error Handling

The package includes built-in error handling and debugging capabilities. When `debug: true` is set in the configuration, detailed logs will be output to the console.

```typescript
try {
  await eventHub.track('button_click_event', {
    buttonId: 'submit-button'
  });
} catch (error) {
  console.error('Failed to track event:', error);
}
```

## Extending with New Event Triggers

To add a new event tracking service, create a new class that extends the `BaseEventTrigger` class:

```typescript
import { BaseEventTrigger } from 'zarinpal-event-hub';
import { EventData, BaseConfig } from 'zarinpal-event-hub';

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