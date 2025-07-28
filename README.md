# Linki3

Linki3 is a custom-built clone of Linktree, developed with **Vue 3**, **Vite**, and **Supabase**.  
It allows users to create and share personalized profile pages with links and taglines.

---

## ✨ Features

- User authentication (Supabase)
- Create, edit, and manage multiple profiles
- Each profile has:
  - Display name, tagline, and description
  - Custom list of links (with titles and URLs)
  - Public slug-based URL (e.g. `/p/username`)
  - QR code generation for sharing
- Responsive layout with mobile-friendly navigation
- Built using **Vue 3**, **Pinia**, **Vue Router**, and **Tailwind CSS**

---

## 🔧 Tech Stack

- [Vue 3](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.com/)
- [Pinia](https://pinia.vuejs.org/) for state management
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [qrcode.vue](https://github.com/scopewu/qrcode.vue) for QR generation

---

## 🛠 Project Setup


```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
