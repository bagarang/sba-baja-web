/**
 * SBA BAJA SYSTEM - Dashboard Logic
 * Managed by Lyra AI Prompt Optimizer
 */

document.addEventListener("DOMContentLoaded", function() {
    // 1. Validasi Akses
    checkAccess();
    
    // 2. Inisialisasi Profil & Role
    const role = localStorage.getItem("userRole") ? localStorage.getItem("userRole").toLowerCase() : "kasir";
    displayUserProfile(role);

    // 3. Kontrol Akses Berdasarkan Role (Bug Fix)
    if (role === "kasir") {
        // Sembunyikan elemen sensitif finansial untuk Kasir
        const menuAcc = document.getElementById("menuAccounting");
        if (menuAcc) menuAcc.style.display = "none";

        const statsGrid = document.getElementById("statsGrid");
        if (statsGrid) statsGrid.style.display = "none";

        // Ubah judul dashboard agar sesuai konteks kasir
        const mainTitle = document.getElementById("mainTitle");
        if (mainTitle) mainTitle.innerText = "Daftar Stok Barang";
    } else {
        // Jika Admin/Owner, muat statistik omset uang
        loadDashboardStats();
    }
    
    // 4. Muat data tabel stok (Bisa dilihat semua role)
    loadInventoryTable();
});

/**
 * Validasi apakah user sudah login
 */
function checkAccess() {
    if (localStorage.getItem("isLoggedIn") !== "true") {
        window.location.href = "index.html";
    }
}

/**
 * Menampilkan nama user dan lencana role di sidebar
 */
function displayUserProfile(role) {
    const userDisplay = document.getElementById("userDisplay");
    const roleDisplay = document.getElementById("roleDisplay");
    
    if (userDisplay) userDisplay.innerText = localStorage.getItem("username") || "User";
    
    if (roleDisplay) {
        roleDisplay.innerText = role.toUpperCase();
        // Warna badge: Gold untuk owner/admin, Biru untuk kasir
        roleDisplay.className = "badge " + (role === "owner" || role === "admin" ? "btn-accent" : "btn-primary");
    }
}

/**
 * Logika Perpindahan Halaman (Dashboard vs Akuntansi)
 */
function switchView(viewName) {
    const role = localStorage.getItem("userRole").toLowerCase();
    
    // Proteksi Keamanan: Cegah Kasir masuk ke view Akuntansi
    if (viewName === 'accounting' && role === 'kasir') {
        alert("Akses Ditolak: Area ini hanya untuk Admin/Owner.");
        return;
    }

    // Reset status aktif pada menu dan section
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-menu li').forEach(l => l.classList.remove('active'));

    // Aktifkan section yang dipilih
    if (viewName === 'dashboard') {
        document.getElementById('sectionDashboard').classList.add('active');
        document.getElementById('menuDashboard').classList.add('active');
    } else if (viewName === 'accounting') {
        document.getElementById('sectionAccounting').classList.add('active');
        document.getElementById('menuAccounting').classList.add('active');
        // Muat data akuntansi hanya saat tab dibuka (efisiensi data)
        loadAccountingTable();
    }
}

/**
 * Mengambil Data Statistik Omset (Khusus Admin)
 */
async function loadDashboardStats() {
    try {
        const response = await fetch(`${config.apiUrl}?action=getDashboard`);
        const data = await response.json();
        
        const formatRp = (num) => "Rp " + num.toLocaleString('id-ID');
        
        document.getElementById("statsHari").innerText = formatRp(data.hari_ini || 0);
        document.getElementById("statsBulan").innerText = formatRp(data.bulan_ini || 0);
        document.getElementById("statsTahun").innerText = formatRp(data.tahun_ini || 0);
        document.getElementById("statsTotal").innerText = formatRp(data.total_omset || 0);
    } catch (e) {
        console.error("Gagal memuat statistik:", e);
    }
}

/**
 * Mengambil Data Stok Barang (Dengan pembulatan 2 desimal)
 */
async function loadInventoryTable() {
    const tableBody = document.getElementById("tableBarangBody");
    if (!tableBody) return;

    try {
        const response = await fetch(`${config.apiUrl}?action=getBarang`);
        const items = await response.json();
        
        tableBody.innerHTML = items.map((item, index) => {
            // Memastikan stok tampil 2 angka di belakang koma jika desimal
            const stokFormatted = Number.isInteger(item.stok) ? item.stok : parseFloat(item.stok).toFixed(2);
            
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${item.kode}</strong></td>
                    <td>${item.nama}</td>
                    <td>${stokFormatted} ${item.satuan}</td>
                    <td>Rp ${item.harga.toLocaleString('id-ID')}</td>
                </tr>
            `;
        }).join("");
        
    } catch (e) {
        tableBody.innerHTML = "<tr><td colspan='5' class='text-center'>Gagal memuat data stok.</td></tr>";
    }
}

/**
 * Mengambil Riwayat Penjualan Lengkap (Akuntansi)
 */
async function loadAccountingTable() {
    const tableBody = document.getElementById("tableAccountingBody");
    if (!tableBody) return;

    tableBody.innerHTML = "<tr><td colspan='8' class='text-center'>Memuat data transaksi...</td></tr>";
    
    try {
        const response = await fetch(`${config.apiUrl}?action=getAccounting`);
        const data = await response.json();
        
        if (data.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='8' class='text-center'>Belum ada transaksi tercatat.</td></tr>";
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
            </tr>
        `).join("");
    } catch (e) {
        console.error("Error Akuntansi:", e);
        tableBody.innerHTML = "<tr><td colspan='8' class='text-danger text-center'>Gagal memuat data akuntansi. Pastikan doGet sudah di-deploy ulang.</td></tr>";
    }
}

/**
 * Fitur Pencarian di Tabel Stok
 */
function filterTable() {
    const filter = document.getElementById("searchBarang").value.toUpperCase();
    const rows = document.querySelectorAll("#tableBarangBody tr");
    
    rows.forEach(row => {
        const text = row.innerText.toUpperCase();
        row.style.display = text.includes(filter) ? "" : "none";
    });
}

/**
 * Keluar dari sistem
 */
function logout() {
    const konfirmasi = confirm("Apakah Anda yakin ingin keluar?");
    if (konfirmasi) {
        localStorage.clear();
        window.location.href = "index.html";
    }
}
