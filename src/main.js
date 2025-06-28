import './assets/main.css'
import 'primeicons/primeicons.css'



import { createApp } from 'vue'
import { createPinia } from 'pinia'

import PrimeVue from 'primevue/config';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

import App from './App.vue'
import router from './router'

const app = createApp(App)
import ToastService from 'primevue/toastservice';


const Noir = definePreset(Aura, {
    semantic: {
        primary: {
            // 0: '#fcba03',
            50: '{zinc.50}',
            100: '{zinc.100}',
            200: '{zinc.200}',
            300: '{zinc.300}',
            400: '{zinc.400}',
            500: '{zinc.500}',
            600: '{zinc.600}',
            700: '{zinc.700}',
            800: '{zinc.800}',
            900: '{zinc.900}',
            950: '{zinc.950}'
        },
        surface: {
            // 0: "#fcba03",
            50: '{zinc.50}',
            100: '{zinc.100}',
            200: '{zinc.200}',
            300: '{zinc.300}',
            400: '{zinc.400}',
            500: '{zinc.500}',
            600: '{zinc.600}',
            700: '{zinc.700}',
            800: '{zinc.800}',
            900: '{zinc.900}',
            950: '{zinc.950}'
        },
        colorScheme: {
            light: {
                primary: {
                    color: '{zinc.950}',
                    50: '{zinc.50}',
                    inverseColor: '#ffffff',
                    hoverColor: '{zinc.900}',
                    activeColor: '{zinc.800}'
                },
                highlight: {
                    background: '{zinc.950}',
                    focusBackground: '{zinc.700}',
                    color: '#ffffff',
                    focusColor: '#ffffff'
                }
            },
            dark: {
                primary: {
                    color: '{zinc.50}',
                    50: '{zinc.950}',
                    inverseColor: '{zinc.950}',
                    hoverColor: '{zinc.100}',
                    activeColor: '{zinc.200}'
                },
                highlight: {
                    background: 'rgba(250, 250, 250, 0.05)',
                    focusBackground: 'rgba(250, 250, 250, .24)',
                    color: 'rgba(255,255,255,.87)',
                    focusColor: 'rgba(255,255,255,.87)'
                }
            },
            //  light: {
            //     surface: {
            //         0: '#ffffff',
            //         50: '{zinc.50}',
            //         100: '{zinc.100}',
            //         200: '{zinc.200}',
            //         300: '{zinc.300}',
            //         400: '{zinc.400}',
            //         500: '{zinc.500}',
            //         600: '{zinc.600}',
            //         700: '{zinc.700}',
            //         800: '{zinc.800}',
            //         900: '{zinc.900}',
            //         950: '{zinc.950}'
            //     }
            // },
            // dark: {
            //     surface: {
            //         0: '#ffffff',
            //         50: '{slate.50}',
            //         100: '{slate.100}',
            //         200: '{slate.200}',
            //         300: '{slate.300}',
            //         400: '{slate.400}',
            //         500: '{slate.500}',
            //         600: '{slate.600}',
            //         700: '{slate.700}',
            //         800: '{slate.800}',
            //         900: '{slate.900}',
            //         950: '{slate.950}'
            //     }
            // }
        }
    }
});

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: Noir,
        options: {
            prefix: 'p',
            darkModeSelector: '.my-app-dark',
            // cssLayer: true
        }
    }
});
app.use(ToastService);
app.mount('#app')
