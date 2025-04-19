export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { username, email, ram } = req.body;
  if (!username || !email || !ram) {
    return res.status(400).json({ message: 'Data tidak lengkap.' });
  }

  // Data konfigurasi paket
  const paket = {
    "1gb": { ram: 1000, disk: 1000, cpu: 40, harga: 1000 },
    "2gb": { ram: 2000, disk: 1000, cpu: 60, harga: 2000 },
    "3gb": { ram: 3000, disk: 2000, cpu: 80, harga: 3000 },
    "4gb": { ram: 4000, disk: 2000, cpu: 100, harga: 4000 },
    "5gb": { ram: 5000, disk: 3000, cpu: 120, harga: 5000 },
    "6gb": { ram: 6000, disk: 3000, cpu: 140, harga: 6000 },
    "7gb": { ram: 7000, disk: 4000, cpu: 160, harga: 7000 },
    "8gb": { ram: 8000, disk: 4000, cpu: 180, harga: 8000 },
    "9gb": { ram: 9000, disk: 5000, cpu: 200, harga: 9000 },
    "10gb": { ram: 10000, disk: 5000, cpu: 220, harga: 10000 },
    "unli": { ram: 0, disk: 0, cpu: 0, harga: 11000 },
    "unlimited": { ram: 0, disk: 0, cpu: 0, harga: 11000 }
  };

  const paketDipilih = paket[ram.toLowerCase()];
  if (!paketDipilih) return res.status(400).json({ message: 'Paket tidak valid.' });

  // Tambahkan angka random untuk ID unik (50–350)
  const random = Math.floor(Math.random() * 301) + 50;
  const totalHarga = paketDipilih.harga + random;

  const codeqr = `00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214057125036591790303UMI51440014ID.CO.QRIS.WWW0215ID20232646203860303UMI5204481253033605802ID5918GOODFM21 OK11756396008MINAHASA61059537162070703A016304D7A6`;

  try {
    const fetchRes = await fetch(`https://restapi-v2.simplebot.my.id/orderkuota/createpayment?apikey=new2025&amount=${totalHarga}&codeqr=${encodeURIComponent(codeqr)}`);
    const json = await fetchRes.json();

    if (!json.status || !json.result) {
      return res.status(500).json({ message: 'Gagal membuat QRIS' });
    }

    return res.status(200).json({
      status: 'WAITING_PAYMENT',
      qris: json.result.imageqris.url,
      keyorkut: json.result.idtransaksi,
      detail: {
        username,
        email,
        ram: paketDipilih.ram,
        disk: paketDipilih.disk,
        cpu: paketDipilih.cpu,
        harga: paketDipilih.harga,
        total: totalHarga,
        kodeUnik: random
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server Error', error: err.message });
  }
}
