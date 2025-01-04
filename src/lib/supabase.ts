import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gvpgnoeaskraggumepqc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2cGdub2Vhc2tyYWdndW1lcHFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyNDgxMDUsImV4cCI6MjA1MDgyNDEwNX0.qxl-UOUOLbbNWULbv5R32R3ZOAaun0ONQ7283FpUoIU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 