import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

try {
  signInWithEmailAndPassword(undefined, "test@test.com", "password").catch(e => console.error("Caught:", e.message));
} catch (e) {
  console.error("Sync caught undefined:", e.message);
}

try {
  signInWithEmailAndPassword({}, "test@test.com", "password").catch(e => console.error("Caught:", e.message));
} catch (e) {
  console.error("Sync caught empty object:", e.message);
}
