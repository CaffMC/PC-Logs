import { auth, googleProvider } from './firebase-init.js';
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

export function initAuth({ emailInput, passwordInput, signUpBtn, signInBtn, googleSignInBtn, signOutBtn, userInfo, addBtn }) {

    googleSignInBtn.addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            userInfo.textContent = `Signed in as ${result.user.email}`;
            updateUI(true);
        } catch (error) {
            alert('Google sign-in failed: ' + error.message);
        }
    });

    signOutBtn.addEventListener('click', async () => {
        await signOut(auth);
        userInfo.textContent = '';
        updateUI(false);
    });

    signUpBtn.addEventListener('click', async () => {
        const email = emailInput.value;
        const password = passwordInput.value;
        if (!email || !password) {
            alert('Please enter email and password');
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            userInfo.textContent = `Signed up as ${userCredential.user.email}`;
            updateUI(true);
        } catch (error) {
            alert('Sign up failed: ' + error.message);
        }
    });

    signInBtn.addEventListener('click', async () => {
        const email = emailInput.value;
        const password = passwordInput.value;
        if (!email || !password) {
            alert('Please enter email and password');
            return;
        }
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            userInfo.textContent = `Signed in as ${userCredential.user.email}`;
            updateUI(true);
        } catch (error) {
            alert('Sign in failed: ' + error.message);
        }
    });

    onAuthStateChanged(auth, user => {
        updateUI(!!user);
        if (user) userInfo.textContent = `Signed in as ${user.email}`
        else userInfo.textContent = '';
    });

    function updateUI(signedIn) {
        emailInput.style.display = signedIn ? 'none' : 'block';
        passwordInput.style.display = signedIn ? 'none' : 'block';
        signUpBtn.style.display = signedIn ? 'none' : 'block';
        signInBtn.style.display = signedIn ? 'none' : 'block';
        googleSignInBtn.style.display = signedIn ? 'none' : 'block';
        signOutBtn.style.display = signedIn ? 'block' : 'none';

        addBtn.disabled = !signedIn;
    }
}
