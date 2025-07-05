<script setup>
import { root_store } from '@/stores/root_store'
import { storeToRefs } from 'pinia'
import TimedMessage from "../components/Timedmessages.vue"
import { onMounted, watch } from 'vue'
import router from '@/router'
const store = root_store()
const { session_data, members, 
  display_preference, rooms, members_updated, my_company, companies_im_partof, companyId } = storeToRefs(store)

  function set_company_and_refresh(company_id){
    if(companyId.value == company_id) {
        router.push("home")
    }
    companyId.value = company_id
  }

onMounted(()=> {
    if(session_data.value?.data?.session?.user?.id) store.get_companies()
    else setTimeout(()=> { store.get_companies() }, 1000)

    watch(companyId, (old_val, new_val) => {
        if(old_val != new_val) {
            window.location.href = "/"
        }
    })
})
</script>

<template>

 <div class="flex flex-col items-center gap-10 p-6">
<h1 class="text-3xl font-semibold">Choose which space</h1>

<!-- {{ my_company }} -->

<!-- {{ companies_im_partof }} -->

    <div class="p-card" style="padding: 1rem;" v-if="!my_company?.id">
        Hi {{ session_data?.data?.session?.user.user_metadata.full_name }}
      <!-- <Message severity="secondary">Connecting to Server... </Message> -->
       <TimedMessage :messages="[
  { message: 'loading companies...', timeout: 0, severity: 'secondary' },
  { message: 'Please hold on', timeout: 5, severity: 'secondary' },
  { message: 'Something is wrong. Please try again after somtime.', timeout: 40, severity: 'error' },
]" v-if="session_data?.data?.session" ></TimedMessage>
        <ProgressBar mode="indeterminate" style="height: 6px"></ProgressBar>
    </div>

    <!-- <Button @click="store.get_companies" label="load comapanies"></Button> -->

   <div class="flex flex-col border border-surface shadow-lg justify-center items-center max-w-80 rounded-2xl p-8 gap-4" 
   v-if="my_company?.id"
   @click="set_company_and_refresh(my_company.id)">
        <div class="rounded-full bg-primary text-primary-contrast w-12 h-12 flex items-center justify-center">
            <i class="pi pi-building !text-2xl"></i>
        </div>
        <span class="text-2xl font-bold">Personal</span>
        <span class="text-muted-color text-center">Owned by you: {{ session_data?.data?.session?.user.user_metadata.email }}</span>
    </div>

    <Divider></Divider>

 <h3 class="text-xl font-medium">Other spaces you are member of</h3>

 <div v-for="company in companies_im_partof">
     <div class="flex flex-col border border-surface shadow-lg justify-center items-center max-w-80 rounded-2xl p-8 gap-4" @click="set_company_and_refresh(company.company_id)">
      <div class="rounded-full bg-primary text-primary-contrast w-12 h-12 flex items-center justify-center">
          <i class="pi pi-users !text-2xl"></i>
      </div>
      <span class="text-2xl font-bold">{{company.company_name}}</span>
      <span class="text-muted-color text-center">{{ company.companyData.total_members }} members | owned by {{ company.companyData.owner_email }}</span>
  </div>
 </div>
    
</div>
</template>