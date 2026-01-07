async function loadPrintData() {
    const params = new URLSearchParams(window.location.search);
    const noInv = params.get("no_invoice");

    if (!noInv) return alert("Nomor Invoice tidak ditemukan!");

    try {
        const response = await fetch(`${config.apiUrl}?action=getInvoice&no_invoice=${noInv}`);
        const data = await response.json();

        if (data.status === "error") return alert(data.message);

        // DATA HEADER: [NoInv, Tgl, Cust, Alm, HP, Ksr, Total]
        const h = data.header;

        // Populate Invoice Fields
        if (document.getElementById("p_no")) {
            document.getElementById("p_tgl").innerText = h[1];
            document.getElementById("p_no").innerText = h[0];
            document.getElementById("p_ksr").innerText = h[5];
            document.getElementById("p_cust").innerText = h[2];
            document.getElementById("p_alm").innerText = h[3];
            document.getElementById("p_hp").innerText = h[4]; // No HP Konsumen
            document.getElementById("p_grand").innerText = "Rp " + parseInt(h[6]).toLocaleString('id-ID');

            const itemBody = document.getElementById("p_items");
            itemBody.innerHTML = data.items.map((item, index) => `
                <tr>
                    <td align="center">${index + 1}</td>
                    <td>${item[4]}</td>
                    <td align="center">${item[5]}</td>
                    <td align="right">${parseInt(item[6]).toLocaleString('id-ID')}</td>
                    <td align="right">${parseInt(item[7]).toLocaleString('id-ID')}</td>
                </tr>
            `).join("");
        }

        // Populate Surat Jalan Fields
        if (document.getElementById("sj_no")) {
            document.getElementById("sj_tgl").innerText = h[1];
            document.getElementById("sj_no").innerText = h[0];
            document.getElementById("sj_ksr").innerText = h[5];
            document.getElementById("sj_cust").innerText = h[2];
            document.getElementById("sj_alm").innerText = h[3];
            document.getElementById("sj_hp").innerText = h[4]; // No HP Konsumen

            const sjBody = document.getElementById("sj_items");
            sjBody.innerHTML = data.items.map((item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td align="left">${item[4]}</td>
                    <td>${item[5]}</td>
                </tr>
            `).join("");
        }

    } catch (e) {
        alert("Gagal memuat data cetak!");
        console.error(e);
    }
}
