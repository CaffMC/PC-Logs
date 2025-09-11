const modal = document.getElementById('modal');
const overlay = document.getElementById('overlay');
const addBtn = document.getElementById('addBtn');
const closeModal = document.getElementById('closeModal');
const buildForm = document.getElementById('buildForm');
const logList = document.getElementById('logList');

let logs = [];

addBtn.onclick = () => {
    modal.style.display = 'flex';
    overlay.style.display = 'block';
};

const closeModalFunc = () => {
    modal.style.display = 'none';
    overlay.style.display = 'none';
};

closeModal.onclick = closeModalFunc;
overlay.onclick = closeModalFunc;

buildForm.onsubmit = function (event) {
    event.preventDefault();

    const formData = new FormData(buildForm);

    // Gather all parts and prices, default to empty string or 0
    const name = formData.get('name') || '';

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

    const sale = parseFloat(formData.get('sale')) || 0;

    // Calculate total cost
    const totalCost = Object.keys(parts)
        .filter(key => key.toLowerCase().includes('price'))
        .reduce((acc, key) => acc + parts[key], 0);

    const profit = sale - totalCost;

    logs.push({ name, parts, totalCost, sale, profit });

    buildForm.reset();
    closeModalFunc();
    renderLogs();
};

function renderLogs() {
    logList.innerHTML = '';

    if (logs.length === 0) {
        logList.innerHTML = '<p>No builds logged yet.</p>';
        return;
    }

    logs.forEach(log => {
        const el = document.createElement('div');
        el.style.border = '1px solid #eee';
        el.style.padding = '12px';
        el.style.marginBottom = '16px';
        el.style.borderRadius = '5px';

        // Format parts display only if name is filled
        const partDetails = Object.entries(log.parts)
            .filter(([key, value]) => value && !key.toLowerCase().includes('price'))
            .map(([key, value]) => {
                const price = log.parts[key + 'Price'] || 0;
                return `<strong>${capitalize(key)}:</strong> ${value} ($${price.toFixed(2)})`;
            })
            .join('<br>');

        el.innerHTML = `
      <strong>${log.name || 'Unnamed Build'}</strong><br>
      ${partDetails}<br>
      <strong>Total Cost:</strong> $${log.totalCost.toFixed(2)}<br>
      <strong>Sale Price:</strong> $${log.sale.toFixed(2)}<br>
      <strong>Profit:</strong> $${log.profit.toFixed(2)}
    `;
        logList.appendChild(el);
    });
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

renderLogs();
