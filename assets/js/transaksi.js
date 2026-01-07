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
            opt.textContent = `${b.nama} (Stok: ${b.stok}) - Rp ${b.harga.toLocaleString()}`;
            sel.appendChild(opt);
        });
    } catch (err) { console.error("Gagal memuat barang", err); }
});

function tambahItem() {
    const selVal = document.getElementById("selectBarang").value;
    const b = dbBarang.find(x => x.kode.toString() === selVal.toString());
    const q = parseInt(document.getElementById("qty").value);
    if (!b || !q || q <= 0) return alert("Pilih barang dan jumlah!");

    cart.push({ ...b, qty: q, harga_jual: b.harga });
    render();
    document.getElementById("qty").value = "1";
}

function updateHargaCart(idx, newPrice) {
    cart[idx].harga_jual = parseInt(newPrice) || 0;
    render(false);
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
                    <td><input type="number" class="form-control" value="${i.harga_jual}" onchange="updateHargaCart(${idx}, this.value)" style="width: 140px;"></td>
                    <td>Rp ${subtotal.toLocaleString('id-ID')}</td>
                    <td><button class="btn btn-sm btn-danger" onclick="cart.splice(${idx},1);render()">X</button></td>
                </tr>`;
        }
    });
    document.getElementById("grandTotal").innerText = "Total: Rp " + total.toLocaleString('id-ID');
}

async function simpanTransaksi() {
    const no = document.getElementById("noInvManual").value;
    const telp = document.getElementById("telepon").value; // Ambil No HP dari UI
    const btn = document.getElementById("btnSimpan");

    if (!no || cart.length === 0) return alert("Lengkapi data No Invoice & Keranjang!");
    
    // Tanda proses sedang berjalan
    btn.disabled = true;
    btn.innerText = "SEDANG MENYIMPAN... MOHON TUNGGU";

    const payload = { 
        no_invoice: no, 
        kasir: localStorage.getItem("username"), 
        customer: document.getElementById("customer").value || "Umum", 
        alamat: document.getElementById("alamat").value || "-", 
        telepon: telp || "-", 
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
            btn.innerText = "BERHASIL DISIMPAN!";
            setTimeout(() => {
                btn.style.display = "none";
                document.getElementById("printSection").style.display = "block";
                document.getElementById("btnInv").onclick = () => window.open(`invoice-print.html?no_invoice=${no}`, '_blank');
                document.getElementById("btnSj").onclick = () => window.open(`surat-jalan-print.html?no_invoice=${no}`, '_blank');
            }, 1000);
        } else {
            alert("Gagal menyimpan: " + result.message);
            btn.disabled = false;
            btn.innerText = "SIMPAN & PROSES TRANSAKSI";
        }
    } catch (e) { 
        alert("Koneksi bermasalah!"); 
        btn.disabled = false;
        btn.innerText = "SIMPAN & PROSES TRANSAKSI";
    }
}
