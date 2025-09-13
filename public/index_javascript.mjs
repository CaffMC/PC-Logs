import { db, collection, getDocs, addDoc } from './firebase-init.js';

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

// Render logs fetched from Firestore
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

        const partDetails = Object.entries(log.parts || {})
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
        <strong>Total Cost:</strong> $${(log.totalCost || 0).toFixed(2)}<br>
        <strong>Sale Price:</strong> $${(log.sale || 0).toFixed(2)}<br>
        <strong>Profit:</strong> $${(log.profit || 0).toFixed(2)}
        `;

        logList.appendChild(el);
    });
}

// Fetch all logs from Firestore
async function fetchLogs() {
    const snapshot = await getDocs(collection(db, 'logs'));
    logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderLogs();
}

addBtn.onclick = () => {
    currentEditIndex = null;
    modal.style.display = 'flex';
    overlay.style.display = 'block';
    buildForm.reset();
    document.getElementById('modalTitle').textContent = "Add Build Log";
    document.getElementById('submitBtn').textContent = "Add";
};

closeModalBtn.onclick = () => {
    modal.style.display = 'none';
    overlay.style.display = 'none';
    buildForm.reset();
    currentEditIndex = null;
};

overlay.onclick = () => {
    modal.style.display = 'none';
    overlay.style.display = 'none';
    buildForm.reset();
    currentEditIndex = null;
};

buildForm.onsubmit = async function (event) {
    event.preventDefault();

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
        name: formData.get('name') || '',
        parts,
        totalCost,
        sale,
        profit,
        locationSold,
        dateListed,
        dateSold
    };

    // Save new log to Firestore
    await addDoc(collection(db, 'logs'), newLog);

    // Refresh logs from Firestore
    await fetchLogs();

    modal.style.display = 'none';
    overlay.style.display = 'none';

    buildForm.reset();
    currentEditIndex = null;
};

// Initial fetch of logs on page load
fetchLogs();
