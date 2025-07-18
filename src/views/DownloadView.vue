<template>
    <a href="/Jo Meet Setup 1.0.0.exe" download>
        <Button label="Download for windows x64" icon="pi pi-microsoft"></Button>
    </a>
    <span style="margin: 0.5rem"></span>
    <a href="/jomeet_1.0.0_amd64.deb" download>
        <Button label="Download for Linux x64" icon="pi pi-code"></Button>
    </a>
    <Divider>

    </Divider>

    <Fieldset legend="What is Jo-meet" :toggleable="true" :collapsed="true">
        <Message severity="warn">Better quality videos will be uploaded soon! Please bear with us for now</Message>
        <br><br>
<iframe width="100%" height="500px" src="https://www.youtube.com/embed/iqa5mmAuSm8?si=Q4zzKkZlaOwr6f4A" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</Fieldset>

    <br>
    <Fieldset legend="Getting Started" :toggleable="true" :collapsed="true">
        <Message severity="warn">Better quality videos will be uploaded soon! Please bear with us for now</Message>
        <br><br>
    <iframe width="100%" height="500px" src="https://www.youtube.com/embed/uXQymCCs9dY?si=8UXvYJOg5WFeaE04" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
    </Fieldset>

    <br>
      <Fieldset legend="How to use remote system?" :toggleable="true" :collapsed="true">
        <Message severity="warn">Better quality videos will be uploaded soon! Please bear with us for now</Message>
        <br><br>
    <iframe width="100%" height="500px" src="https://www.youtube.com/embed/v7S_vpqvx0M?si=uVA5KAie70RViyjZ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
    </Fieldset>
    
     <br>
      <Fieldset legend="Need Google meet like interface?" :toggleable="true" :collapsed="true">
    <img src="/conference_ui.png">
    </Fieldset>

</template>