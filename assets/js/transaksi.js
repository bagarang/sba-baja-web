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
            // Menampilkan harga original di pilihan barang
            opt.textContent = `${b.nama} (Stok: ${b.stok}) - Rp ${b.harga.toLocaleString()}`;
            sel.appendChild(opt);
        });
    } catch (err) { console.error("Load barang failed", err); }
});

function tambahItem() {
    const selVal = document.getElementById("selectBarang").value;
    const b = dbBarang.find(x => x.kode.toString() === selVal.toString());
    const q = parseInt(document.getElementById("qty").value);

    if (!b || !q || q <= 0) return alert("Pilih barang dan jumlah!");

    // Simpan harga_jual awal sama dengan harga original
    cart.push({ ...b, qty: q, harga_jual: b.harga });
    render();
}

/**
 * Fungsi untuk mengupdate harga barang di keranjang
 */
function updateHargaCart(idx, newPrice) {
    cart[idx].harga_jual = parseInt(newPrice) || 0;
    render(false); // Render ulang tanpa mengganggu fokus input
}

function render(rebuild = true) {
    const body = document.getElementById("cartBody"); 
    if(rebuild) body.innerHTML = ""; 
    let total = 0;

    cart.forEach((i, idx) => { 
        const subtotal = i.qty * i.harga_jual;
        total += subtotal;
        
        if(rebuild) {
            body.innerHTML += `
                <tr>
                    <td>${i.nama}</td>
                    <td>${i.qty}</td>
                    <td>
                        <input type="number" class="form-control form-sm" 
                               value="${i.harga_jual}" 
                               onchange="updateHargaCart(${idx}, this.value)" 
                               style="width: 120px;">
                    </td>
                    <td>Rp ${subtotal.toLocaleString('id-ID')}</td>
                    <td><button class="btn btn-sm btn-danger" onclick="cart.splice(${idx},1);render()">X</button></td>
                </tr>`;
        }
    });
    document.getElementById("grandTotal").innerText = "Total: Rp " + total.toLocaleString('id-ID');
}

async function simpanTransaksi() {
    const no = document.getElementById("noInvManual").value;
    const btn = document.getElementById("btnSimpan");

    if (!no || cart.length === 0) return alert("Nomor Invoice dan Barang wajib diisi!");
    
    btn.disabled = true;
    btn.innerText = "Proses...";

    const payload = { 
        no_invoice: no, 
        kasir: localStorage.getItem("username"), 
        customer: document.getElementById("customer").value || "Umum", 
        alamat: document.getElementById("alamat").value || "-", 
        telepon: document.getElementById("telepon").value || "-", // Input No HP Baru
        total: cart.reduce((s, i) => s + (i.qty * i.harga_jual), 0), 
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
        }
    } catch (e) {
        alert("Gagal Simpan");
        btn.disabled = false;
    }
}
