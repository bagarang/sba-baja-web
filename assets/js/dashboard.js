/**
 * SBA BAJA SYSTEM - Dashboard Logic (Versi Fix)
 */

document.addEventListener("DOMContentLoaded", function() {
    checkAccess();
    const role = localStorage.getItem("userRole") ? localStorage.getItem("userRole").toLowerCase() : "kasir";
    displayUserProfile(role);

    if (role === "kasir") {
        if (document.getElementById("menuAccounting")) document.getElementById("menuAccounting").style.display = "none";
        if (document.getElementById("statsGrid")) document.getElementById("statsGrid").style.display = "none";
        if (document.getElementById("mainTitle")) document.getElementById("mainTitle").innerText = "Daftar Stok Barang";
    } else {
        loadDashboardStats();
    }
    loadInventoryTable();
});

function checkAccess() {
    if (localStorage.getItem("isLoggedIn") !== "true") window.location.href = "index.html";
}

function displayUserProfile(role) {
    if (document.getElementById("userDisplay")) document.getElementById("userDisplay").innerText = localStorage.getItem("username") || "User";
    if (document.getElementById("roleDisplay")) {
        const roleDisplay = document.getElementById("roleDisplay");
        roleDisplay.innerText = role.toUpperCase();
        roleDisplay.className = "badge " + (role === "owner" || role === "admin" ? "btn-accent" : "btn-primary");
    }
}

function switchView(viewName) {
    const role = localStorage.getItem("userRole").toLowerCase();
    if (viewName === 'accounting' && role === 'kasir') return alert("Akses Ditolak.");

    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-menu li').forEach(l => l.classList.remove('active'));

    if (viewName === 'dashboard') {
        document.getElementById('sectionDashboard').classList.add('active');
        document.getElementById('menuDashboard').classList.add('active');
        loadDashboardStats(); // Refresh stats saat balik ke dashboard
    } else if (viewName === 'accounting') {
        document.getElementById('sectionAccounting').classList.add('active');
        document.getElementById('menuAccounting').classList.add('active');
        loadAccountingTable();
    }
}

async function loadDashboardStats() {
    try {
        const response = await fetch(`${config.apiUrl}?action=getDashboard`);
        const data = await response.json();
        const f = (n) => "Rp " + n.toLocaleString('id-ID');
        document.getElementById("statsHari").innerText = f(data.hari_ini || 0);
        document.getElementById("statsBulan").innerText = f(data.bulan_ini || 0);
        document.getElementById("statsTahun").innerText = f(data.tahun_ini || 0);
        document.getElementById("statsTotal").innerText = f(data.total_omset || 0);
    } catch (e) { console.error("Gagal muat statistik."); }
}

async function loadInventoryTable() {
    const tableBody = document.getElementById("tableBarangBody");
    try {
        const res = await fetch(`${config.apiUrl}?action=getBarang`);
        const items = await res.json();
        tableBody.innerHTML = items.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${item.kode}</strong></td>
                <td>${item.nama}</td>
                <td>${Number.isInteger(item.stok) ? item.stok : parseFloat(item.stok).toFixed(2)} ${item.satuan}</td>
                <td>Rp ${item.harga.toLocaleString('id-ID')}</td>
            </tr>`).join("");
    } catch (e) { tableBody.innerHTML = "<tr><td colspan='5'>Gagal muat stok.</td></tr>"; }
}

/**
 * FIX: LOAD AKUNTANSI YANG GAGAL MUAT
 */
async function loadAccountingTable() {
    const tableBody = document.getElementById("tableAccountingBody");
    tableBody.innerHTML = "<tr><td colspan='8' class='text-center'>Memuat data transaksi...</td></tr>";
    try {
        const response = await fetch(`${config.apiUrl}?action=getAccounting`);
        const data = await response.json();
        
        if (data.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='8' class='text-center'>Belum ada data transaksi.</td></tr>";
            return;
        }

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
            </tr>`).join("");
    } catch (e) { 
        console.error("Error Akuntansi:", e);
        tableBody.innerHTML = "<tr><td colspan='8' class='text-center text-danger'>Gagal muat akuntansi. Periksa koneksi atau deploy ulang script.</td></tr>"; 
    }
}

function filterTable() {
    const f = document.getElementById("searchBarang").value.toUpperCase();
    document.querySelectorAll("#tableBarangBody tr").forEach(row => {
        row.style.display = row.innerText.toUpperCase().includes(f) ? "" : "none";
    });
}

function logout() { if (confirm("Keluar?")) { localStorage.clear(); window.location.href = "index.html"; } }
