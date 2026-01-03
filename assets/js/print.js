// assets/js/print.js
async function loadPrintData() {
    const params = new URLSearchParams(window.location.search);
    const noInv = params.get("no_invoice");
    if (!noInv) return alert("Nomor Invoice tidak ditemukan!");

    try {
        const res = await fetch(`${config.apiUrl}?action=getInvoice&no_invoice=${noInv}`);
        const data = await res.json();
        
        if (!data.header) {
            alert("Data Transaksi " + noInv + " tidak ditemukan!");
            return;
        }

        // --- MAPPING UNTUK INVOICE ---
        if (document.getElementById("p_no")) {
            document.getElementById("p_no").innerText = data.header[0];
            document.getElementById("p_tgl").innerText = data.header[1];
            document.getElementById("p_ksr").innerText = data.header[4];
            document.getElementById("p_cust").innerText = data.header[2];
            document.getElementById("p_alm").innerText = data.header[3];
            
            let html = "";
            data.items.forEach((item, idx) => {
                html += `<tr>
                    <td align="center">${idx + 1}</td>
                    <td>${item[4]}</td>
                    <td align="center">${item[5]} (PCS)</td>
                    <td align="right">${Number(item[6]).toLocaleString()}</td>
                    <td align="right">${Number(item[7]).toLocaleString()}</td>
                </tr>`;
            });
            document.getElementById("p_items").innerHTML = html;
            document.getElementById("p_grand").innerText = "Rp. " + Number(data.header[5]).toLocaleString();
        }

        // --- MAPPING UNTUK SURAT JALAN ---
        if (document.getElementById("sj_no")) {
            document.getElementById("sj_no").innerText = data.header[0];
            document.getElementById("sj_tgl").innerText = data.header[1];
            document.getElementById("sj_ksr").innerText = data.header[4];
            document.getElementById("sj_cust").innerText = data.header[2];
            document.getElementById("sj_alm").innerText = data.header[3];
            
            let html = "";
            data.items.forEach((item, idx) => {
                html += `<tr>
                    <td align="center">${idx + 1}</td>
                    <td>${item[4]}</td>
                    <td align="center">PCS</td>
                    <td align="center">${item[5]}</td>
                </tr>`;
            });
            document.getElementById("sj_items").innerHTML = html;
        }

        // Beri jeda 1 detik agar browser selesai merender data, lalu print
        setTimeout(() => { window.print(); }, 1000);

    } catch (e) {
        console.error("Gagal muat data cetak:", e);
    }
}