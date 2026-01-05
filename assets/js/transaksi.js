let cart = []; 
let dbBarang = [];

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch(`${config.apiUrl}?action=getBarang`);
        dbBarang = await res.json();
        const sel = document.getElementById("selectBarang");
        sel.innerHTML = '<option value="">-- Pilih Barang --</option>';
        
        dbBarang.forEach(b => {
            const opt = document.createElement("option");
            opt.value = b.kode;
            opt.textContent = `${b.nama} (Stok: ${b.stok})`;
            sel.appendChild(opt);
        });
    } catch (err) {
        console.error("Gagal memuat data barang:", err);
    }
});

function tambahItem() {
    const selVal = document.getElementById("selectBarang").value;
    const b = dbBarang.find(x => x.kode.toString() === selVal.toString());
    const q = parseInt(document.getElementById("qty").value);

    if (!b || !q || q <= 0) return alert("Pilih barang dan jumlah yang valid!");
    
    // Cek apakah barang sudah ada di keranjang
    const existing = cart.find(i => i.kode === b.kode);
    if (existing) {
        existing.qty += q;
    } else {
        cart.push({ ...b, qty: q });
    }
    
    render();
    document.getElementById("qty").value = 1; // Reset qty input
}

function render() {
    const body = document.getElementById("cartBody"); 
    body.innerHTML = ""; 
    let total = 0;

    cart.forEach((i, idx) => { 
        const subtotal = i.qty * i.harga;
        total += subtotal;
        body.innerHTML += `
            <tr>
                <td>${i.nama}</td>
                <td>${i.qty}</td>
                <td>Rp ${subtotal.toLocaleString('id-ID')}</td>
                <td><button class="btn btn-sm btn-danger" onclick="cart.splice(${idx},1);render()">X</button></td>
            </tr>`;
    });
    
    document.getElementById("grandTotal").innerText = "Total: Rp " + total.toLocaleString('id-ID');
}

async function simpanTransaksi() {
    const no = document.getElementById("noInvManual").value;
    const btn = document.getElementById("btnSimpan");

    if (!no || cart.length === 0) return alert("Nomor Invoice dan Barang tidak boleh kosong!");
    
    // Mencegah double click
    btn.disabled = true;
    btn.innerText = "Menyimpan...";

    const payload = { 
        no_invoice: no, 
        kasir: localStorage.getItem("username"), 
        customer: document.getElementById("customer").value || "Umum", 
        alamat: document.getElementById("alamat").value || "-", 
        total: cart.reduce((s, i) => s + (i.qty * i.harga), 0), 
        items: cart 
    };

    try {
        const res = await fetch(`${config.apiUrl}?action=simpanPenjualan`, { 
            method: "POST", 
            body: JSON.stringify(payload) 
        });
        const result = await res.json();
        
        if (result.status === "success") {
            btn.style.display = "none";
            document.getElementById("printSection").style.display = "block";
            document.getElementById("btnInv").onclick = () => window.open(`invoice-print.html?no_invoice=${no}`, '_blank');
            document.getElementById("btnSj").onclick = () => window.open(`surat-jalan-print.html?no_invoice=${no}`, '_blank');
            alert("Transaksi Berhasil Disimpan!");
        } else {
            throw new Error(result.message);
        }
    } catch (e) {
        alert("Gagal Simpan: " + e.message);
        btn.disabled = false;
        btn.innerText = "Simpan Transaksi";
    }
}
