<script setup>

import { ref } from "vue";
import { useRouter } from 'vue-router';
import { Button } from "primevue";
import { root_store } from '@/stores/root_store'
import { storeToRefs } from 'pinia'
const store = root_store()

const router = useRouter();

const items = ref([
    {
        label: 'Home',
        icon: 'pi pi-home',
        route: '/'
    },
    {
        label: 'members',
        icon: 'pi pi-users',
        command: () => {
            router.push('/members');
        }
    },
    {
        label: 'rooms',
        icon: 'pi pi-box',
        command: () => {
            router.push('/rooms');
        }
    },
    // {
    //     label: 'rooms-access',
    //     icon: 'pi pi-lock',
    //     command: () => {
    //         router.push('/room-access');
    //     }
    // },
    // {
    //     label: 'External',
    //     icon: 'pi pi-home',
    //     url: 'https://vuejs.org/'
    // }
]);

</script>

<template>
    <div class="card flex justify-center">
        <Menu :model="items">
            <template #item="{ item, props }">
                <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
                    <a v-ripple :href="href" v-bind="props.action" @click="navigate">
                        <span :class="item.icon" />
                        <span class="ml-2">{{ item.label }}</span>
                    </a>
                </router-link>
                <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
                    <span :class="item.icon" />
                    <span class="ml-2">{{ item.label }}</span>
                </a>
            </template>
        </Menu>
        <br><br>
        <Button style="width: 100%;"
        @click="store.signout" 
        severity="contrast" variant="outlined"  icon="pi pi-sign-out" label="Sign out"></Button>
    </div>
</template>