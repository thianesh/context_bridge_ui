# Pinia Store Example - Complete Store Pattern

This example demonstrates a complete Pinia store with state, getters, and actions following the project's patterns.

```javascript
import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { createClient } from '@supabase/supabase-js'
import { useStorage } from '@vueuse/core'

const supabaseUrl = 'https://db.vldo.in'
const supabaseKey = 'your-anon-key'
const supabase = createClient(supabaseUrl, supabaseKey)

export const root_store = defineStore('root', () => {
  // ========== STATE ==========
  
  // Regular refs
  const count = ref(0)
  const session_data = ref({})
  const members = ref([])
  const rooms = ref([])
  const loading = ref(false)
  
  // Persistent state with localStorage (using VueUse)
  const companyId = useStorage('company_id', '')
  const display_preference = useStorage('display_preference', {
    minimal: false
  })
  const isDark = useStorage('theme', false)
  
  // ========== GETTERS (Computed) ==========
  
  const doubleCount = computed(() => count.value * 2)
  
  const members_updated = computed(() => {
    return members.value.map(member => ({
      ...member,
      email_name: `${member?.users?.full_name} ( ${member?.users?.email} )`
    }))
  })
  
  const isAuthenticated = computed(() => 
    !!session_data.value?.data?.session
  )
  
  const currentUser = computed(() => 
    session_data.value?.data?.session?.user
  )
  
  // ========== ACTIONS ==========
  
  // Simple action
  function increment() {
    count.value++
  }
  
  // Async action with Supabase
  async function get_members() {
    if (!companyId.value) return []
    
    loading.value = true
    try {
      const { data: members_, error } = await supabase
        .from('company_members')
        .select('user_id, role, users(email, full_name)')
        .eq('company_id', companyId.value)

      if (error) {
        console.error('Error fetching members:', error.message)
        return []
      }
      
      members.value = members_
      return members_
    } catch (error) {
      console.error('Unexpected error:', error)
      return []
    } finally {
      loading.value = false
    }
  }
  
  // Async action with error handling
  async function add_member(user_email, user_role) {
    const { data: userLookup, error: lookupError } = await supabase
      .from('users')
      .select('id')
      .eq('email', user_email)
      .maybeSingle()

    if (lookupError || !userLookup) {
      console.error('User lookup failed:', lookupError?.message ?? 'no match')
      return {
        status: false,
        message: 'User not found. Please ensure user signed up in our platform.'
      }
    }

    const { error: insertError } = await supabase
      .from('company_members')
      .insert({
        company_id: companyId.value,
        user_id: userLookup.id,
        role: user_role
      })

    if (insertError) {
      console.error('Insert failed:', insertError.message)
      return {
        status: false,
        message: 'Please make sure you have proper access.'
      }
    }

    return { status: true, message: 'Successfully added the user.' }
  }
  
  // Action with validation
  async function update_member(member_id, new_role) {
    // Validate role
    if (new_role !== 'admin' && new_role !== 'member') {
      return {
        status: false,
        message: "The role can only be 'admin' or 'member'"
      }
    }

    // Perform update
    const { data, error } = await supabase
      .from('company_members')
      .update({ role: new_role })
      .match({ user_id: member_id, company_id: companyId.value })
      .select('user_id')

    if (error) {
      console.error('Update failed:', error.message)
      return {
        status: false,
        message: 'Please ensure you have required access'
      }
    }

    if ((data?.length ?? 0) > 0) {
      return {
        status: true,
        message: 'Successfully updated the user details.'
      }
    }
    
    return { 
      status: false, 
      message: 'Please ensure you have required access' 
    }
  }
  
  // Authentication actions
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

  async function signout() {
    companyId.value = ''
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Sign-out error:', error.message)
    } else {
      location.reload()
    }
  }
  
  // ========== INITIALIZATION ==========
  
  // Get session on store creation
  supabase.auth.getSession()
    .then(data => session_data.value = data)
    .catch(e => console.log('Not signed in', e))
  
  // ========== RETURN (Expose) ==========
  
  return {
    // State
    count,
    session_data,
    members,
    rooms,
    loading,
    companyId,
    display_preference,
    isDark,
    
    // Getters
    doubleCount,
    members_updated,
    isAuthenticated,
    currentUser,
    
    // Actions
    increment,
    get_members,
    add_member,
    update_member,
    google_signin,
    signout
  }
})
```

## Usage in Components

```vue
<script setup>
import { root_store } from '@/stores/root_store'
import { storeToRefs } from 'pinia'

const store = root_store()

// ✅ Use storeToRefs for reactive state and getters
const { 
  session_data, 
  members, 
  companyId, 
  members_updated,
  isAuthenticated 
} = storeToRefs(store)

// ✅ Call actions directly on store
async function loadMembers() {
  await store.get_members()
}

function handleSignout() {
  store.signout()
}
</script>

<template>
  <div>
    <p v-if="isAuthenticated">Welcome, {{ session_data.data.session.user.email }}</p>
    <Button @click="loadMembers" label="Load Members" />
    <Button @click="handleSignout" label="Sign Out" />
  </div>
</template>
```

## Key Patterns

1. **Setup Syntax**: Using arrow function with `defineStore`
2. **State with ref()**: All reactive state uses `ref()`
3. **Persistent State**: Using `useStorage` from VueUse
4. **Getters with computed()**: Derived state
5. **Async Actions**: Proper error handling with try-catch
6. **Return Object**: Exposing state, getters, and actions
7. **Initialization**: Running code on store creation
8. **Validation**: Input validation in actions
9. **Error Responses**: Consistent error response format
