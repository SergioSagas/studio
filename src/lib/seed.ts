import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// NO MODIFICAR ESTE ARCHIVO - ES PARA USO INTERNO

async function seedAdminUser() {
  const appName = 'firebase-seed-admin';
  const app = getApps().find(app => app.name === appName) || initializeApp(firebaseConfig, appName);
  
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  const email = 'sergio@gmail.com';
  const password = 'hola123';

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log(`Admin user created with UID: ${user.uid}`);

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
      throw error;
    }
  }
}

async function seedNormalUsers() {
    const appName = 'firebase-seed-users';
    const app = getApps().find(app => app.name === appName) || initializeApp(firebaseConfig, appName);
    
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    const users = [
        { email: 'sotomarlon@gmail.com', password: 'sotomarlon', firstName: 'Marlon', lastName: 'Soto' },
        { email: 'floresdiogo@gmail.com', password: 'floresdiogo', firstName: 'Diogo', lastName: 'Flores' },
        { email: 'manriquehenyer@gmail.com', password: 'manriquehenyer', firstName: 'Henyer', lastName: 'Manrique' },
    ];

    for (const userData of users) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
            const user = userCredential.user;
            console.log(`User ${userData.email} created with UID: ${user.uid}`);

            const userRef = doc(firestore, 'users', user.uid);
            await setDoc(userRef, {
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                role: 'user',
            });
            console.log(`User details for ${userData.email} saved to Firestore.`);
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                console.log(`User ${userData.email} already exists. Seeding skipped.`);
            } else {
                // Para otros errores, sí queremos que se muestren.
                console.error(`Failed to seed user ${userData.email}:`, error);
            }
        }
    }
}


async function seedData() {
    // Evitar ejecutar en el navegador
    if (typeof window !== 'undefined') {
        return;
    }
    console.log('Starting to seed data...');
    try {
        await seedAdminUser();
        await seedNormalUsers();
    } catch (error) {
        console.error('Error seeding data:', error);
        throw error; // Lanza el error para que el proceso falle si es necesario
    }
}


seedData().then(() => {
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
