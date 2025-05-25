<template>
    <div style="max-width: 100%;text-wrap: pretty;">
        <h4>Add Members</h4>
        
        <div style="display: flex;gap: 1rem;">
            <FloatLabel variant="on">
                <InputText id="on_label" v-model="user_email" />
                <label for="on_label">Member email</label>
            </FloatLabel>
            <Select v-model="user_email_role" :options="['member','admin']" placeholder="Select role" class="w-full md:w-56" />
        </div>

        <div v-if="user_email_role == 'admin'">
            <br>
            <Message severity="warn">Note: You are adding the member as admin</Message>
        </div>
        <br>
        <Button label="Check availablility and add" severity="secondary" @click="add_members"></Button>
        <Divider></Divider>
    The users you want to add should have signed up in the platform. Only then you can add that user as member.
    </div>
    <!-- {{ members }} -->
    <br><br>
    <Button @click="get_members" label="Refresh members" icon="pi pi-refresh" severity="secondary"></Button>
    <br><br>
    <div class="card flex flex-center">
        <DataTable :value="members" tableStyle="min-width: 50rem">
            <Column field="user_id" header="User Id"></Column>
            <Column header="Email">
                <template #body="slotProps">
                    {{ slotProps.data.users.email }}
                </template>
            </Column>
            <Column header="Name">
                <template #body="slotProps">
                    {{ slotProps.data.users.full_name }}
                </template>
            </Column>
            <Column header="Role">
                <template #body="slotProps">
                    {{ slotProps.data.role }}
                </template>
            </Column>
            <Column header="Edit">
                <template #body="slotProps">
                    <Button size="small" severity="secondary">Edit</Button>
                </template>
            </Column>
        </DataTable>
    </div>
   
</template>

<script setup>
import { ref, onMounted } from 'vue';
const user_email = ref()
const user_email_role = ref('member')

import { root_store } from '@/stores/root_store'
import { storeToRefs } from 'pinia'
const store = root_store()
const {session_data, members} = storeToRefs(store)

async function get_members(){
    members.value = await store.get_members()
}

async function add_members(){
    await store.add_member(user_email.value, user_email_role.value)
}
import { FilterMatchMode } from '@primevue/core/api';

</script>