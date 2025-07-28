supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    // usuario logueado
  } else {
    // usuario no logueado
  }
})
