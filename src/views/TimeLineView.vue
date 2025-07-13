<script setup>
import { ref } from "vue";

const events = ref([
  {
    status: 'Peer-to-Peer File Sharing',
    subtitle: "Unlimited WebRTC-based file transfers without server dependency.",
    content: "Share files of any size directly between clients — fast, secure, and infinite.",
    src: "/tunnel-1000.jpg"
  },
  {
    status: 'Advanced Remote System Control',
    subtitle: "Next-level control features beyond standard remote access.",
    content: "Operate systems remotely with fine-grained control and seamless performance.",
    src: "/remote-system-1000.jpg"
  },
  {
    status: 'Shared Listening Experience',
    subtitle: "Like Spotify Jam, but for your entire system audio.",
    content: "Stream high-quality audio with intentional delay to listen to music together with loved ones.",
    src: "/song.jpg"
  },
  {
    status: 'AI Assistant for Automation',
    subtitle: "Let AI take notes, send emails, set reminders, and more.",
    content: "Integrated smart assistant for hands-free productivity and communication.",
    src: "/ai-1000.jpg"
  },
  { status: '' },
  { status: '' },
]);
</script>

<template>
  <div class="w-full flex flex-col items-center gap-12">
    <!-- Banner -->
    <div class="bg-blue-violet text-white text-4xl font-sans font-bold px-6 py-2 text-center w-full flex items-center justify-center" style="background-color: blueviolet; min-height: 100px;">
  From Vision to Reality — See What’s Coming Next.
</div>


    <!-- Timeline Container -->
    <div class="card flex flex-wrap gap-12" style="width: 30rem; margin: auto;">
      <br />
      <Timeline :value="events" class="w-full md:w-80">
        <template #content="slotProps">
          <Card style="width: 20rem; overflow: hidden" :style="{ opacity: slotProps.item.status ? 1 : 0 }">
            <template #header>
              <img :src="slotProps.item?.src" />
            </template>
            <template #title>{{ slotProps.item.status }}</template>
            <template #subtitle>{{ slotProps.item.subtitle }}</template>
            <template #content>
              <p class="m-0">{{ slotProps.item.content }}</p>
            </template>
          </Card>
          <br /><br />
        </template>
      </Timeline>
    </div>
  </div>
</template>
