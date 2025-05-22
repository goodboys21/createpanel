export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

  const domain = 'https://privat.otwbosmuda.web.id';
  const apikey = 'ptla_0RT7eiZh2VZVjHcMAMhD3SlYynsEU03iX3yf3iNhj5U';

  try {
    // Ambil semua server
    const serversRes = await fetch(`${domain}/api/application/servers`, {
      headers: {
        'Authorization': `Bearer ${apikey}`,
        'Accept': 'application/json',
      }
    });
    const serversData = await serversRes.json();
    const servers = serversData.data;

    const now = new Date();

    for (let server of servers) {
      const updatedAt = new Date(server.attributes.updated_at);
      const diffMs = now - updatedAt;
      const diffHours = diffMs / 1000 / 60 / 60;

      // Jika tidak aktif selama >5 jam
      if (diffHours >= 5) {
        const deleteRes = await fetch(`${domain}/api/application/servers/${server.attributes.id}/force`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${apikey}`,
            'Accept': 'application/json'
          }
        });
        if (!deleteRes.ok) {
          console.error(`Gagal hapus server ${server.attributes.name}`);
        }
      }
    }

    res.status(200).send('✅ Pemeriksaan selesai. Panel tidak aktif selama 5 jam telah dihapus.');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Gagal memeriksa panel: ' + err.message);
  }
}
