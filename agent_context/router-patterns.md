# Vue Router Patterns

## Router Configuration

```javascript
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AuthView from '@/views/AuthView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/auth',
      name: 'auth',
      component: AuthView
    },
    {
      path: '/conference/:room_id',
      name: 'conference',
      component: ConferenceComponent
    }
  ]
})

export default router
```

## Using Router in Components

### Basic Navigation

```vue
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goToHome() {
  router.push('/')
}

function goToAuth() {
  router.push('/auth')
}

function goToCompany() {
  router.push('/company')
}
</script>

<template>
  <Button @click="goToHome" label="Home" />
  <Button @click="goToAuth" label="Login" />
</template>
```

### Navigation with Parameters

```vue
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goToConference(roomId) {
  router.push(`/conference/${roomId}`)
}

// Or using named routes
function goToConferenceNamed(roomId) {
  router.push({ 
    name: 'conference', 
    params: { room_id: roomId } 
  })
}
</script>

<template>
  <Button @click="goToConference('room-123')" label="Join Room" />
</template>
```

### Accessing Route Parameters

```vue
<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

// Access params
const roomId = computed(() => route.params.room_id)

// Access query params
const filter = computed(() => route.query.filter)
</script>

<template>
  <div>Current Room: {{ roomId }}</div>
</template>
```

## Router Links in Templates

### Basic Router Link

```vue
<template>
  <router-link to="/">Home</router-link>
  <router-link to="/auth">Login</router-link>
  <router-link :to="`/user/${userId}`">Profile</router-link>
</template>
```

### Custom Router Link with PrimeVue Menu

```vue
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const items = ref([
  {
    label: 'Home',
    icon: 'pi pi-home',
    route: '/'
  },
  {
    label: 'Members',
    icon: 'pi pi-users',
    command: () => router.push('/members')
  }
])
</script>

<template>
  <Menu :model="items">
    <template #item="{ item, props }">
      <router-link 
        v-if="item.route" 
        v-slot="{ href, navigate }" 
        :to="item.route" 
        custom
      >
        <a v-ripple :href="href" v-bind="props.action" @click="navigate">
          <span :class="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
        </a>
      </router-link>
      <a v-else v-ripple v-bind="props.action" @click="item.command">
        <span :class="item.icon" />
        <span class="ml-2">{{ item.label }}</span>
      </a>
    </template>
  </Menu>
</template>
```

## Navigation Guards

### Component-Level Guards

```vue
<script setup>
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { root_store } from '@/stores/root_store'
import { storeToRefs } from 'pinia'

const router = useRouter()
const store = root_store()
const { session_data, companyId } = storeToRefs(store)

// Check authentication on mount
onMounted(() => {
  if (!session_data.value?.data?.session) {
    router.push('/auth')
    return
  }
  
  if (!companyId.value) {
    router.push('/company')
    return
  }
})

// Watch for session changes
watch(session_data, (newVal) => {
  if (!newVal?.data?.session) {
    router.push('/auth')
  }
})
</script>
```

### Conditional Redirects

```vue
<script setup>
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { root_store } from '@/stores/root_store'
import { storeToRefs } from 'pinia'

const router = useRouter()
const store = root_store()
const { session_data, companyId } = storeToRefs(store)

watch(session_data, async (newSession) => {
  if (newSession?.data?.session) {
    // User is logged in
    
    // Check if user has selected a company
    setTimeout(() => {
      if (!companyId.value) {
        console.log("No company selected")
        router.push('/company')
      }
    }, 2000)
    
    // Load initial data
    await store.get_members()
  } else {
    // User is not logged in
    router.push('/auth')
  }
})
</script>
```

## Programmatic Navigation Patterns

### Replace (No History Entry)

```javascript
// Replace current route (doesn't add to history)
router.replace('/auth')
```

### Go Back/Forward

```javascript
// Go back
router.back()

// Go forward
router.forward()

// Go to specific history position
router.go(-1)  // Back one page
router.go(1)   // Forward one page
```

### Navigation with Query Parameters

```javascript
// Add query parameters
router.push({
  path: '/search',
  query: { q: 'vue', filter: 'recent' }
})
// Results in: /search?q=vue&filter=recent

// Access query params
const searchQuery = route.query.q
```

## Active Link Styling

```vue
<template>
  <!-- Automatically adds 'router-link-active' class to active links -->
  <router-link to="/" class="nav-link">Home</router-link>
  
  <!-- Custom active class -->
  <router-link 
    to="/members" 
    active-class="active-menu-item"
    class="nav-link"
  >
    Members
  </router-link>
</template>

<style scoped>
.router-link-active {
  font-weight: bold;
  color: var(--p-primary-color);
}

.active-menu-item {
  background: var(--p-highlight-background);
}
</style>
```

## Common Patterns

### Redirect After Action

```javascript
async function createItem(data) {
  const result = await store.createItem(data)
  
  if (result.success) {
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Item created'
    })
    
    // Redirect to item detail page
    router.push(`/items/${result.data.id}`)
  }
}
```

### Conditional Navigation

```javascript
function handleNavigation() {
  if (!isAuthenticated.value) {
    router.push('/auth')
  } else if (!hasCompany.value) {
    router.push('/company')
  } else {
    router.push('/dashboard')
  }
}
```

### Navigation with Confirmation

```javascript
async function navigateWithConfirm(path) {
  if (hasUnsavedChanges.value) {
    const confirmed = confirm('You have unsaved changes. Continue?')
    if (!confirmed) return
  }
  
  router.push(path)
}
```
