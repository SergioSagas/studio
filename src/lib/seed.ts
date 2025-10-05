import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// NO MODIFICAR ESTE ARCHIVO - ES PARA USO INTERNO

async function seedAdminUser() {
  // Evitar ejecutar en el navegador
  if (typeof window !== 'undefined') {
    return;
  }

  console.log('Starting to seed admin user...');

  try {
    const appName = 'firebase-seed';
    const app = getApps().find(app => app.name === appName) || initializeApp(firebaseConfig, appName);
    
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    const email = 'sergio@gmail.com';
    const password = 'hola123';

    try {
      // Intenta crear el usuario. Si ya existe, createUserWithEmailAndPassword fallará.
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log(`Admin user created with UID: ${user.uid}`);

      // Ahora guarda los detalles en Firestore
      const userRef = doc(firestore, 'users', user.uid);
      await setDoc(userRef, {
        firstName: 'Sergio',
        lastName: 'Sagastegui',
        email: email,
        role: 'admin',
      });
      console.log('Admin user details saved to Firestore.');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('Admin user already exists. Seeding skipped.');
      } else {
        // Para otros errores, sí queremos que se muestren.
        throw error;
      }
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
}

seedAdminUser().then(() => {
    console.log('Seeding finished.');
    // We need to exit the process otherwise the postinstall will hang
    if (typeof process !== 'undefined') {
        process.exit(0);
    }
}).catch((e) => {
    console.error('Seeding failed:', e);
    if (typeof process !== 'undefined') {
        process.exit(1);
    }
});
