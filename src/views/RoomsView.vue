<template>
    <div style="width: 100%;margin: auto;overflow: auto;">

        <div class="card flex justify-center">
            <Toast />
            
            <Form v-slot="$form" :initialValues :resolver @submit="onFormSubmit" class="flex flex-col gap-4 w-full sm:w-56">
                <div class="flex flex-col gap-1">
                    <InputText name="room_name" v-model="room_name" type="text" placeholder="Room Name" fluid />
                    <Message v-if="$form.room_name?.invalid" severity="error" size="small" variant="simple">{{ $form.room_name.error?.message }}</Message>
                </div>
                <br>
                 <div class="card flex justify-center" style="width: 100%;overflow: auto;">
                    <MultiSelect v-model="selected_members" display="chip" :options="members_updated" optionLabel="email_name" filter placeholder="Select Members"
                        class="w-full md:w-80" style="min-width: 100%;" />
                </div>
                <br>
                <Button type="submit" severity="secondary" label="Create" style="width: 100%;" @click="add_room" />
            </Form>
        </div>
        <Divider></Divider>
        <!-- <p style="max-width: 500px;">{{ rooms }}</p> -->
        
        <div class="card">
            <DataTable stripedRows size="normal" v-model:filters="filters" :value="rooms_computed" sortMode="multiple" paginator :rows="10" 
            showGridlines
            dataKey="id" filterDisplay="row" :loading="loading"
            :globalFilterFields="['name', 'id', 'created_at', 'access_list_json']">
            <template #header>
                <div class="flex justify-end" style="position: relative;">
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                        <MultiSelect :modelValue="columns_to_show" :options="columns" @update:modelValue="on_column_select"
                            display="chip" placeholder="Select Columns to display" />
                    </IconField>
                    <Button style="width: max-content;position: absolute;right: 1rem;top: 0px;" icon="pi pi-refresh" @click="get_rooms" label="Refresh Rooms" />
                </div>
            </template>
            <template #empty> No customers found. </template>
            <template #loading> Loading customers data. Please wait. </template>
           
            <Column field="name" sortable header="Name" style="min-width: 12rem" 
            v-if="columns_to_show.includes('name')">
                <template #body="{ data }">
                    {{ data?.name }}
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="Search by name" />
                </template>
            </Column>

             <Column v-if="columns_to_show.includes('edit')"
            header="Edit" style="width: max-content;">
                <template #body="{ data }">
                    <div style="display: flex;">
                        <Button rounded icon="pi pi-pencil" label="Edit" severity="info"></Button> 
                        <span class="tab"></span>
                        <Button  icon="pi pi-trash" severity="danger"></Button>
                    </div>
                    </template>
            </Column>

            <Column header="ID" 
            v-if="columns_to_show.includes('id')"
            field="id" sortable filterField="id" style="min-width: 12rem">
                <template #body="{ data }">
                    <div class="flex items-center gap-2">
                        <span>{{ data?.id }}</span>
                    </div>
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="Search by id" />
                </template>
            </Column>

            
             <Column header="Created at" 
             v-if="columns_to_show.includes('created_at')"
             sortable field="created_at" filterField="created_at" dataType="date" style="min-width: 10rem">
                <template #body="{ data }">
                    {{ formatDate( new Date(data.created_at) ) }}
                </template>
                <!-- <template #filter="{ filterModel }">
                    <DatePicker v-model="filterModel.value" showTime hourFormat="12" fluid placeholder="mm/dd/yyyy" />
                </template> -->
            </Column>

              <Column header="Room Members" 
              v-if="columns_to_show.includes('room_members')"
              field="access_list_json" filterField="access_list" style="min-width: 12rem">
                <template #body="{ data }">
                    <div class="flex items-center gap-2">
                        <Message severity="success" style="margin: 0px;">{{ data?.name }}</Message>
                        <!-- <span>{{ data?.access_list }}</span> -->
                        <DataTable :value="data?.access_list" tableStyle="min-width: 50rem">
                            <Column field="users.full_name" header="Name"></Column>
                            <Column field="users.email" header="Email"></Column>
                            <Column field="user_id" header="user_id"></Column>
                        </DataTable>
                    </div>
                </template>
                <!-- <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="Search by id" />
                </template> -->
            </Column>
            <!-- <Column header="Agent" filterField="representative" :showFilterMenu="false" style="min-width: 14rem">
                <template #body="{ data }">
                    <div class="flex items-center gap-2">
                        <img :alt="data.representative.name" :src="`https://primefaces.org/cdn/primevue/images/avatar/${data.representative.image}`" style="width: 32px" />
                        <span>{{ data.representative.name }}</span>
                    </div>
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <MultiSelect v-model="filterModel.value" @change="filterCallback()" :options="representatives" optionLabel="name" placeholder="Any" style="min-width: 14rem" :maxSelectedLabels="1">
                        <template #option="slotProps">
                            <div class="flex items-center gap-2">
                                <img :alt="slotProps.option.name" :src="`https://primefaces.org/cdn/primevue/images/avatar/${slotProps.option.image}`" style="width: 32px" />
                                <span>{{ slotProps.option.name }}</span>
                            </div>
                        </template>
                    </MultiSelect>
                </template>
            </Column>
            <Column field="status" header="Status" :showFilterMenu="false" style="min-width: 12rem">
                <template #body="{ data }">
                    <Tag :value="data.status" :severity="getSeverity(data.status)" />
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <Select v-model="filterModel.value" @change="filterCallback()" :options="statuses" placeholder="Select One" style="min-width: 12rem" :showClear="true">
                        <template #option="slotProps">
                            <Tag :value="slotProps.option" :severity="getSeverity(slotProps.option)" />
                        </template>
                    </Select>
                </template>
            </Column>
            <Column field="verified" header="Verified" dataType="boolean" style="min-width: 6rem">
                <template #body="{ data }">
                    <i class="pi" :class="{ 'pi-check-circle text-green-500': data.verified, 'pi-times-circle text-red-400': !data.verified }"></i>
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <Checkbox v-model="filterModel.value" :indeterminate="filterModel.value === null" binary @change="filterCallback()" />
                </template>
            </Column> -->
        </DataTable>
    </div>
    </div>
</template>

<script setup>
import { reactive, toRaw, ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';

import { root_store } from '@/stores/root_store'
import { storeToRefs } from 'pinia'

const columns = [
    "name",
    "id",
    "created_at",
    "room_members",
    "edit"
]

import { useStorage } from '@vueuse/core'
const columns_to_show = useStorage('columns_to_show', columns) 

function on_column_select(val){
    columns_to_show.value = val
}

const store = root_store()
const {rooms, members, members_updated} = storeToRefs(store)

const loading = ref(false)
const rooms_computed = computed(()=> {
    return rooms.value.map((value) =>{
        return {
            ...value,
            created_at: formatDate(new Date(value.created_at)),
             access_list: value.access_list.map((user_id) => {
                const matched = members.value.find(member => member.user_id == user_id)
                return matched
            }),
            access_list_json: value.access_list.map((user_id) => {
                const matched = members.value.find(member => member.user_id == user_id)
                return JSON.stringify(matched)
            }),
        }
})
})

const toast = useToast();

const initialValues = reactive({
    room_name: ''
});

function get_rooms(){
    store.get_rooms()
}

const room_name = ref()
const selected_members = ref([])

async function add_room() {
    store.add_loader_message("Info: Creating room...")
    await store.create_room(room_name.value, selected_members.value)
    // console.log(room_name.value, selected_members.value)
    store.remove_loader_message("Info: Creating room...")
}

const formatDate = (value) => {
    return value.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false   
    });
};

const resolver = ({ values }) => {
    const errors = {};

    if (!values.room_name) {
        errors.room_name = [{ message: 'Room name is required.' }];
    }

    return {
        values, // (Optional) Used to pass current form values to submit event.
        errors
    };
};

const onFormSubmit = ({ valid }) => {
    if (valid) {
        toast.add({
            severity: 'success',
            summary: 'Form is submitted.',
            life: 3000
        });
        console.log()
    }
    else {
        alert("Invalid data! Pls try again.")
    }
};

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
//sample data
`
 { "id": "fe612dd0-b340-49ae-b417-675e1180244c", "name": "my_first_room", 
  "company_id": "73056d03-3ed0-4d14-a024-575a966b67b6", "created_by": "278d6145-4db7-4498-b305-8a18c0bf64ed", "created_at": "2025-05-25T14:13:28.702552+00:00", 
  "access_list": [ "278d6145-4db7-4498-b305-8a18c0bf64ed" ], "admin_list": null } 
`
</script>

<style>
.tab {
  display: inline-block;
  margin-left: 5px;
}
</style>