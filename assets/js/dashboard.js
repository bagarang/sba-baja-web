/**
 * DASHBOARD LOGIC - SBA BAJA (FULL VERSION)
 */
document.addEventListener("DOMContentLoaded", function() {
    checkAccess();
    const role = localStorage.getItem("userRole") ? localStorage.getItem("userRole").toLowerCase() : "kasir";
    displayUserProfile(role);
    if (role === "kasir") {
        document.getElementById("menuAccounting").style.display = "none";
        document.getElementById("statsGrid").style.display = "none";
        document.getElementById("mainTitle").innerText = "Daftar Stok Barang";
    } else {
        loadDashboardStats();
    }
    loadInventoryTable();
});

function checkAccess() { if (localStorage.getItem("isLoggedIn") !== "true") window.location.href = "index.html"; }

function displayUserProfile(role) {
    document.getElementById("userDisplay").innerText = localStorage.getItem("username") || "User";
    const badge = document.getElementById("roleDisplay");
    badge.innerText = role.toUpperCase();
    badge.className = "badge " + (role === "owner" || role === "admin" ? "btn-accent" : "btn-primary");
}

function switchView(viewName) {
    const role = localStorage.getItem("userRole").toLowerCase();
    if (viewName === 'accounting' && role === 'kasir') return alert("Akses Ditolak.");
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-menu li').forEach(l => l.classList.remove('active'));
    if (viewName === 'dashboard') {
        document.getElementById('sectionDashboard').classList.add('active');
        document.getElementById('menuDashboard').classList.add('active');
        loadDashboardStats();
    } else {
        document.getElementById('sectionAccounting').classList.add('active');
        document.getElementById('menuAccounting').classList.add('active');
        loadAccountingTable();
    }
}

async function loadDashboardStats() {
    const res = await fetch(`${config.apiUrl}?action=getDashboard`);
    const data = await res.json();
    const f = (n) => "Rp " + n.toLocaleString('id-ID');
    document.getElementById("statsHari").innerText = f(data.hari_ini);
    document.getElementById("statsBulan").innerText = f(data.bulan_ini);
    document.getElementById("statsTahun").innerText = f(data.tahun_ini);
    document.getElementById("statsTotal").innerText = f(data.total_omset);
}

/**
 * FIX: LOAD AKUNTANSI DENGAN TOMBOL HAPUS (OWNER ONLY)
 */
async function loadAccountingTable() {
    const tbody = document.getElementById("tableAccountingBody");
    const role = localStorage.getItem("userRole").toLowerCase();
    tbody.innerHTML = "<tr><td colspan='9' class='text-center'>Memuat...</td></tr>";
    
    try {
        const res = await fetch(`${config.apiUrl}?action=getAccounting`);
        const data = await res.json();
        
        tbody.innerHTML = data.map(item => `
            <tr>
                <td><small>${item.tanggal}</small></td>
                <td><strong>${item.no_invoice}</strong></td>
                <td>${item.kasir}</td>
                <td>${item.kode}</td>
                <td>${item.nama}</td>
                <td align="center">${item.qty}</td>
                <td align="right">Rp ${item.harga}</td>
                <td align="right" class="fw-bold">Rp ${item.total}</td>
                <td>
                    ${role === "owner" || role === "admin" ? 
                    `<button class="btn btn-sm btn-danger" onclick="hapusTransaksiUI('${item.no_invoice}')">Hapus</button>` : '-'}
                </td>
            </tr>`).join("");
    } catch (e) { tbody.innerHTML = "<tr><td colspan='9'>Gagal muat.</td></tr>"; }
}

async function hapusTransaksiUI(noInv) {
    if (!confirm(`HAPUS TRANSAKSI ${noInv}?\nStok akan otomatis dikembalikan ke gudang.`)) return;
    try {
        const res = await fetch(`${config.apiUrl}?action=deleteTransaction&no_invoice=${noInv}`);
        const result = await res.json();
        alert(result.message);
        loadAccountingTable();
        loadDashboardStats();
    } catch (e) { alert("Gagal menghapus."); }
}

async function loadInventoryTable() {
    const tbody = document.getElementById("tableBarangBody");
    const res = await fetch(`${config.apiUrl}?action=getBarang`);
    const items = await res.json();
    tbody.innerHTML = items.map((i, idx) => `
        <tr><td>${idx+1}</td><td><strong>${i.kode}</strong></td><td>${i.nama}</td><td>${i.stok} ${i.satuan}</td><td>Rp ${i.harga.toLocaleString()}</td></tr>
    `).join("");
}

function logout() { if(confirm("Keluar?")) { localStorage.clear(); window.location.href="index.html"; } }
