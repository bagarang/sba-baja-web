document.addEventListener("DOMContentLoaded", function() {
    checkAccess();
    displayUserProfile();
    
    const role = localStorage.getItem("userRole");
    const statsContainer = document.querySelector(".stats-grid");

    if (role === "kasir") {
        // Jika kasir, sembunyikan kotak statistik
        if (statsContainer) statsContainer.style.display = "none";
        document.querySelector(".header-title h1").innerText = "Menu Kasir - SBA BAJA";
    } else {
        // Jika admin, muat statistik
        loadDashboardStats();
    }
    
    loadInventoryTable();
});

function checkAccess() {
    if (localStorage.getItem("isLoggedIn") !== "true") {
        window.location.href = "index.html";
    }
}

function displayUserProfile() {
    document.getElementById("userDisplay").innerText = localStorage.getItem("username");
    const role = localStorage.getItem("userRole");
    const badge = document.getElementById("roleDisplay");
    badge.innerText = role.toUpperCase();
    badge.className = "badge " + (role === "owner" ? "btn-accent" : "btn-primary");
}

async function loadDashboardStats() {
    try {
        const response = await fetch(`${config.apiUrl}?action=getDashboard`);
        const data = await response.json();

        const formatRp = (num) => new Intl.NumberFormat("id-ID", {
            style: "currency", currency: "IDR", minimumFractionDigits: 0
        }).format(num);

        document.getElementById("statsHari").innerText = formatRp(data.hari_ini);
        document.getElementById("statsBulan").innerText = formatRp(data.bulan_ini);
        document.getElementById("statsTahun").innerText = formatRp(data.tahun_ini);
        document.getElementById("statsTotal").innerText = formatRp(data.total_omset);
    } catch (e) {
        console.error("Gagal load stats:", e);
    }
}

async function loadInventoryTable() {
    const tableBody = document.getElementById("tableBarangBody");
    try {
        const response = await fetch(`${config.apiUrl}?action=getBarang`);
        const items = await response.json();
        tableBody.innerHTML = "";
        items.forEach((item, index) => {
            tableBody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${item.kode}</strong></td>
                    <td>${item.nama}</td>
                    <td>${item.stok} ${item.satuan}</td>
                    <td>Rp ${item.harga.toLocaleString('id-ID')}</td>
                </tr>`;
        });
    } catch (e) {
        tableBody.innerHTML = "<tr><td colspan='5'>Gagal memuat data.</td></tr>";
    }
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