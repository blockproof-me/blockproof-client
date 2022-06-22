import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ClipboardJS from 'clipboard';

let clipboard = new ClipboardJS('.btn');

clipboard.on('success', function(e) {
    e.trigger.classList.add('tooltip')
    setTimeout(() => {
        e.trigger.classList.remove('tooltip')
    }, 2000)
    e.clearSelection();
});


createApp(App).use(router).mount('#app')
