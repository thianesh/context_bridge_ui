# Sidebar Navigation Component

This example shows a navigation component using PrimeVue Menu with Vue Router integration.

```vue
<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { root_store } from '@/stores/root_store'
import { storeToRefs } from 'pinia'

const store = root_store()
const { session_data, companyId, is_admin } = storeToRefs(store)
const router = useRouter()

const items = ref([
  {
    label: 'Home',
    icon: 'pi pi-home',
    route: '/'
  },
  {
    label: 'members',
    icon: 'pi pi-users',
    command: () => {
      router.push('/members')
    }
  },
  {
    label: 'rooms',
    icon: 'pi pi-box',
    command: () => {
      router.push('/rooms')
    }
  },
  {
    label: 'space',
    icon: 'pi pi-building',
    command: () => {
      router.push('/company')
    }
  },
  {
    label: 'feedback',
    icon: 'pi pi-verified',
    command: () => {
      router.push('/feedback')
    }
  },
  {
    label: 'timeline',
    icon: 'pi pi-trophy',
    command: () => {
      router.push('/timeline')
    }
  },
  {
    label: 'download & tutorial',
    icon: 'pi pi-code',
    command: () => {
      router.push('/download')
    }
  }
])

// Filter menu items based on conditions
const visibleItems = computed(() => 
  items.value.filter(menuItem => 
    menuItem.label === 'space' || 
    companyId.value || 
    menuItem.label === 'download & tutorial'
  )
)
</script>

<template>
  <div class="card flex justify-center">
    <Menu :model="visibleItems">
      <template #item="{ item, props }">
        <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
          <a v-ripple :href="href" v-bind="props.action" @click="navigate">
            <span :class="item.icon" />
            <span class="ml-2">{{ item.label }}</span>
          </a>
        </router-link>
        <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
          <span :class="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
        </a>
      </template>
    </Menu>
  </div>
  <br>
  <Message class="text-center" :severity="is_admin ? 'success' : 'secondary'">
    Role: {{ is_admin ? "Admin" : "Member" }}
  </Message>
  <br>
  <Button 
    style="width: 100%;"
    @click="store.signout" 
    severity="contrast" 
    variant="outlined"  
    icon="pi pi-sign-out" 
    label="Sign out"
    v-if="session_data?.data?.session"
  />
</template>
```

## Key Patterns

1. **Menu Component**: PrimeVue Menu with custom item template
2. **Router Integration**: Using `router-link` with custom rendering
3. **Conditional Rendering**: Filtering menu items based on state
4. **Computed Properties**: Dynamic menu items
5. **v-ripple Directive**: Material ripple effect on clickable items
6. **Store Methods**: Calling store actions directly
7. **Conditional Display**: Using `v-if` for session-based rendering
