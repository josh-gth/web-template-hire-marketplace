import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import supabaseConfig from './config';

const SupabaseContext = createContext(null);

export const SupabaseProvider = ({ children }) => {
  const [supabase, setSupabase] = useState(null);

  useEffect(() => {
    const supabaseClient = createClient(supabaseConfig.url, supabaseConfig.anonKey);
    setSupabase(supabaseClient);
  }, []);

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => useContext(SupabaseContext);
