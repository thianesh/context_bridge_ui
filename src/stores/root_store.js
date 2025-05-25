import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://localhost:8000'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzQ4MTExNDAwLCJleHAiOjE5MDU4Nzc4MDB9.bPYz0mOA0gSltQQK6V7PLeJuu81B-d7wb4wpgwDKt0E'
const supabase = createClient(supabaseUrl, supabaseKey)


export const root_store = defineStore('root', () => {
  const count = ref(0)
  const session_data = ref({})
  const members = ref([])
  const company_details = ref()
  
  supabase.auth.getSession()
  .then(data =>  session_data.value = data)
  .catch(e => console.log("Not signed in", e))
  
  const doubleCount = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  async function google_signin() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // redirectTo: window.location.origin + window.location.pathname,
        redirectTo: window.location.origin + window.location.pathname,
      },
    })

    if (error) {
      console.error("Sign-in error:", error.message)
    } else {
      console.log("Redirecting for Google sign-in")
    }
  }

  async function signout(){
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Sign-out error:', error.message)
    } else {
      location.reload()
    }
  }

  async function fetchSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error("Session fetch error", error)
    }
    session_data.value = data?.session ?? null
  }

  async function get_members(){
        const user = await supabase.auth.getUser();
        const userId = user.data.user?.id;
        console.log(userId)

        // Step 1: Get company_id of the current user
        // const { data: userCompany, error: companyErr } = await supabase
        //   .from('company_members')
        //   .select('company_id')
        //   .eq('user_id', userId)
        //   .single();

        // if (companyErr || !userCompany) {
        //   console.error('User is not part of any company');
        //   return;
        // }

        const companyId = "73056d03-3ed0-4d14-a024-575a966b67b6";

        const { data: members_, error: membersErr } = await supabase
          .from('company_members')
          // .select('user_id,role')
          .select('user_id,role, users(email, full_name)')
          .eq('company_id', companyId);

        if (membersErr) {
          console.error('Error fetching company members:', membersErr.message);
        } else {
          console.log('Company Members:', members_);
          members.value = members_
          return members_
        }
  }

  async function get_company() {
    
    if(company_details.value) return company_details.value

      const { data: userCompany, error: companyErr } = await supabase
          .from('companies')
          .select('*')
          .single();

      if(companyErr)  {
        alert("Unable to get the user|company details.")
      }
      if(userCompany){
        company_details.value = userCompany
      }
      return userCompany
  }

  async function add_member(user_email, user_role) {
    let company = await get_company()

    async function addCompanyMember(email, role, companyId) {
      // Step 1: Lookup user_id from email
      const { data: userLookup, error: lookupError } = await supabase
        .from('users') // This is your view over `auth.users`
        .select('id')
        .eq('email', email)
        .single();
    
      if (lookupError) {
        console.error('User lookup failed:', lookupError.message);
        return { error: 'User not found or lookup failed.' };
      }
    
      const userId = userLookup.id;
    
      // Step 2: Insert into company_members
      const { error: insertError } = await supabase
        .from('company_members')
        .insert({
          company_id: companyId,
          user_id: userId,
          role: role
        });
    
      if (insertError) {
        console.error('Insert failed:', insertError.message);
        return { error: insertError.message };
      }
    
      return { success: true };
    }

    await addCompanyMember(user_email, user_role, company.id)
  }
  return {
    count,
    doubleCount,
    increment,
    session_data,
    google_signin,
    fetchSession,
    signout,
    get_members,
    members,
    add_member
  }
})