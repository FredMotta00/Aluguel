// Re-export from the single source of truth to avoid duplicate initialization
export { app, auth, db, storage, functions } from '../integrations/firebase/client';