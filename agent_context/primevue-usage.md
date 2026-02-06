# PrimeVue Usage Guide

## Component Auto-Import

PrimeVue components are auto-imported via `unplugin-vue-components`. No need to manually import in most cases.

```javascript
// ❌ Not needed (auto-imported)
// import Button from 'primevue/button'
// import Dialog from 'primevue/dialog'

// ✅ Just use directly in template
<template>
  <Button label="Click me" />
  <Dialog v-model:visible="isVisible">
    <p>Dialog content</p>
  </Dialog>
</template>
```

## Theme Configuration

The project uses a custom "Noir" preset based on PrimeVue Aura theme with Zinc color palette.

```javascript
// From main.js
import PrimeVue from 'primevue/config'
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

const Noir = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{zinc.50}',
      // ... zinc palette
      950: '{zinc.950}'
    }
  }
})

app.use(PrimeVue, {
  theme: {
    preset: Noir,
    options: {
      prefix: 'p',
      darkModeSelector: '.my-app-dark'
    }
  }
})
```

## Common Components

### Button

```vue
<template>
  <!-- Basic button -->
  <Button label="Click me" @click="handleClick" />
  
  <!-- With icon -->
  <Button icon="pi pi-check" label="Save" @click="save" />
  
  <!-- Icon only -->
  <Button icon="pi pi-trash" @click="deleteItem" />
  
  <!-- Severity variants -->
  <Button label="Primary" severity="primary" />
  <Button label="Secondary" severity="secondary" />
  <Button label="Success" severity="success" />
  <Button label="Danger" severity="danger" />
  <Button label="Warning" severity="warning" />
  <Button label="Contrast" severity="contrast" />
  
  <!-- Outlined variant -->
  <Button label="Outlined" variant="outlined" />
  
  <!-- With styling -->
  <Button 
    style="width: 100%;" 
    severity="contrast" 
    variant="outlined" 
    icon="pi pi-sign-out" 
    label="Sign out"
    @click="store.signout"
  />
</template>
```

### Dialog

```vue
<script setup>
import { ref } from 'vue'

const visible = ref(false)

function openDialog() {
  visible.value = true
}

function closeDialog() {
  visible.value = false
}
</script>

<template>
  <Button label="Open Dialog" @click="openDialog" />
  
  <Dialog 
    v-model:visible="visible" 
    header="Dialog Title"
    :style="{ width: '50vw' }"
    :modal="true"
  >
    <p>Dialog content goes here</p>
    
    <template #footer>
      <Button label="Cancel" @click="closeDialog" severity="secondary" />
      <Button label="Save" @click="handleSave" />
    </template>
  </Dialog>
</template>
```

### DataTable

```vue
<script setup>
import { ref } from 'vue'

const members = ref([
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'member' }
])

const selectedMembers = ref([])
</script>

<template>
  <DataTable 
    :value="members" 
    v-model:selection="selectedMembers"
    dataKey="id"
    :paginator="true"
    :rows="10"
    stripedRows
  >
    <Column selectionMode="multiple" headerStyle="width: 3rem" />
    <Column field="name" header="Name" sortable />
    <Column field="email" header="Email" sortable />
    <Column field="role" header="Role" sortable />
    <Column header="Actions">
      <template #body="slotProps">
        <Button 
          icon="pi pi-pencil" 
          @click="editMember(slotProps.data)" 
          severity="secondary"
          text
        />
        <Button 
          icon="pi pi-trash" 
          @click="deleteMember(slotProps.data)" 
          severity="danger"
          text
        />
      </template>
    </Column>
  </DataTable>
</template>
```

### Menu

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
  },
  {
    label: 'Rooms',
    icon: 'pi pi-box',
    command: () => router.push('/rooms')
  }
])
</script>

<template>
  <Menu :model="items">
    <template #item="{ item, props }">
      <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
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

### Toast

```vue
<script setup>
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

function showError() {
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: 'Something went wrong',
    life: 5000
  })
}

function showInfo() {
  toast.add({
    severity: 'info',
    summary: 'Info',
    detail: 'Here is some information',
    life: 3000
  })
}

function showWarn() {
  toast.add({
    severity: 'warn',
    summary: 'Warning',
    detail: 'Please be careful',
    life: 4000
  })
}
</script>

<template>
  <Toast />
  <Button label="Success" @click="showSuccess" />
  <Button label="Error" @click="showError" severity="danger" />
</template>
```

### Message

```vue
<template>
  <!-- Static messages -->
  <Message severity="success">Success message</Message>
  <Message severity="info">Info message</Message>
  <Message severity="warn">Warning message</Message>
  <Message severity="error">Error message</Message>
  <Message severity="secondary">Secondary message</Message>
  
  <!-- With dynamic content -->
  <Message 
    :severity="is_admin ? 'success' : 'secondary'"
    class="text-center"
  >
    Role: {{ is_admin ? "Admin" : "Member" }}
  </Message>
</template>
```

### InputText & Form Components

```vue
<script setup>
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const description = ref('')
const selectedOption = ref(null)

const options = ref([
  { label: 'Option 1', value: 1 },
  { label: 'Option 2', value: 2 }
])
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Input Text -->
    <div>
      <label for="email">Email</label>
      <InputText 
        id="email" 
        v-model="email" 
        type="email" 
        placeholder="Enter email"
      />
    </div>
    
    <!-- Password -->
    <div>
      <label for="password">Password</label>
      <Password 
        id="password" 
        v-model="password" 
        toggleMask 
        :feedback="false"
      />
    </div>
    
    <!-- Textarea -->
    <div>
      <label for="description">Description</label>
      <Textarea 
        id="description" 
        v-model="description" 
        rows="5" 
        cols="30"
      />
    </div>
    
    <!-- Select/Dropdown -->
    <div>
      <label for="option">Select Option</label>
      <Select 
        id="option" 
        v-model="selectedOption" 
        :options="options" 
        optionLabel="label"
        placeholder="Choose an option"
      />
    </div>
  </div>
</template>
```

### DatePicker

```vue
<script setup>
import { ref } from 'vue'
import DatePicker from 'primevue/datepicker'

const selectedDate = ref(null)
const dateRange = ref(null)
</script>

<template>
  <!-- Single date -->
  <DatePicker v-model="selectedDate" placeholder="Select a date" />
  
  <!-- Date range -->
  <DatePicker 
    v-model="dateRange" 
    selectionMode="range" 
    placeholder="Select date range"
  />
</template>
```

### MultiSelect

```vue
<script setup>
import { ref } from 'vue'

const selectedMembers = ref([])
const members = ref([
  { user_id: '1', email_name: 'John Doe (john@example.com)' },
  { user_id: '2', email_name: 'Jane Smith (jane@example.com)' }
])
</script>

<template>
  <MultiSelect 
    v-model="selectedMembers" 
    :options="members" 
    optionLabel="email_name"
    placeholder="Select members"
    :maxSelectedLabels="3"
    class="w-full"
  />
</template>
```

### ProgressSpinner

```vue
<template>
  <div v-if="isLoading" class="flex justify-center items-center">
    <ProgressSpinner />
  </div>
</template>
```

### Skeleton

```vue
<template>
  <div v-if="isLoading">
    <Skeleton width="100%" height="2rem" class="mb-2" />
    <Skeleton width="80%" height="2rem" class="mb-2" />
    <Skeleton width="60%" height="2rem" />
  </div>
</template>
```

## CSS Variables for Theming

Access PrimeVue theme colors via CSS variables:

```vue
<template>
  <div :style="{
    background: 'var(--p-button-primary-background)',
    color: 'var(--p-button-primary-color)',
    borderColor: 'var(--p-button-primary-border-color)'
  }">
    Themed content
  </div>
</template>
```

Common CSS variables:
- `--p-button-primary-background`
- `--p-button-primary-color`
- `--p-button-secondary-background`
- `--p-button-secondary-color`
- `--p-surface-0` to `--p-surface-950`
- `--p-primary-color`
- `--p-text-color`

## Icons

### PrimeIcons

```vue
<template>
  <i class="pi pi-check"></i>
  <i class="pi pi-times"></i>
  <i class="pi pi-user"></i>
  <i class="pi pi-users"></i>
  <i class="pi pi-home"></i>
  <i class="pi pi-cog"></i>
  <i class="pi pi-trash"></i>
  <i class="pi pi-pencil"></i>
</template>
```

### Material Symbols

```vue
<template>
  <span class="material-symbols-outlined">home</span>
  <span class="material-symbols-outlined">settings</span>
  <span class="material-symbols-outlined">person</span>
</template>
```

## Directives

### v-ripple

Add ripple effect to clickable elements:

```vue
<template>
  <a v-ripple @click="handleClick">
    Click me
  </a>
</template>
```

### v-tooltip

```vue
<template>
  <Button 
    v-tooltip="'This is a tooltip'" 
    label="Hover me" 
  />
  
  <Button 
    v-tooltip.top="'Top tooltip'" 
    label="Top" 
  />
  
  <Button 
    v-tooltip.bottom="'Bottom tooltip'" 
    label="Bottom" 
  />
</template>
```

## Responsive Design with PrimeVue

Use PrimeFlex utilities or Tailwind CSS classes:

```vue
<template>
  <div class="grid">
    <div class="col-12 md:col-6 lg:col-4">
      Column 1
    </div>
    <div class="col-12 md:col-6 lg:col-4">
      Column 2
    </div>
    <div class="col-12 md:col-6 lg:col-4">
      Column 3
    </div>
  </div>
  
  <!-- Or with Tailwind -->
  <div class="flex flex-col md:flex-row gap-4">
    <div class="flex-1">Column 1</div>
    <div class="flex-1">Column 2</div>
  </div>
</template>
```
