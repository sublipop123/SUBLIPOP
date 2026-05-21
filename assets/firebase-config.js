// Firebase configuration for Subli Pop
const firebaseConfig = {
  apiKey: "AIzaSyBvX_n8tedUQBKHRwjC_QK2hMgfuSkml-g",
  authDomain: "sublipop-3ab61.firebaseapp.com",
  projectId: "sublipop-3ab61",
  storageBucket: "sublipop-3ab61.firebasestorage.app",
  messagingSenderId: "1041815206193",
  appId: "1:1041815206193:web:ce172e9195896780fd1810"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export services
const db = firebase.firestore();
const auth = firebase.auth();

// Helper to convert Firestore snapshot to array
function snapshotToArray(snapshot) {
  const data = [];
  snapshot.forEach(doc => {
    data.push({ id: doc.id, ...doc.data() });
  });
  return data;
}

// Firestore collections reference
const collections = {
  productos: db.collection('productos'),
  categorias: db.collection('categorias'),
  tickets: db.collection('tickets'),
  usuarios: db.collection('usuarios'),
  config: db.collection('config').doc('site'),
  modelos3d: db.collection('modelos3d'),
  modelos3dSeleccionados: db.collection('config').doc('modelos3dSeleccionados'),
};

// Offline persistence
if (db.enablePersistence) {
  db.enablePersistence({ synchronizeTabs: true }).catch(err => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence failed: multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence not available in this browser');
    }
  });
}
