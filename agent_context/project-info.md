# Project Structure and Information

## Directory Structure

```
front-end/
├── src/
│   ├── assets/          # Static assets (CSS, images)
│   │   └── main.css     # Global styles
│   ├── components/      # Reusable Vue components
│   │   ├── ChatMessage.vue
│   │   ├── ConferenceComponent.vue
│   │   ├── Timedmessages.vue
│   │   ├── loader.vue
│   │   ├── mouse_events.vue
│   │   ├── rightbar.vue
│   │   └── sidebar.vue
│   ├── router/          # Vue Router configuration
│   │   └── index.js
│   ├── stores/          # Pinia stores
│   │   ├── root_store.js
│   │   └── webrtc_store.js
│   ├── util/            # Utility functions
│   ├── views/           # Page components (routes)
│   │   ├── AuthView.vue
│   │   ├── CompanyView.vue
│   │   ├── Conference.vue
│   │   ├── DownloadView.vue
│   │   ├── EmptyView.vue
│   │   ├── FeedBackView.vue
│   │   ├── HomeView.vue
│   │   ├── MembersView.vue
│   │   ├── RoomsView.vue
│   │   └── TimeLineView.vue
│   ├── App.vue          # Root component
│   └── main.js          # Application entry point
├── agent_context/       # AI agent context and examples
├── dist/                # Production build output
├── node_modules/        # Dependencies
├── index.html           # HTML entry point
├── package.json         # Project dependencies and scripts
├── vite.config.js       # Vite configuration
└── README.md
```

## Key Dependencies

### Core
- **vue**: ^3.5.13 - Vue.js framework
- **vue-router**: ^4.5.0 - Official router for Vue.js
- **pinia**: ^3.0.1 - State management

### UI & Styling
- **primevue**: ^4.3.4 - UI component library
- **@primeuix/themes**: ^1.1.1 - PrimeVue theming system
- **primeicons**: ^7.0.0 - Icon library
- **material-symbols**: ^0.32.0 - Material Design icons
- **tailwindcss**: ^4.1.11 - Utility-first CSS framework
- **tailwindcss-primeui**: ^0.6.1 - PrimeUI plugin for Tailwind

### Backend & API
- **@supabase/supabase-js**: ^2.49.8 - Supabase client

### Utilities
- **@vueuse/core**: ^13.3.0 - Collection of Vue composition utilities
- **@formkit/auto-animate**: ^0.8.2 - Animation library

### Forms
- **@primevue/forms**: ^4.3.5 - Form utilities for PrimeVue

### Build Tools
- **vite**: ^6.2.4 - Build tool
- **@vitejs/plugin-vue**: ^5.2.3 - Vue plugin for Vite
- **unplugin-vue-components**: ^28.5.0 - Auto-import components
- **@primevue/auto-import-resolver**: ^4.3.4 - PrimeVue auto-import

### Desktop
- **electron**: ^36.5.0 - Desktop app framework

## Import Aliases

```javascript
// @ alias points to src directory
import Component from '@/components/Component.vue'
import { root_store } from '@/stores/root_store'
import router from '@/router'
```

## Environment Variables

The project uses Supabase with hardcoded configuration in stores. For production, consider using environment variables:

```javascript
// Example (not currently used in project)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

## Scripts

```json
{
  "dev": "vite",              // Start development server
  "electron": "electron .",   // Run Electron app
  "build": "vite build"       // Build for production
}
```

## Routing Structure

```javascript
// Routes defined in src/router/index.js
{
  '/': EmptyView,
  '/auth': AuthView,
  '/company': CompanyView,
  '/rooms': RoomsView,
  '/members': MembersView,
  '/feedback': FeedBackView,
  '/conference/:room_id': ConferenceComponent,
  '/timeline': TimeLineView,
  '/download': DownloadView
}
```

## Theme Configuration

The app uses a custom "Noir" preset based on PrimeVue Aura theme:

```javascript
// From main.js
const Noir = definePreset(Aura, {
  semantic: {
    primary: { /* Zinc palette */ },
    surface: { /* Zinc palette */ }
  }
})

// Dark mode selector
darkModeSelector: '.my-app-dark'
```

## Component Auto-Import

PrimeVue components are auto-imported via `unplugin-vue-components`:

```javascript
// No need to import manually
<Button label="Click" />  // Works automatically
<Dialog v-model:visible="visible" />  // Works automatically
```

## State Management

The project uses Pinia with the setup syntax:

- **root_store**: Main application state (auth, members, rooms, etc.)
- **webrtc_store**: WebRTC connection state

## Styling Approach

1. **Tailwind CSS**: Utility classes for layout and spacing
2. **PrimeVue Theme**: Component styling via CSS variables
3. **Scoped Styles**: Component-specific styles when needed

## Best Practices

1. **File Naming**: 
   - Components: PascalCase or kebab-case (be consistent)
   - Stores: snake_case with `_store` suffix
   - Views: PascalCase with `View` suffix

2. **Component Organization**:
   - Small reusable components → `components/`
   - Page-level components → `views/`

3. **State Management**:
   - Global state → Pinia stores
   - Component state → Local refs
   - Persistent state → VueUse `useStorage`

4. **API Calls**:
   - Centralize in store actions
   - Use try-catch for error handling
   - Return consistent response format
