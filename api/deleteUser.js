export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

  const domain = 'https://privat.otwbosmuda.web.id';
  const apikey = 'ptla_0RT7eiZh2VZVjHcMAMhD3SlYynsEU03iX3yf3iNhj5U';

  try {
    // Ambil semua server untuk dapetin user yang aktif
    const serversRes = await fetch(`${domain}/api/application/servers`, {
      headers: {
        'Authorization': `Bearer ${apikey}`,
        'Accept': 'application/json',
      }
    });
    const serversData = await serversRes.json();
    const servers = serversData.data;

    // Buat set user ID yang masih punya server
    const activeUserIds = new Set(servers.map(s => s.attributes.user));

    // Ambil semua user
    const usersRes = await fetch(`${domain}/api/application/users`, {
      headers: {
        'Authorization': `Bearer ${apikey}`,
        'Accept': 'application/json',
      }
    });
    const usersData = await usersRes.json();
    const users = usersData.data;

    // Hapus user yang gak ada di activeUserIds
    for (let user of users) {
      const userId = user.attributes.id;
      if (!activeUserIds.has(userId)) {
        const deleteUserRes = await fetch(`${domain}/api/application/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${apikey}`,
            'Accept': 'application/json'
          }
        });

        if (!deleteUserRes.ok) {
          console.error(`Gagal hapus user ${user.attributes.username}`);
        } else {
          console.log(`User ${user.attributes.username} dihapus karena tidak punya server`);
        }
      }
    }

    res.status(200).send('✅ Semua user tanpa server berhasil dihapus!');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Error: ' + err.message);
  }
}
