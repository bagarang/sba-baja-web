document.addEventListener("DOMContentLoaded", function() {
    checkAccess();
    displayUserProfile();
    loadDashboardStats();
    loadInventoryTable();
});

function checkAccess() {
    if (localStorage.getItem("isLoggedIn") !== "true") {
        window.location.href = "index.html";
    }
}

/**
 * LOGIKA PERPINDAHAN MENU
 */
function switchView(viewName) {
    // Reset classes
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-menu li').forEach(l => l.classList.remove('active'));

    if (viewName === 'dashboard') {
        document.getElementById('sectionDashboard').classList.add('active');
        document.getElementById('menuDashboard').classList.add('active');
        loadDashboardStats();
    } else if (viewName === 'accounting') {
        document.getElementById('sectionAccounting').classList.add('active');
        document.getElementById('menuAccounting').classList.add('active');
        loadAccountingTable();
    }
}

function displayUserProfile() {
    const userDisplay = document.getElementById("userDisplay");
    const roleDisplay = document.getElementById("roleDisplay");
    if (userDisplay) userDisplay.innerText = localStorage.getItem("username");
    if (roleDisplay) {
        const role = localStorage.getItem("userRole") || "kasir";
        roleDisplay.innerText = role.toUpperCase();
        roleDisplay.className = "badge " + (role === "owner" ? "btn-accent" : "btn-primary");
    }
}

async function loadDashboardStats() {
    try {
        const response = await fetch(`${config.apiUrl}?action=getDashboard`);
        const data = await response.json();
        const formatRp = (num) => "Rp " + num.toLocaleString('id-ID');
        document.getElementById("statsHari").innerText = formatRp(data.hari_ini);
        document.getElementById("statsBulan").innerText = formatRp(data.bulan_ini);
        document.getElementById("statsTahun").innerText = formatRp(data.tahun_ini);
        document.getElementById("statsTotal").innerText = formatRp(data.total_omset);
    } catch (e) { console.error("Gagal load stats:", e); }
}

async function loadInventoryTable() {
    const tableBody = document.getElementById("tableBarangBody");
    try {
        const response = await fetch(`${config.apiUrl}?action=getBarang`);
        const items = await response.json();
        tableBody.innerHTML = items.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${item.kode}</strong></td>
                <td>${item.nama}</td>
                <td>${item.stok} ${item.satuan}</td>
                <td>Rp ${item.harga.toLocaleString('id-ID')}</td>
            </tr>
        `).join("");
    } catch (e) { tableBody.innerHTML = "<tr><td colspan='5'>Gagal load data.</td></tr>"; }
}

/**
 * LOAD TABEL AKUNTANSI
 */
async function loadAccountingTable() {
    const tableBody = document.getElementById("tableAccountingBody");
    tableBody.innerHTML = "<tr><td colspan='8'>Memuat data transaksi...</td></tr>";
    try {
        const response = await fetch(`${config.apiUrl}?action=getAccounting`);
        const data = await response.json();
        tableBody.innerHTML = data.map(item => `
            <tr>
                <td><small>${item.tanggal}</small></td>
                <td><strong>${item.no_invoice}</strong></td>
                <td>${item.kasir}</td>
                <td>${item.kode}</td>
                <td>${item.nama}</td>
                <td>${item.qty}</td>
                <td>${item.harga}</td>
                <td style="font-weight:bold; color:#10b981;">${item.total}</td>
            </tr>
        `).join("");
    } catch (e) { tableBody.innerHTML = "<tr><td colspan='8'>Gagal load akuntansi.</td></tr>"; }
}

function filterTable() {
    const filter = document.getElementById("searchBarang").value.toUpperCase();
    const rows = document.querySelectorAll("#tableBarangBody tr");
    rows.forEach(row => {
        const text = row.innerText.toUpperCase();
        row.style.display = text.includes(filter) ? "" : "none";
    });
}

function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}
