document.addEventListener("DOMContentLoaded", function() {
    checkAccess();
    
    // Ambil role dari localStorage
    const role = localStorage.getItem("userRole") ? localStorage.getItem("userRole").toLowerCase() : "kasir";
    
    displayUserProfile(role);

    // LOGIKA PEMBATASAN AKSES (BUG FIX)
    if (role === "kasir") {
        // 1. Sembunyikan menu Akuntansi di sidebar
        const menuAcc = document.getElementById("menuAccounting");
        if (menuAcc) menuAcc.style.display = "none";

        // 2. Sembunyikan statistik omset uang
        const statsGrid = document.getElementById("statsGrid");
        if (statsGrid) statsGrid.style.display = "none";

        // 3. Ubah judul agar tidak membingungkan
        document.getElementById("mainTitle").innerText = "Daftar Stok Barang";
    } else {
        // Jika Admin/Owner, muat statistik omset
        loadDashboardStats();
    }
    
    // Semua role bisa melihat tabel stok
    loadInventoryTable();
});

function checkAccess() {
    if (localStorage.getItem("isLoggedIn") !== "true") {
        window.location.href = "index.html";
    }
}

function displayUserProfile(role) {
    const userDisplay = document.getElementById("userDisplay");
    const roleDisplay = document.getElementById("roleDisplay");
    
    if (userDisplay) userDisplay.innerText = localStorage.getItem("username") || "User";
    
    if (roleDisplay) {
        roleDisplay.innerText = role.toUpperCase();
        roleDisplay.className = "badge " + (role === "owner" || role === "admin" ? "btn-accent" : "btn-primary");
    }
}

/**
 * LOGIKA PERPINDAHAN MENU
 */
function switchView(viewName) {
    const role = localStorage.getItem("userRole").toLowerCase();
    
    // Keamanan tambahan: Kasir tidak boleh bisa switch ke accounting via console
    if (viewName === 'accounting' && role === 'kasir') {
        alert("Akses Ditolak: Hanya untuk Admin.");
        return;
    }

    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-menu li').forEach(l => l.classList.remove('active'));

    if (viewName === 'dashboard') {
        document.getElementById('sectionDashboard').classList.add('active');
        document.getElementById('menuDashboard').classList.add('active');
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
    } catch (e) { tableBody.innerHTML = "<tr><td colspan='5'>Gagal load data stok.</td></tr>"; }
}

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
