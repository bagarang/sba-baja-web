document.addEventListener("DOMContentLoaded", function() {
    checkAccess();
    displayUserProfile();
    
    const role = localStorage.getItem("userRole");
    const statsContainer = document.querySelector(".stats-grid");

    if (role === "kasir") {
        if (statsContainer) statsContainer.style.display = "none";
        document.querySelector(".header-title h1").innerText = "Menu Kasir - SBA BAJA";
    } else {
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
    } catch (e) {
        console.error("Gagal memuat statistik dashboard:", e);
    }
}

async function loadInventoryTable() {
    const tableBody = document.getElementById("tableBarangBody");
    if (!tableBody) return;

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
        
    } catch (e) {
        tableBody.innerHTML = "<tr><td colspan='5'>Gagal memuat data stok.</td></tr>";
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
