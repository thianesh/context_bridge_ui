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
    <!-- <Button @click="get_members" label="Refresh members" icon="pi pi-refresh" severity="secondary"></Button> -->
    <br><br>
    <div class="card flex flex-center">
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
                    <Button style="width: max-content;position: absolute;right: 1rem;top: 0px;" icon="pi pi-refresh" @click="get_members" label="Refresh Members" />
                </div>
            </template>

            <template #empty> No customers found. </template>
            <template #loading> Loading customers data. Please wait. </template>
            <Column header="Email" sortable field="users.email" >
                <template #body="slotProps" sortable >
                    {{ slotProps.data.users.email }}
                </template>
            </Column>
            <Column header="Name" sortable field="users.full_name" >
                <template #body="slotProps">
                    {{ slotProps.data.users.full_name }}
                </template>
            </Column>
            <Column header="Role" sortable field="role">
                <template #body="slotProps">
                    <Message :severity="slotProps.data.role == 'admin' ? 'success' : 'secondary'">{{ slotProps.data.role }}</Message>
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
const {session_data, members, members_updated} = storeToRefs(store)

async function get_members(){
    members.value = await store.get_members()
}

async function add_members(){
    await store.add_member(user_email.value, user_email_role.value)
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