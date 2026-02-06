# API Patterns and Supabase Integration

## Supabase Client Setup

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://db.vldo.in'
const supabaseKey = 'your-anon-key'
const supabase = createClient(supabaseUrl, supabaseKey)
```

## Authentication Patterns

### Get Current Session

```javascript
import { ref } from 'vue'

const session_data = ref({})

// On app initialization
supabase.auth.getSession()
  .then((data) => session_data.value = data)
  .catch((e) => console.log('Not signed in', e))
```

### Google OAuth Sign In

```javascript
async function google_signin() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + window.location.pathname
    }
  })

  if (error) {
    console.error('Sign-in error:', error.message)
  } else {
    console.log('Redirecting for Google sign-in')
  }
}
```

### Email/Password Sign In

```javascript
async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  })

  if (error) {
    console.error('Sign in error:', error)
    return { success: false, error: error.message }
  } else {
    console.log('Sign in successful:', data)
    return { success: true, data: data }
  }
}
```

### Sign Out

```javascript
async function signout() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Sign-out error:', error.message)
  } else {
    location.reload()
  }
}
```

### Get Current User

```javascript
async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  
  return user
}
```

## Database Query Patterns

### Select with Filters

```javascript
// Get all members for a company
async function get_members() {
  const { data: members, error } = await supabase
    .from('company_members')
    .select('user_id, role, users(email, full_name)')
    .eq('company_id', companyId.value)

  if (error) {
    console.error('Error fetching members:', error.message)
    return []
  }
  
  return members
}

// Get single record
async function getCompany(companyId) {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single()

  if (error) {
    console.error('Error:', error.message)
    return null
  }
  
  return data
}

// Maybe single (returns null if not found, doesn't throw)
async function findUserByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (error || !data) {
    console.error('User lookup failed:', error?.message ?? 'no match')
    return null
  }
  
  return data
}
```

### Insert Records

```javascript
// Insert single record
async function createRoom(roomName, roomMembers) {
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      name: roomName,
      company_id: companyId.value,
      created_by: session_data.value.data.session.user.id,
      access_list: roomMembers.map(m => m.user_id)
    })
    .select()  // Return the inserted record

  if (error) {
    console.error('Insert failed:', error.message)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

// Insert multiple records
async function addMultipleMembers(members) {
  const { data, error } = await supabase
    .from('company_members')
    .insert(members)

  if (error) {
    console.error('Bulk insert failed:', error.message)
    return false
  }

  return true
}
```

### Update Records

```javascript
async function updateRoom(roomId, roomName, roomMembers) {
  if (!roomName?.trim()) {
    return { success: false, message: 'Empty room name' }
  }

  const userIds = roomMembers.map(m => m.user_id).filter(Boolean)

  const { data, error } = await supabase
    .from('rooms')
    .update({
      name: roomName,
      access_list: userIds
    })
    .match({ company_id: companyId.value, id: roomId })
    .select('id')

  if (error) {
    console.error('Update failed:', error.message)
    return { success: false, message: 'Update failed' }
  }

  if ((data?.length ?? 0) > 0) {
    return { success: true, message: 'Successfully updated' }
  }
  
  return { success: false, message: 'No records updated' }
}
```

### Delete Records

```javascript
async function removeMember(userId) {
  const { error, data } = await supabase
    .from('company_members')
    .delete()
    .match({ user_id: userId, company_id: companyId.value })
    .select('*', { count: 'exact' })

  if (error) {
    console.error('Delete failed:', error)
    return false
  }

  // Check if anything was actually deleted
  return (data?.length ?? 0) > 0
}
```

### Order and Limit

```javascript
async function getRecentFeedback() {
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error:', error.message)
    return []
  }

  return data
}
```

## Fetch API Patterns

### Basic Fetch with Authorization

```javascript
async function fetchData() {
  const myHeaders = new Headers()
  myHeaders.append('Authorization', `Bearer ${session_data.value.data.session.access_token}`)
  myHeaders.append('Content-Type', 'application/json')

  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  }

  try {
    const response = await fetch('https://api.example.com/data', requestOptions)
    const result = await response.json()
    return result
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
}
```

### POST Request

```javascript
async function submitData(payload) {
  const myHeaders = new Headers()
  myHeaders.append('Authorization', `Bearer ${session_data.value.data.session.access_token}`)
  myHeaders.append('Content-Type', 'application/json')

  const raw = JSON.stringify(payload)

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  }

  try {
    const response = await fetch('https://api.example.com/submit', requestOptions)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    return { success: true, data: result }
  } catch (error) {
    console.error('Error:', error)
    return { success: false, error: error.message }
  }
}
```

### Health Check Pattern

```javascript
async function checkSystemHealth() {
  const myHeaders = new Headers()
  myHeaders.append('Authorization', 'health-checkup')

  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  }

  try {
    const response = await fetch('https://jo.vldo.in/health-check', requestOptions)
    const usage = await response.json()
    
    if (usage.cpu > 90) {
      // Handle high load
      return { status: 'overloaded', usage }
    }
    
    return { status: 'ok', usage }
  } catch (error) {
    console.error('Health check failed:', error)
    return { status: 'error', error: error.message }
  }
}
```

## Error Handling Patterns

### Comprehensive Error Handling

```javascript
async function performOperation() {
  try {
    // Attempt operation
    const result = await apiCall()
    
    // Check for application-level errors
    if (result.error) {
      throw new Error(result.error)
    }
    
    return { success: true, data: result }
  } catch (error) {
    // Log for debugging
    console.error('Operation failed:', error)
    
    // User-friendly message
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Unable to complete operation. Please try again.',
      life: 5000
    })
    
    return { success: false, error: error.message }
  }
}
```

### Retry Logic

```javascript
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options)
      
      if (response.ok) {
        return await response.json()
      }
      
      // If not the last retry, wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error
      }
    }
  }
  
  throw new Error('Max retries exceeded')
}
```

## Loading States

### Managing Loading State

```javascript
const isLoading = ref(false)
const data = ref([])

async function loadData() {
  isLoading.value = true
  try {
    const result = await fetchData()
    data.value = result
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    isLoading.value = false
  }
}
```

## Store Integration Pattern

### Complete Store with API Calls

```javascript
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(supabaseUrl, supabaseKey)

export const useDataStore = defineStore('data', () => {
  // State
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const itemCount = computed(() => items.value.length)

  // Actions
  async function fetchItems() {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('items')
        .select('*')
      
      if (fetchError) throw fetchError
      
      items.value = data
      return data
    } catch (e) {
      error.value = e.message
      console.error('Error fetching items:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  async function addItem(item) {
    try {
      const { data, error: insertError } = await supabase
        .from('items')
        .insert(item)
        .select()
      
      if (insertError) throw insertError
      
      items.value.push(data[0])
      return { success: true, data: data[0] }
    } catch (e) {
      console.error('Error adding item:', e)
      return { success: false, error: e.message }
    }
  }

  return {
    items,
    loading,
    error,
    itemCount,
    fetchItems,
    addItem
  }
})
```
