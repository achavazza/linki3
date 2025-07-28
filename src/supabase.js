import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nsqirnwlpbohwduaepuw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zcWlybndscGJvaHdkdWFlcHV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2Mjc5NTQsImV4cCI6MjA2OTIwMzk1NH0.D--P21KA2TJfm3aDbvCZYVBxIKgtE8UzSztPaedB1Fc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)