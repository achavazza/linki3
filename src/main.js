//import './assets/main.css'
import './assets/tailwind.css'
//import './assets/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
// main.js
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'



import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)


app.use(Toast, {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
})

app.mount('#app')
