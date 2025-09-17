import { auth, db, googleProvider } from './firebase-init.js';
import { collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { signInWithPopup, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const modal = document.getElementById('modal');
const overlay = document.getElementById('overlay');
const addBtn = document.getElementById('addBtn');
const closeModalBtn = document.getElementById('closeModal');
const buildForm = document.getElementById('buildForm');
const logList = document.getElementById('logList');
const MAX_LOGS_MAIN = 4;
let logs = [];
let currentEditIndex = null;

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function renderLogs() {
    logList.innerHTML = '';
    if (logs.length === 0) {
        logList.innerHTML = '<p>No builds logged yet.</p>';
        return;
    }
    const displayLogs = logs.slice(0, MAX_LOGS_MAIN);
    displayLogs.forEach(log => {
        const el = document.createElement('div');
        el.classList.add('logEntry');
        el.style.border = '1px solid #eee';
        el.style.padding = '12px';
        el.style.marginBottom = '16px';
        el.style.borderRadius = '5px';
        const partDetails = Object.entries(log.parts)
            .filter(([key, value]) => value && !key.toLowerCase().includes('price'))
            .map(([key, value]) => {
                const price = log.parts[key + 'Price'] || 0;
                return `<strong>${capitalize(key)}:</strong> ${value} ($${price.toFixed(2)})`;
            })
            .join('<br>');
        const locationSoldHtml = log.locationSold ? `<br><strong>Location Sold:</strong> ${log.locationSold}` : '';
        const dateListedHtml = log.dateListed ? `<br><strong>Date Listed:</strong> ${log.dateListed}` : '';
        const dateSoldHtml = log.dateSold ? `<br><strong>Date Sold:</strong> ${log.dateSold}` : '';
        el.innerHTML = `
        <strong>${log.name || 'Unnamed Build'}</strong><br>
        ${partDetails}${locationSoldHtml}${dateListedHtml}${dateSoldHtml}<br>
        <strong>Total Cost:</strong> $${log.totalCost.toFixed(2)}<br>
        <strong>Sale Price:</strong> $${log.sale.toFixed(2)}<br>
        <strong>Profit:</strong> $${log.profit.toFixed(2)}
        `;
        logList.appendChild(el);
    });
}

addBtn.addEventListener('click', () => {
    currentEditIndex = null;
    modal.style.display = 'flex';
    overlay.style.display = 'block';
    buildForm.reset();
    document.getElementById('modalTitle').textContent = "Add Build Log";
    document.getElementById('submitBtn').textContent = "Add";
});

closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    overlay.style.display = 'none';
    buildForm.reset();
    currentEditIndex = null;
});

overlay.addEventListener('click', () => {
    modal.style.display = 'none';
    overlay.style.display = 'none';
    buildForm.reset();
    currentEditIndex = null;
});

buildForm.onsubmit = async function (event) {
    event.preventDefault();
    if (!auth.currentUser) {
        alert('Please sign in to save your build logs.');
        return;
    }
    const formData = new FormData(buildForm);
    const parts = {
        gpu: formData.get('gpu') || '',
        gpuPrice: parseFloat(formData.get('gpuPrice')) || 0,
        cpu: formData.get('cpu') || '',
        cpuPrice: parseFloat(formData.get('cpuPrice')) || 0,
        ram: formData.get('ram') || '',
        ramPrice: parseFloat(formData.get('ramPrice')) || 0,
        motherboard: formData.get('motherboard') || '',
        motherboardPrice: parseFloat(formData.get('motherboardPrice')) || 0,
        psu: formData.get('psu') || '',
        psuPrice: parseFloat(formData.get('psuPrice')) || 0,
        storage: formData.get('storage') || '',
        storagePrice: parseFloat(formData.get('storagePrice')) || 0,
        psuExt: formData.get('psuExt') || '',
        psuExtPrice: parseFloat(formData.get('psuExtPrice')) || 0,
        cpuCooler: formData.get('cpuCooler') || '',
        cpuCoolerPrice: parseFloat(formData.get('cpuCoolerPrice')) || 0,
        fans: formData.get('fans') || '',
        fansPrice: parseFloat(formData.get('fansPrice')) || 0,
        case: formData.get('case') || '',
        casePrice: parseFloat(formData.get('casePrice')) || 0,
        extras: formData.get('extras') || '',
        extrasPrice: parseFloat(formData.get('extrasPrice')) || 0,
    };
    const locationSold = formData.get('locationSold') || '';
    const dateListed = formData.get('dateListed') || '';
    const dateSold = formData.get('dateSold') || '';
    const sale = parseFloat(formData.get('sale')) || 0;
    const totalCost = Object.keys(parts)
        .filter(k => k.toLowerCase().includes('price'))
        .reduce((acc, k) => acc + parts[k], 0);
    const profit = sale - totalCost;
    const newLog = {
        userId: auth.currentUser.uid,
        name: formData.get('name') || '',
        parts,
        totalCost,
        sale,
        profit,
        locationSold,
        dateListed,
        dateSold,
        timestamp: new Date(),
    };

    try {
        if (currentEditIndex !== null && logs[currentEditIndex]?.id) {
            alert("Editing existing logs is not implemented yet.");
        } else {
            await addDoc(collection(db, "buildLogs"), newLog);
        }
        alert("Build log saved successfully!");
        buildForm.reset();
        modal.style.display = 'none';
        overlay.style.display = 'none';
        currentEditIndex = null;
        // Don't call loadLogs here! onAuthStateChanged will handle it.
    } catch (error) {
        alert("Failed to save log: " + error.message);
    }
};

async function loadLogs() {
    if (!auth.currentUser) {
        logList.innerHTML = "<p>Please sign in to see your logs.</p>";
        return;
    }
    try {
        const q = query(collection(db, "buildLogs"), where("userId", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        logs = [];
        querySnapshot.forEach(doc => {
            logs.push({ id: doc.id, ...doc.data() });
        });
        renderLogs();
    } catch (error) {
        logList.innerHTML = `<p>Error loading logs: ${error.message}</p>`;
    }
}

// ---- Authentication Popup Modal Additions ----

window.addEventListener('DOMContentLoaded', () => {
    const authModal = document.getElementById('authPopup');
    const authClose = document.getElementById('authClose');
    const openAuthBtn = document.getElementById('openAuthPopup');

    const googleSignInBtn = document.getElementById('authGoogleBtn');
    const signOutBtn = document.getElementById('authSignOutBtn');
    const userInfo = document.getElementById('authUserInfo');
    const emailInput = document.getElementById('emailAuth');
    const passwordInput = document.getElementById('passwordAuth');
    const signUpBtn = document.getElementById('authSignUpBtn');
    const signInBtn = document.getElementById('authSignInBtn');

    openAuthBtn.addEventListener('click', () => {
        authModal.style.display = 'flex';
    });

    authClose.addEventListener('click', () => {
        authModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === authModal) {
            authModal.style.display = 'none';
        }
    });

    googleSignInBtn.addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            userInfo.textContent = `Signed in as ${result.user.email}`;
            updateUI(true);
            authModal.style.display = 'none';
            // No direct loadLogs call!
        } catch (error) {
            alert('Google sign-in failed: ' + error.message);
        }
    });

    signOutBtn.addEventListener('click', async () => {
        await signOut(auth);
        userInfo.textContent = '';
        updateUI(false);
        logList.innerHTML = "<p>Please sign in to view logs.</p>";
    });

    signUpBtn.addEventListener('click', async () => {
        const email = emailInput.value;
        const password = passwordInput.value;
        if (!email || !password) {
            alert('Please enter email and password.');
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            userInfo.textContent = `Signed up as ${userCredential.user.email}`;
            updateUI(true);
            authModal.style.display = 'none';
        } catch (error) {
            alert('Sign up failed: ' + error.message);
        }
    });

    signInBtn.addEventListener('click', async () => {
        const email = emailInput.value;
        const password = passwordInput.value;
        if (!email || !password) {
            alert('Please enter email and password.');
            return;
        }
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            userInfo.textContent = `Signed in as ${userCredential.user.email}`;
            updateUI(true);
            authModal.style.display = 'none';
        } catch (error) {
            alert('Sign in failed: ' + error.message);
        }
    });

    // SINGLE AUTH STATE HANDLER FOR ALL LOGIC:
    onAuthStateChanged(auth, (user) => {
        updateUI(!!user);
        if (user) {
            userInfo.textContent = `Signed in as ${user.email}`;
            loadLogs();
        } else {
            userInfo.textContent = '';
            logList.innerHTML = "<p>Please sign in to view logs.</p>";
        }
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
});

// REMOVE this block; use only onAuthStateChanged for auth state/UI logic
// if (auth.currentUser) {
//     loadLogs();
// } else {
//     logList.innerHTML = "<p>Please sign in to view logs.</p>";
// }
