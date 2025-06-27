<template>
    <div style="max-width: 100%;text-wrap: pretty;">
        <h4>Add Members</h4>
        <br>
        
        <div style="display: flex;gap: 1rem;" class="card">
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
    <!-- <Button @click="get_members" label="Refresh members" icon="pi pi-refresh" severity="secondary"></Button> -->
    <br><br>
    <div class="card">
        <DataTable :value="members" tableStyle="min-width: 50rem"
        v-model:filters="filters"
        sortMode="multiple" paginator :rows="10"
        :globalFilterFields="['user_id', 'role', 'users.email', 'users.full_name']"
        showGridlines >
            <!-- <Column field="user_id" header="User Id" sortable></Column> -->
             <template #header>
                <div class="flex justify-end" style="position: relative;">
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                    </IconField>
                     <MultiSelect :modelValue="members_columns" :options="columns" @update:modelValue="on_column_select"
                            display="chip" placeholder="Select Columns to display" />
                    <!-- <Button style="width: max-content;position: absolute;left: 1rem;top: 0px;" icon="pi pi-refresh" @click="get_members" label="Refresh Members" /> -->
                    <span class="tab"></span>
                    <Button icon="pi pi-refresh" @click="get_members" rounded/>
                </div>
            </template>

            <template #empty> No customers found. </template>
            <template #loading> Loading customers data. Please wait. </template>
            <Column header="Email" sortable field="users.email" v-if="members_columns.includes('email')">
                <template #body="slotProps" sortable >
                    {{ slotProps.data.users.email }}
                </template>
            </Column>
            <Column header="Name" sortable field="users.full_name" v-if="members_columns.includes('name')">
                <template #body="slotProps">
                    {{ slotProps.data.users.full_name }}
                </template>
            </Column>
            <Column header="Role" sortable field="role" v-if="members_columns.includes('role')">
                <template #body="slotProps">
                    <Message :severity="slotProps.data.role == 'admin' ? 'success' : 'secondary'">{{ slotProps.data.role }}</Message>
                </template>
            </Column>
            <Column header="Delete" v-if="members_columns.includes('delete')">
                <template #body="slotProps">
                    <Button size="small" severity="danger" @click="remove_member(slotProps.data.user_id, slotProps.data.users.email)" icon="pi pi-trash"></Button>
                </template>
            </Column>
            <Column header="Change Role" v-if="members_columns.includes('change_role')">
                <template #body="slotProps">
                    <Select :options="['member','admin']" v-model="member_update[slotProps.data.user_id]" placeholder="Select role" class="w-full md:w-56" />
                    <Button size="small" severity="secondary" @click="update_member(slotProps.data.user_id, slotProps.data.users.email)">Save</Button>
                </template>
            </Column>
        </DataTable>
    </div>
    <Toast />
   
</template>

<script setup>
import { useToast } from "primevue/usetoast";
const toast = useToast();
import { ref, onMounted } from 'vue';
const user_email = ref()
const user_email_role = ref('member')

import { root_store } from '@/stores/root_store'
import { storeToRefs } from 'pinia'
const store = root_store()
const {session_data, members, members_updated, } = storeToRefs(store)

const member_update = ref({})

import { useStorage } from '@vueuse/core'

const columns = ['change_role','delete','name', 'role', 'email']
const members_columns = useStorage("members_columns", columns)

function on_column_select(val){
    members_columns.value = val
}

async function update_member(member_id, email) {
    // console.log(member_id, member_update.value[member_id])
    store.add_loader_message("Updating member with email: " + email)
    let result = await store.update_member(member_id, member_update.value[member_id])
    toast.add({ 
        severity: result.status ? 'success' : 'error', 
        summary: 'Info', 
        detail: email + " | " +result.message, 
        life: 3000 })
    store.remove_loader_message("Updating member with email: " + email)
    await get_members()
}

async function get_members(){
    store.add_loader_message("Refreshing Members...")
    members.value = await store.get_members()
    store.remove_loader_message("Refreshing Members...")
}

async function add_members(){
    store.add_loader_message("Adding user with email: " + user_email.value)
    let result = await store.add_member(user_email.value, user_email_role.value)
    toast.add({ 
        severity: result.status ? 'success' : 'error', 
        summary: 'Info', 
        detail: user_email.value + " | " +result.message, 
        life: 3000 })
    store.remove_loader_message("Adding user with email: " + user_email.value)
    await get_members()
}

async function remove_member(user_id, email){
    store.add_loader_message("Adding user with email: " + email)
    let result = await store.remove_member(user_id)
    toast.add({ 
        severity: result ? 'success' : 'error', 
        summary: 'Info', 
        detail: result ? `${email} | Successfully removed user.` : `${email} | Please ensure you have proper access.`, 
        life: 3000 })
    store.remove_loader_message("Adding user with email: " + email)
    await get_members()
}


// Table setup
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    id: { value: null, matchMode: FilterMatchMode.CONTAINS },
    created_at: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
    representative: { value: null, matchMode: FilterMatchMode.IN },
    status: { value: null, matchMode: FilterMatchMode.EQUALS },
    verified: { value: null, matchMode: FilterMatchMode.EQUALS }
});

</script>