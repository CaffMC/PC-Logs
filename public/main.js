// main.js
import { db, collection, getDocs, addDoc } from './firebase-init.js';

async function fetchLogs() {
    const snapshot = await getDocs(collection(db, 'logs'));
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderLogs(logs);
}

function renderLogs(logs) {
    const logList = document.getElementById('logList');
    logList.innerHTML = '';
    if (!logs.length) {
        logList.innerHTML = '<p>No logs yet.</p>';
        return;
    }
    logs.forEach(log => {
        const entry = document.createElement('div');
        entry.textContent = `Build: ${log.name} | Profit: $${log.profit.toFixed(2)}`;
        logList.appendChild(entry);
    });
}

async function addLog(log) {
    await addDoc(collection(db, 'logs'), log);
    await fetchLogs();
}

document.getElementById('buildForm').onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const log = {
        name: formData.get('name'),
        // ... extract and calculate other fields similarly ...
        profit: parseFloat(formData.get('sale')) - calculateTotalCost(formData),
    };
    await addLog(log);
    e.target.reset();
};

function calculateTotalCost(formData) {
    let total = 0;
    const priceFields = ['gpuPrice', 'cpuPrice', 'ramPrice', 'motherboardPrice', 'psuPrice', 'storagePrice', 'psuExtPrice', 'cpuCoolerPrice', 'fansPrice', 'casePrice', 'extrasPrice'];
    priceFields.forEach(field => {
        total += parseFloat(formData.get(field)) || 0;
    });
    return total;
}

// Fetch logs initially
fetchLogs();
