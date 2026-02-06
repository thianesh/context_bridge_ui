# Complete Component Example - List View with CRUD

This example demonstrates a complete component with data fetching, CRUD operations, and PrimeVue components.

```vue
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { root_store } from '@/stores/root_store'

// Initialize composables
const router = useRouter()
const toast = useToast()
const store = root_store()

// Destructure store state
const { session_data, companyId } = storeToRefs(store)

// Local state
const items = ref([])
const selectedItems = ref([])
const isLoading = ref(false)
const isDialogVisible = ref(false)
const isEditMode = ref(false)

// Form data
const formData = ref({
  id: null,
  name: '',
  description: '',
  status: 'active'
})

// Computed
const activeItems = computed(() => 
  items.value.filter(item => item.status === 'active')
)

// Functions
async function loadItems() {
  isLoading.value = true
  try {
    const data = await store.fetchItems()
    items.value = data
  } catch (error) {
    console.error('Error loading items:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load items',
      life: 3000
    })
  } finally {
    isLoading.value = false
  }
}

function openCreateDialog() {
  isEditMode.value = false
  formData.value = {
    id: null,
    name: '',
    description: '',
    status: 'active'
  }
  isDialogVisible.value = true
}

function openEditDialog(item) {
  isEditMode.value = true
  formData.value = { ...item }
  isDialogVisible.value = true
}

async function handleSubmit() {
  if (!formData.value.name.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Validation Error',
      detail: 'Name is required',
      life: 3000
    })
    return
  }

  try {
    if (isEditMode.value) {
      await updateItem()
    } else {
      await createItem()
    }
    
    isDialogVisible.value = false
    await loadItems()
  } catch (error) {
    console.error('Error submitting:', error)
  }
}

async function createItem() {
  const result = await store.createItem(formData.value)
  
  if (result.success) {
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Item created successfully',
      life: 3000
    })
  } else {
    throw new Error(result.error)
  }
}

async function updateItem() {
  const result = await store.updateItem(formData.value.id, formData.value)
  
  if (result.success) {
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Item updated successfully',
      life: 3000
    })
  } else {
    throw new Error(result.error)
  }
}

async function deleteItem(item) {
  if (!confirm(`Are you sure you want to delete "${item.name}"?`)) {
    return
  }

  try {
    const result = await store.deleteItem(item.id)
    
    if (result.success) {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Item deleted successfully',
        life: 3000
      })
      await loadItems()
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error('Error deleting item:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete item',
      life: 3000
    })
  }
}

// Lifecycle
onMounted(async () => {
  if (!session_data.value?.data?.session) {
    router.push('/auth')
    return
  }
  
  if (!companyId.value) {
    router.push('/company')
    return
  }
  
  await loadItems()
})

// Watchers
watch(session_data, (newVal) => {
  if (!newVal?.data?.session) {
    router.push('/auth')
  }
})
</script>

<template>
  <div class="p-4">
    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Items</h1>
      <Button 
        label="Create New" 
        icon="pi pi-plus" 
        @click="openCreateDialog"
      />
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center p-8">
      <ProgressSpinner />
    </div>

    <!-- Data Table -->
    <DataTable 
      v-else
      :value="items" 
      v-model:selection="selectedItems"
      dataKey="id"
      :paginator="true"
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      stripedRows
      class="p-datatable-sm"
    >
      <Column selectionMode="multiple" headerStyle="width: 3rem" />
      
      <Column field="name" header="Name" sortable>
        <template #body="slotProps">
          <span class="font-semibold">{{ slotProps.data.name }}</span>
        </template>
      </Column>
      
      <Column field="description" header="Description" />
      
      <Column field="status" header="Status" sortable>
        <template #body="slotProps">
          <Tag 
            :value="slotProps.data.status" 
            :severity="slotProps.data.status === 'active' ? 'success' : 'secondary'"
          />
        </template>
      </Column>
      
      <Column header="Actions" headerStyle="width: 10rem">
        <template #body="slotProps">
          <Button 
            icon="pi pi-pencil" 
            @click="openEditDialog(slotProps.data)" 
            severity="secondary"
            text
            rounded
          />
          <Button 
            icon="pi pi-trash" 
            @click="deleteItem(slotProps.data)" 
            severity="danger"
            text
            rounded
          />
        </template>
      </Column>
      
      <template #empty>
        <div class="text-center p-4">
          No items found. Create your first item!
        </div>
      </template>
    </DataTable>

    <!-- Create/Edit Dialog -->
    <Dialog 
      v-model:visible="isDialogVisible" 
      :header="isEditMode ? 'Edit Item' : 'Create Item'"
      :style="{ width: '450px' }"
      :modal="true"
    >
      <div class="flex flex-col gap-4">
        <div>
          <label for="name" class="block mb-2 font-semibold">Name *</label>
          <InputText 
            id="name" 
            v-model="formData.name" 
            class="w-full"
            placeholder="Enter item name"
          />
        </div>
        
        <div>
          <label for="description" class="block mb-2 font-semibold">Description</label>
          <Textarea 
            id="description" 
            v-model="formData.description" 
            rows="4"
            class="w-full"
            placeholder="Enter description"
          />
        </div>
        
        <div>
          <label for="status" class="block mb-2 font-semibold">Status</label>
          <Select 
            id="status" 
            v-model="formData.status" 
            :options="[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' }
            ]"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>
      </div>
      
      <template #footer>
        <Button 
          label="Cancel" 
          @click="isDialogVisible = false" 
          severity="secondary"
        />
        <Button 
          :label="isEditMode ? 'Update' : 'Create'" 
          @click="handleSubmit"
          icon="pi pi-check"
        />
      </template>
    </Dialog>

    <!-- Toast for notifications -->
    <Toast />
  </div>
</template>

<style scoped>
/* Add any component-specific styles here */
</style>
```

## Key Patterns Demonstrated

1. **Store Integration**: Using `storeToRefs` for reactive state
2. **CRUD Operations**: Create, Read, Update, Delete with proper error handling
3. **Loading States**: ProgressSpinner during data fetching
4. **Form Handling**: Dialog with form validation
5. **Toast Notifications**: User feedback for actions
6. **Computed Properties**: Filtering and derived state
7. **Lifecycle Hooks**: Data loading on mount
8. **Watchers**: Redirect on session changes
9. **PrimeVue Components**: DataTable, Dialog, Button, InputText, etc.
10. **Responsive Design**: Tailwind CSS classes for layout
