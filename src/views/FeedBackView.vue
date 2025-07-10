<script setup>
    import { onMounted, ref } from 'vue';
    import { useToast } from "primevue/usetoast";
const toast = useToast();

    import { root_store } from '@/stores/root_store'
    import { storeToRefs } from 'pinia'

const store = root_store()
const { session_data, members,all_feedback,
    get_all_feedback,
    add_feedback, 
  display_preference, rooms, members_updated, my_company, companies_im_partof, companyId } = storeToRefs(store)

    const feedback = ref("")

    onMounted(() => {
        store.get_all_feedback()
    })

    async function submit_feedback() {
        if(feedback.value.length == 0) {
            alert("please enter a valid feedback")
            return
        }
        store.add_loader_message("Submitting feedback")
        let result = await store.add_feedback(feedback.value)
        toast.add({ 
        severity: result.status ? 'success' : 'error', 
        summary: 'Info', 
        detail: result.message, 
        life: 3000 })
        await store.get_all_feedback()
        store.remove_loader_message("Submitting feedback")
    }
</script>


<template>
    <Toast />
    <div  class="flex flex-col gap-4 w-100" style="margin: auto;">
        <p>
  Hi {{ session_data?.data?.session?.user.user_metadata.full_name }}! 👋<br>
  Thank you so much for taking the time to share your feedback.
  <br><br> Your input truly matters to us!<br><br>
  We're committed to making things better for you — whether it's implementing, fixing, or updating based on your suggestions.
</p>
     <div class="flex flex-col gap-1">
        <Textarea v-model="feedback" rows="5" cols="30" style="resize: auto" />
    </div>
    <Button type="submit" severity="secondary" label="Submit" @click="submit_feedback" />
    <br>
    <br>
    <h5>
       Feedback you've submitted:
       <div style="max-height: 500px;overflow: auto;">
       <div v-for="(feedback, index) in all_feedback" v-bind:key="index">
        <br>
            <tag>{{ new Date(feedback?.created_at).toLocaleString({
            hour: 'numeric',
            minute: '2-digit',
            hour12: true}) }}</tag>
            <br><br>
           <p>{{ feedback?.message }}</p>
           <Divider></Divider>
       </div>
       </div>
    </h5>
    </div>

</template>