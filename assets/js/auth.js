async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const msg = document.getElementById("msg");

  if (!username || !password) {
    msg.innerHTML = "Username dan password wajib diisi!";
    msg.style.color = "red";
    return;
  }

  msg.innerHTML = "⌛ Sedang memproses login...";
  msg.style.color = "blue";

  // Gunakan URLSearchParams agar karakter khusus (seperti spasi) aman dikirim
  const params = new URLSearchParams({
    action: "login",
    username: username,
    password: password
  });

  const url = `${config.apiUrl}?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // SINKRONISASI: Kita gunakan "success" sesuai script GAS terbaru
    if (data.status === "success") {
      msg.innerHTML = "✅ Login Berhasil! Mengalihkan...";
      msg.style.color = "green";

      // Simpan data user ke browser agar bisa dipakai di halaman dashboard
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("username", data.username);

      // Pindah ke halaman dashboard setelah 1 detik
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1200);

    } else {
      msg.innerHTML = "❌ " + (data.message || "Login Gagal!");
      msg.style.color = "red";
    }
  } catch (error) {
    console.error("Error:", error);
    msg.innerHTML = "⚠️ Tidak dapat terkoneksi ke server. Pastikan internet aktif.";
    msg.style.color = "red";
  }
}