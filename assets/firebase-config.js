// Firebase configuration for Subli Pop
(function() {
  const firebaseConfig = {
    apiKey: "AIzaSyBvX_nBtedUQBKHRwjC_QK2hMgfuSkmL-g",
    authDomain: "sublipop-3ab61.firebaseapp.com",
    projectId: "sublipop-3ab61",
    storageBucket: "sublipop-3ab61.firebasestorage.app",
    messagingSenderId: "1041815206193",
    appId: "1:1041815206193:web:ce172e9195896780fd1810"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  // Internal Firestore reference (not exposed to global scope)
  const _db = firebase.firestore();
  const _auth = firebase.auth();

  // Expose safe global aliases
  window.firestoreDB = _db;
  window.firebaseAuth = _auth;
  window.collections = {
    productos: _db.collection('productos'),
    categorias: _db.collection('categorias'),
    tickets: _db.collection('tickets'),
    usuarios: _db.collection('usuarios'),
    config: _db.collection('config').doc('site'),
    modelos3d: _db.collection('modelos3d'),
    modelos3dSeleccionados: _db.collection('config').doc('modelos3dSeleccionados'),
  };

  window.snapshotToArray = function(snapshot) {
    const data = [];
    snapshot.forEach(doc => {
      data.push({ id: doc.id, ...doc.data() });
    });
    return data;
  };

  // Firestore v10 enables IndexedDB persistence by default on web.
  // Explicit enablePersistence() is deprecated; removed to avoid console warnings.
})();
