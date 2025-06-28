import { ref, computed, watch } from "vue";
import { defineStore } from "pinia";
import { createClient } from "@supabase/supabase-js";
import { useStorage, watchWithFilter } from '@vueuse/core'

const supabaseUrl = `http://${window.location.hostname}:8000`;
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzQ4MTExNDAwLCJleHAiOjE5MDU4Nzc4MDB9.bPYz0mOA0gSltQQK6V7PLeJuu81B-d7wb4wpgwDKt0E";
const supabase = createClient(supabaseUrl, supabaseKey);

export const root_store = defineStore("root", () => {

  const display_preference = useStorage('display_preference', {"minimal": false}) 

  const count = ref(0);
  const session_data = ref({});
  const members = ref([]);
  const company_details = ref();
  const rooms = ref([]);
  const system_input_member_id = ref("")

  const companyId = useStorage('company_id')
  
  supabase.auth
    .getSession()
    .then((data) => (session_data.value = data))
    .catch((e) => console.log("Not signed in", e));

  const doubleCount = computed(() => count.value * 2);

  function increment() {
    count.value++;
  }

  async function google_signin() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // redirectTo: window.location.origin + window.location.pathname,
        redirectTo: window.location.origin + window.location.pathname,
      },
    });

    if (error) {
      console.error("Sign-in error:", error.message);
    } else {
      console.log("Redirecting for Google sign-in");
    }
  }

    async function signInWithEmail(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      console.error("Sign in error:", error)
      return { success: false, error: error.message }
    } else {
      console.log("Sign in successful:", data)
      return { success: true, data: data }
    }
  }

  async function signout() {
    companyId.value = ""
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign-out error:", error.message);
    } else {
      location.reload();
    }
  }

  async function fetchSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Session fetch error", error);
    }
    session_data.value = data?.session ?? null;
  }

  async function get_members() {
    if(!companyId.value) return
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;
    console.log(userId);

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

    const { data: members_, error: membersErr } = await supabase
      .from("company_members")
      // .select('user_id,role')
      .select("user_id,role, users(email, full_name)")
      .eq("company_id", companyId.value);

    if (membersErr) {
      console.error("Error fetching company members:", membersErr.message);
    } else {
      console.log("Company Members:", members_);
      members.value = members_;
      return members_;
    }
  }

  async function get_company() {
    if (company_details.value) return company_details.value;

    const { data: userCompany, error: companyErr } = await supabase
      .from("companies")
      .select("*")
      .single();

    if (companyErr) {
      alert("Unable to get the user|company details.");
    }
    if (userCompany) {
      company_details.value = userCompany;
    }
    return userCompany;
  }

// supabase-js ≥ 2.50.x
async function add_member(user_email, user_role) {
  const { data: userLookup, error: lookupError } = await supabase
    .from('users')            // view over auth.users
    .select('id')
    .eq('email', user_email)
    .maybeSingle();          // returns null instead of throwing if not found

  if (lookupError || !userLookup) {
    console.error('User lookup failed:', lookupError?.message ?? 'no match');
    return { status: false, message: "User not found. Please ensure user signed up in our platform."}            
  }

  const { error: insertError } = await supabase
    .from('company_members')
    .insert({
      company_id: companyId.value,
      user_id:     userLookup.id,
      role:        user_role,
    })

  if (insertError) {
    console.error('Insert failed:', insertError.message);
    return { status: false, message: "Please make sure you have proper access."} 
  }

  return { status: true, message: "Successfully added the user."}
}

  async function get_rooms() {
    if(!companyId.value) return
    const { data: rooms_, error: roomsErr } = await supabase
      .from("rooms")
      .select("*")
      .eq("company_id", companyId.value);

    if (roomsErr) {
      alert("Unable to get the user|company details.");
    }
    if (rooms_) {
      rooms.value = rooms_;
    }
    return rooms_;
  }

  const members_updated = computed(() => {
    return members.value.map((member) => {
      return {
        ...member,
        email_name: `${member?.users?.full_name} ( ${member?.users?.email} )`,
      };
    });
  });

  async function create_room(room_name, room_members) {
    const { error: insertError } = await supabase.from("rooms").insert({
      name: room_name,
      company_id: companyId.value,
      created_by: session_data.value.data.session.user.id,
      access_list: room_members.map((member) => member.user_id),
    });

    if (insertError) {
      console.error("Insert failed:", insertError.message);
      return { error: insertError.message, success: false };
    }

    return { success: true };
  }

  async function update_room(room_id, room_name, room_members) {
    if (!room_name?.trim()) {
      return { success: false, message: 'update_room: empty room name' }
    }

    const userIds = room_members
      .map(m => m.user_id)
      .filter(Boolean);            // remove null/undefined

    const { data, error } = await supabase
      .from('rooms')
      .update({
        name: room_name,
        access_list: userIds,      // column type must be uuid[] or text[]
      })
      .match({ company_id: companyId.value, id: room_id })
      .select('id');               // ask PostgREST to return the IDs it touched

    if (error) {
      console.error('Room update failed:', error.message);
      return { success: false, message: 'Please ensure you have proper access' }
    }

    if((data?.length ?? 0) > 0 ) {
      return { success: true, message: 'Successfully Updated room | ' + room_name }
    }
  }

  const loader_object = ref([]);

  function add_loader_message(message) {
    loader_object.value.push({
      message,
    });
  }

  function remove_loader_message(message) {
    const index = loader_object.value.findIndex(
      (item) => item.message === message
    );
    if (index !== -1) {
      loader_object.value.splice(index, 1);
    }
  }

  const my_company = ref({})
  const companies_im_partof = ref([])

  async function get_companies(){
    if (!session_data.value?.data?.session?.user?.id) return
    
    const { data: company, error: errorCompany } = await supabase.from("companies").select("*").eq("owner_id", session_data.value.data.session.user.id)
    .limit(1)
    .maybeSingle();

    my_company.value = company;

    const {data: companies, error: errorCompanies} = await supabase.from("company_members").select("*")
    .eq("user_id", session_data.value.data.session.user.id)
    
    companies_im_partof.value = companies
    .filter(company => company.company_id != my_company.value?.id)

    companies_im_partof.value.forEach(async (item) => {
      const { data: companyData } = await supabase.from("company_summary_view").select("*").eq("company_id", item.company_id).limit(1).maybeSingle();
      item.companyData = companyData;
      // console.log(item);
    })
  }

async function remove_member(userId) {
  console.log(userId)
  const { error, data } = await supabase          // <- destructure what you use
    .from('company_members')
    .delete()
    // .throwOnError()               // optional: bubble the error
    .match({ user_id: userId, company_id: companyId.value })  // more concise
    .select('*', { count: 'exact' });            // keep track of how many

  if (error) {
    console.error('Delete failed:', error);      // make debugging easier
    return false;
  }

  // If you care whether anything was *actually* removed:
  return (data?.length ?? 0) > 0;
}

async function remove_room(room_id) {
  const { error, data } = await supabase          // <- destructure what you use
    .from('rooms')
    .delete()
    .match({ id: room_id, company_id: companyId.value })  // more concise
    .select('*', { count: 'exact' });            // keep track of how many

  if (error) {
    console.error('Delete failed:', error);      // make debugging easier
    return false;
  }

  // If you care whether anything was *actually* removed:
  return (data?.length ?? 0) > 0;
}

// supabase-js ≥ 2.50.x
async function update_member(member_id, new_role){
  // ── 1. Validate role ───────────────────────────────────────────────
  if (new_role !== 'admin' && new_role !== 'member') {
    return { status: false, message: "The role can only be 'admin' or 'member'"};
  }

  // ── 2. Perform the update ──────────────────────────────────────────
  const { data, error } = await supabase
    .from('company_members')
    .update({ role: new_role })
    .match({ user_id: member_id, company_id: companyId.value })
    .select('user_id');        // fetch primary key(s) so we know if anything changed

  if (error) {
    console.error('Update failed:', error.message);
    return { status: false, message: "Please ensure you have required access"};
  }

  if( (data?.length ?? 0) > 0) {
    return { status: true, message: "Successfully updated the user details."};
  }
  return { status: false, message: "Please ensure you have required access"};
}

const is_admin = ref(false)

watch(members, ()=>{
  // console.log("session changed")
  if(session_data.value?.data?.session?.user) {
    members.value.forEach(member => {
      // console.log(member.user_id,session_data.value?.data?.session?.user.id)
      if(member.user_id == session_data.value?.data?.session?.user.id) {
        // console.log(member.role)  
        if(member.role == "admin"){
          is_admin.value = true
        }
      }
    })
  }
})

  return {
    is_admin,
    update_room,
    remove_room,
    update_member,
    remove_member,
    count,
    doubleCount,
    increment,
    session_data,
    google_signin,
    fetchSession,
    signout,
    get_members,
    members,
    add_member,
    get_rooms,
    rooms,
    members_updated,
    create_room,
    loader_object,
    add_loader_message,
    remove_loader_message,
    display_preference,
    my_company,
    companies_im_partof,
    get_companies,
    companyId,
    system_input_member_id,
    signInWithEmail
  };
});
