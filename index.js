import { useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState('');
  const [qris, setQris] = useState('');
  const [idTrans, setIdTrans] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const res = await fetch('/api/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (result.status === 'WAITING_PAYMENT') {
      setQris(result.qris);
      setStatus('Silakan scan QRIS dan tunggu konfirmasi pembayaran...');
      setIdTrans(result.keyorkut);

      const interval = setInterval(async () => {
        const check = await fetch(`/api/checkstatus?id=${result.keyorkut}`);
        const checkRes = await check.json();
        if (checkRes.status === 'PAID') {
          clearInterval(interval);
          setStatus('Pembayaran diterima! Panel sedang dibuat...');
          // Lanjut ke proses pembuatan panel di sini (jika mau)
        }
      }, 3000);
    } else {
      setStatus(result.message);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: 20 }}>
      <h2>Top-Up Panel</h2>
      <form id="panelForm" onSubmit={handleSubmit}>
        <label>Username:</label>
        <input name="username" required className="input" />
        <label>Email:</label>
        <input name="email" type="email" required className="input" />
        <label>RAM:</label>
        <select name="ram" required className="input">
          <option value="1gb">1 GB</option>
          <option value="2gb">2 GB</option>
          <option value="3gb">3 GB</option>
          <option value="4gb">4 GB</option>
        </select>
        <button type="submit" style={{ marginTop: 10 }}>Bayar Sekarang</button>
      </form>

      {qris && (
        <div style={{ marginTop: 20 }}>
          <img src={qris} alt="QRIS" width={300} />
        </div>
      )}
      {status && <p>{status}</p>}
    </div>
  );
}
