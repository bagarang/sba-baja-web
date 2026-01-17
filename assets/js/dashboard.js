/**
 * DASHBOARD LOGIC - SBA BAJA SYSTEM
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

async function loadAccountingTable() {
    const tbody = document.getElementById("tableAccountingBody");
    const role = localStorage.getItem("userRole").toLowerCase();
    tbody.innerHTML = "<tr><td colspan='9' class='text-center'>Memuat riwayat transaksi...</td></tr>";
    
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
                <td align="right" class="fw-bold text-success">Rp ${item.total}</td>
                <td>
                    ${role === "owner" || role === "admin" ? 
                    `<button class="btn btn-sm btn-danger" onclick="hapusTransaksiUI('${item.no_invoice}')">Hapus</button>` : '-'}
                </td>
            </tr>`).join("");
    } catch (e) { tbody.innerHTML = "<tr><td colspan='9'>Gagal muat akuntansi.</td></tr>"; }
}

async function hapusTransaksiUI(noInv) {
    if (!confirm(`Yakin Hapus Invoice ${noInv}?\nStok akan dikembalikan otomatis ke tab barang.`)) return;
    try {
        const res = await fetch(`${config.apiUrl}?action=deleteTransaction&no_invoice=${noInv}`);
        const result = await res.json();
        alert(result.message);
        loadAccountingTable();
        loadDashboardStats();
    } catch (e) { alert("Terjadi kesalahan jaringan."); }
}

async function loadInventoryTable() {
    const tbody = document.getElementById("tableBarangBody");
    const res = await fetch(`${config.apiUrl}?action=getBarang`);
    const items = await res.json();
    tbody.innerHTML = items.map((i, idx) => `
        <tr><td>${idx+1}</td><td><strong>${i.kode}</strong></td><td>${i.nama}</td><td>${i.stok} ${i.satuan}</td><td>Rp ${i.harga.toLocaleString()}</td></tr>
    `).join("");
}

function filterTable() {
    const f = document.getElementById("searchBarang").value.toUpperCase();
    document.querySelectorAll("#tableBarangBody tr").forEach(r => r.style.display = r.innerText.toUpperCase().includes(f) ? "" : "none");
}

/**
 * FUNGSI FILTER AKUNTANSI - UNTUK AUDIT
 */
function filterAccounting() {
    const filter = document.getElementById("searchAccounting").value.toUpperCase();
    const rows = document.querySelectorAll("#tableAccountingBody tr");

    rows.forEach(row => {
        const cells = row.getElementsByTagName("td");
        if (cells.length > 1) {
            const tanggalText = cells[0].innerText.toUpperCase(); // Kolom Tanggal
            const invoiceText = cells[1].innerText.toUpperCase(); // Kolom No Invoice
            
            // Tampilkan baris jika cocok dengan Tanggal atau No Invoice
            if (tanggalText.includes(filter) || invoiceText.includes(filter)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        }
    });
}

function logout() { if(confirm("Keluar?")) { localStorage.clear(); window.location.href="index.html"; } }
