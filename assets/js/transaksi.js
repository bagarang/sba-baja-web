let cart = []; let dbBarang = [];
document.addEventListener("DOMContentLoaded", async () => {
    const res = await fetch(`${config.apiUrl}?action=getBarang`);
    dbBarang = await res.json();
    const sel = document.getElementById("selectBarang");
    sel.innerHTML = '<option value="">-- Pilih Barang --</option>';
    dbBarang.forEach(b => sel.innerHTML += `<option value="${b.kode}">${b.nama} (Stok: ${b.stok})</option>`);
});
function tambahItem() {
    const sel = document.getElementById("selectBarang").value;
    const b = dbBarang.find(x => x.kode === sel);
    const q = parseInt(document.getElementById("qty").value);
    if (!b || !q || q <= 0) return alert("Pilih barang dan jumlah!");
    cart.push({ ...b, qty: q }); render();
}
function render() {
    const body = document.getElementById("cartBody"); body.innerHTML = ""; let total = 0;
    cart.forEach((i, idx) => { total += i.qty * i.harga;
        body.innerHTML += `<tr><td>${i.nama}</td><td>${i.qty}</td><td>Rp ${(i.qty * i.harga).toLocaleString()}</td><td><button onclick="cart.splice(${idx},1);render()">X</button></td></tr>`;
    });
    document.getElementById("grandTotal").innerText = "Total: Rp " + total.toLocaleString();
}
async function simpanTransaksi() {
    const no = document.getElementById("noInvManual").value;
    if (!no || cart.length === 0) return alert("No Invoice & Barang wajib diisi!");
    const payload = { no_invoice: no, kasir: localStorage.getItem("username"), customer: document.getElementById("customer").value || "Umum", alamat: document.getElementById("alamat").value || "-", total: cart.reduce((s, i) => s + (i.qty * i.harga), 0), items: cart };
    const res = await fetch(`${config.apiUrl}?action=simpanPenjualan`, { method: "POST", body: JSON.stringify(payload) });
    const result = await res.json();
    if (result.status === "success") {
        document.getElementById("btnSimpan").style.display = "none";
        document.getElementById("printSection").style.display = "block";
        document.getElementById("btnInv").onclick = () => window.open(`invoice-print.html?no_invoice=${no}`, '_blank');
        document.getElementById("btnSj").onclick = () => window.open(`surat-jalan-print.html?no_invoice=${no}`, '_blank');
    }
}