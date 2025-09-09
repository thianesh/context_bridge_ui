<script setup>
import gradient_colorful from '@/components/gradient_colorful.vue';
import gradient_dual_blue from '@/components/gradient_dual_blue.vue';
import CustomVideoPlayer from '@/components/CustomVideoPlayer.vue';
</script>

<template>
<!-- <gradient_colorful></gradient_colorful> -->
<gradient_dual_blue>
    <h5 class="mt-5 ml-7 text-1xl font-normal leading-10 tracking-wide text-gray-900 dark:text-white">GETTING STARTED 
        <br>
        WITH
        <mark class="px-2 text-white bg-slate-950 rounded-sm">JO-MEET</mark>
        -
        <mark class="px-2 text-white bg-slate-950 rounded-sm p-2">intelligence</mark> <Button icon="pi pi-arrow-up-right" rounded></Button>
    </h5>

    <br>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div class="p-card p-4 flex items-left flex-col gap-2">
            <CustomVideoPlayer style="max-width: 600px;margin: auto;height: max-content;margin-bottom: 0.5rem;" src="http://media.w3.org/2010/05/sintel/trailer.mp4" controls></CustomVideoPlayer>
            <div class="grid grid-cols-[auto_auto_auto] gap-1" style="width: max-content;margin: auto;">
                <IftaLabel>
                    <InputText id="Frame_rate" v-model="value" type="number" class="w-30" />
                    <label for="Frame_rate">Frames per min</label>
                </IftaLabel>
                <IftaLabel>
                    <InputText id="crop_x" v-model="value" type="number" class="w-25" />
                    <label for="crop_x">Crop X</label>
                </IftaLabel>
                 <IftaLabel>
                    <InputText id="crop_y" v-model="value" type="number" class="w-25" />
                    <label for="crop_y">Crop Y</label>
                </IftaLabel>
                <p></p>
                <IftaLabel>
                    <InputText id="crop_x" v-model="value" type="number" class="w-25" />
                    <label for="crop_x">Center X</label>
                </IftaLabel>
                 <IftaLabel>
                    <InputText id="crop_y" v-model="value" type="number" class="w-25" />
                    <label for="crop_y">Center Y</label>
                </IftaLabel>
            </div>

            <div class="grid grid-cols-1 gap-1" style="width: max-content;margin: auto;margin-top: 2rem;">
                <Tag severity="Primary">Pipeline</Tag>
                <br>
                <div class="p-2 bg-gray-950 rounded-sm flex flex-col items-center gap-2" severity="Secondary"> <p>Object Detection</p> <ToggleSwitch name="activation" /></div>
                <div class="p-2 bg-gray-950 rounded-sm flex flex-col items-center gap-2" severity="Secondary"> <p>Classification</p> <ToggleSwitch name="activation" /></div>
                <div class="p-2 bg-gray-950 rounded-sm flex flex-col items-center gap-2" severity="Secondary"> <p>Vision Language</p> <ToggleSwitch :model-value="true" disabled name="activation" /></div>
                <div class="p-2 bg-gray-950 rounded-sm flex flex-col items-center gap-2" severity="Secondary"> <p>Long Term memory</p> <ToggleSwitch :model-value="true" disabled name="activation" /></div>
                <br>
                <div class="p-2 bg-gray-950 rounded-sm flex items-center gap-2 text-gray-500">adksfheirksje*** <Button icon="pi pi-copy" size="small" severity="secondary"></Button></div>
            </div>

        </div>
        <div class="p-card p-4 flex items-left flex-col gap-2">
            Event Configuration

            <Divider></Divider>
            <IftaLabel>
                <InputText id="username" v-model="value" />
                <label for="username">Event Name</label>
            </IftaLabel>
            <IftaLabel>
                <Textarea id="event_description" class="w-full max-w-sm" v-model="value" />
                <label for="event_description">Event Description</label>
            </IftaLabel>
            <div class="flex gap-2">
                <Button icon="pi pi-plus-circle" label="Add param"></Button>
                <Button severity="success" class="w-60">Save & Deploy</Button>
            </div>
            <Fieldset legend="Param1" :toggleable="true">
                 <IftaLabel>
                    <InputText id="param_name" v-model="value" style="margin-bottom: 0.5rem;" />
                    <label for="param_name">Param Name</label>
                </IftaLabel>
                <IftaLabel>
                    <Textarea id="param_description" class="w-full max-w-sm" v-model="value" />
                    <label for="param_description">Param Description</label>
                </IftaLabel>
                <IftaLabel>
                    <Textarea id="event_description" class="w-full max-w-sm" v-model="value" />
                    <label for="event_description">Examples</label>
                </IftaLabel>
            </Fieldset>
             <Fieldset legend="Param2" :toggleable="true">
                 <IftaLabel>
                    <InputText id="param_name" v-model="value" style="margin-bottom: 0.5rem;" />
                    <label for="param_name">Param Name</label>
                </IftaLabel>
                <IftaLabel>
                    <Textarea id="param_description" class="w-full max-w-sm" v-model="value" />
                    <label for="param_description">Param Description</label>
                </IftaLabel>
                <IftaLabel>
                    <Textarea id="event_description" class="w-full max-w-sm" v-model="value" />
                    <label for="event_description">Examples</label>
                </IftaLabel>
            </Fieldset>
        </div>
    </div>
</gradient_dual_blue>
</template>

<style scoped> 

</style>