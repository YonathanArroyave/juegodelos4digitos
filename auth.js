function login() {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Usuario ha iniciado sesión
            const user = userCredential.user;
            console.log("Usuario ha iniciado sesión:", user.email);
            showGameContainer();
        })
        .catch((error) => {
            console.error("Error al iniciar sesión:", error);
            alert("Error al iniciar sesión. Por favor, verifica tus credenciales.");
        });
}

function register() {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Usuario registrado
            const user = userCredential.user;
            console.log("Usuario registrado:", user.email);
            showGameContainer();
        })
        .catch((error) => {
            console.error("Error al registrar:", error);
            alert("Error al registrar. Por favor, intenta con otro correo electrónico.");
        });
}

function logout() {
    auth.signOut().then(() => {
        console.log("Usuario ha cerrado sesión");
        showAuthContainer();
    }).catch((error) => {
        console.error("Error al cerrar sesión:", error);
    });
}

function showGameContainer() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
}

function showAuthContainer() {
    document.getElementById('authContainer').style.display = 'block';
    document.getElementById('gameContainer').style.display = 'none';
}

// Escuchar cambios en el estado de autenticación
auth.onAuthStateChanged((user) => {
    if (user) {
        // Usuario está autenticado
        showGameContainer();
    } else {
        // Usuario no está autenticado
        showAuthContainer();
    }
});