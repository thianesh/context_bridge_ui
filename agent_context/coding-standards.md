# Frontend Coding Standards

## Vue Component Structure

### Standard Component Template

```vue
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'

// Store imports
import { root_store } from '@/stores/root_store'

// Component imports
import ChatMessage from '@/components/ChatMessage.vue'

// Initialize composables
const router = useRouter()
const toast = useToast()
const store = root_store()

// Destructure store state with storeToRefs
const { session_data, members, companyId } = storeToRefs(store)

// Local reactive state
const isVisible = ref(false)
const formData = ref({})
const items = ref([])

// Computed properties
const filteredItems = computed(() => 
  items.value.filter(item => item.active)
)

// Functions
async function fetchData() {
  try {
    const data = await store.get_members()
    items.value = data
  } catch (error) {
    console.error('Error:', error)
  }
}

// Lifecycle hooks
onMounted(async () => {
  await fetchData()
})

// Watchers
watch(session_data, (newVal) => {
  if (newVal?.data?.session) {
    fetchData()
  }
})
</script>

<template>
  <div>
    <!-- Template content -->
  </div>
</template>

<style scoped>
/* Component-specific styles if needed */
</style>
```

## Naming Conventions

### Variables and Functions
- **camelCase** for variables and functions
- Prefix booleans with `is`, `has`, `should`, `can`
- Use descriptive names

```javascript
// Good
const isLoading = ref(false)
const userData = ref({})
const hasPermission = computed(() => user.value.role === 'admin')

function getUserData() { }
function toggleVisibility() { }

// Avoid
const loading = ref(false)  // Less clear
const data = ref({})        // Too generic
```

### Components
- **PascalCase** for component names in imports
- **kebab-case** or **PascalCase** for file names (be consistent)

```javascript
// Imports
import ChatMessage from '@/components/ChatMessage.vue'
import TimedMessage from '@/components/Timedmessages.vue'
import Sidebar from '@/components/sidebar.vue'
```

## Reactive Data Patterns

### Use `ref()` for all reactive data

```javascript
// Primitives
const count = ref(0)
const message = ref('')
const isActive = ref(false)

// Objects and Arrays
const user = ref({})
const items = ref([])
const formData = ref({ name: '', email: '' })

// Access with .value
count.value++
items.value.push(newItem)
```

### Use `computed()` for derived state

```javascript
// Simple computed
const fullName = computed(() => 
  `${firstName.value} ${lastName.value}`
)

// Complex computed with filtering/sorting
const sortedMembers = computed(() => {
  return members.value.sort((a, b) => {
    const statusA = a.user_id in members_online.value ? 1 : 100
    const statusB = b.user_id in members_online.value ? 1 : 100
    return statusA - statusB
  })
})

// Computed with multiple dependencies
const canSubmit = computed(() => 
  formData.value.email && 
  formData.value.password && 
  !isLoading.value
)
```

### Use `watch()` for side effects

```javascript
// Watch single ref
watch(userId, async (newId) => {
  if (newId) {
    await fetchUserData(newId)
  }
})

// Watch multiple sources
watch([firstName, lastName], ([newFirst, newLast]) => {
  console.log(`Name changed to ${newFirst} ${newLast}`)
})

// Deep watch for objects
watch(formData, (newVal) => {
  saveToLocalStorage(newVal)
}, { deep: true })

// Immediate execution
watch(session_data, async (newSession) => {
  if (newSession?.data?.session) {
    await loadUserData()
  }
}, { immediate: true })
```

## Pinia Store Usage

### Always use `storeToRefs` for reactive properties

```javascript
import { root_store } from '@/stores/root_store'
import { storeToRefs } from 'pinia'

const store = root_store()

// ✅ CORRECT: Use storeToRefs for reactive state
const { session_data, members, companyId } = storeToRefs(store)

// ✅ CORRECT: Call methods directly on store
store.get_members()
store.signout()

// ❌ WRONG: Don't destructure state directly
const { session_data } = store  // Loses reactivity!
```

### Store Definition Pattern (Setup Syntax)

```javascript
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useMyStore = defineStore('myStore', () => {
  // State (ref)
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // Getters (computed)
  const itemCount = computed(() => items.value.length)
  const activeItems = computed(() => 
    items.value.filter(item => item.active)
  )
  
  // Actions (async functions)
  async function fetchItems() {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('/api/items')
      const data = await response.json()
      items.value = data
    } catch (e) {
      error.value = e.message
      console.error('Error fetching items:', e)
    } finally {
      loading.value = false
    }
  }
  
  function addItem(item) {
    items.value.push(item)
  }
  
  // Return everything that should be exposed
  return {
    // State
    items,
    loading,
    error,
    // Getters
    itemCount,
    activeItems,
    // Actions
    fetchItems,
    addItem
  }
})
```

## Async/Await Patterns

### Always use try-catch for error handling

```javascript
async function fetchData() {
  try {
    const response = await fetch(url)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching data:', error)
    alert('Unable to fetch data. Please try again.')
  }
}

// With Supabase
async function getMembers() {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
    
    if (error) throw error
    
    members.value = data
    return data
  } catch (error) {
    console.error('Error:', error.message)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load members',
      life: 3000
    })
  }
}
```

### Use async in lifecycle hooks

```javascript
onMounted(async () => {
  await loadInitialData()
  setupEventListeners()
})
```

## Props and Emits

### Define props with types

```javascript
// Simple props
const props = defineProps({
  username: String,
  message: String,
  isActive: Boolean,
  count: Number,
  items: Array,
  config: Object
})

// Props with defaults and validation
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  items: {
    type: Array,
    default: () => []
  }
})
```

### Define emits

```javascript
const emit = defineEmits(['update', 'delete', 'close'])

function handleUpdate(data) {
  emit('update', data)
}

function handleClose() {
  emit('close')
}
```

## Router Usage

```javascript
import { useRouter } from 'vue-router'

const router = useRouter()

// Navigate to routes
function goToHome() {
  router.push('/')
}

function goToUser(userId) {
  router.push(`/user/${userId}`)
}

function goToCompany() {
  router.push('/company')
}

// Named routes
function goToConference(roomId) {
  router.push({ 
    name: 'conference', 
    params: { room_id: roomId } 
  })
}
```

## Template Patterns

### Conditional Rendering

```vue
<template>
  <!-- v-if for conditional rendering -->
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="hasError">Error occurred</div>
  <div v-else>{{ content }}</div>
  
  <!-- v-show for toggling visibility (keeps in DOM) -->
  <div v-show="isVisible">Toggle content</div>
</template>
```

### List Rendering

```vue
<template>
  <!-- Always use :key with v-for -->
  <div v-for="item in items" :key="item.id">
    {{ item.name }}
  </div>
  
  <!-- With index -->
  <div v-for="(item, index) in items" :key="item.id">
    {{ index + 1 }}. {{ item.name }}
  </div>
  
  <!-- Filtering with computed -->
  <div v-for="member in sortedMembers" :key="member.user_id">
    {{ member.users.full_name }}
  </div>
</template>
```

### Event Handling

```vue
<template>
  <!-- Inline for simple operations -->
  <Button @click="isVisible = !isVisible" label="Toggle" />
  
  <!-- Method call for complex operations -->
  <Button @click="handleSubmit" label="Submit" />
  
  <!-- With arguments -->
  <Button @click="deleteItem(item.id)" label="Delete" />
  
  <!-- Event modifiers -->
  <form @submit.prevent="handleSubmit">
    <input @keyup.enter="search" />
  </form>
</template>
```

### Dynamic Styling

```vue
<template>
  <!-- Class binding -->
  <div :class="{ active: isActive, disabled: !canEdit }">
    Content
  </div>
  
  <!-- Style binding with CSS variables -->
  <div :style="{
    background: 'var(--p-button-primary-background)',
    color: 'var(--p-button-primary-color)'
  }">
    Styled content
  </div>
</template>
```

## Error Handling

### User-friendly error messages

```javascript
try {
  await performOperation()
} catch (error) {
  console.error('Operation failed:', error)
  alert('Unable to complete operation. Please try again after some time. If you face the same issue consistently, please contact support@example.com')
}
```

### Using Toast for notifications

```javascript
import { useToast } from 'primevue/usetoast'

const toast = useToast()

function showSuccess() {
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Operation completed successfully',
    life: 3000
  })
}

function showError(message) {
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: message,
    life: 5000
  })
}
```

## Comments

### Use comments for complex logic

```javascript
// Monitor connections to refresh if something is not right
const timerId = setInterval(() => {
  console.log("monitoring connection...")
  
  // Skip monitoring if disabled
  if (do_not_monitor.value) {
    clearInterval(timerId)
    return
  }
  
  // Check ICE gathering timeout
  if (Date.now() - iceGatherTime > 15000) {
    if (!isDataChannelOpen) {
      clearInterval(timerId)
      alert("Server not reachable, retrying...")
      location.reload()
    }
  }
}, 1000)
```

## VueUse Integration

### Use VueUse composables for common patterns

```javascript
import { useStorage } from '@vueuse/core'

// Persistent state with localStorage
const companyId = useStorage('company_id', '')
const theme = useStorage('theme', 'light')
const preferences = useStorage('preferences', {
  minimal: false
})

// Usage
companyId.value = 'new-company-id'  // Auto-syncs to localStorage
```
