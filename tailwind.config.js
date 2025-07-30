module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: { 
    extend: {
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
      },
    } 
  },
  plugins: [
    //require('@tailwindcss/forms'),
    require('daisyui'),
  ],
  daisyui: {
    themes: true,
    /*
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,*/
  },
}
