// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyANxdxtV0xWp825tfF73la9ARJrZzOxyQw",
    authDomain: "juegode4digitos.firebaseapp.com",
    projectId: "juegode4digitos",
    storageBucket: "juegode4digitos.appspot.com",
    messagingSenderId: "123152976273",
    appId: "1:123152976273:web:582f1fe1f9dc0e84f3b230"
  };
  
  // Inicialización de Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  const auth = firebase.auth();