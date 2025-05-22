export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

  const domain = 'https://privat.otwbosmuda.web.id';
  const apikey = 'ptla_0RT7eiZh2VZVjHcMAMhD3SlYynsEU03iX3yf3iNhj5U';

  try {
    const now = new Date();

    // Step 1: Ambil dan hapus server yang tidak aktif > 5 jam
    const serversRes = await fetch(`${domain}/api/application/servers`, {
      headers: {
        'Authorization': `Bearer ${apikey}`,
        'Accept': 'application/json',
      }
    });
    const serversData = await serversRes.json();
    const servers = serversData.data;

    for (let server of servers) {
      const updatedAt = new Date(server.attributes.updated_at);
      const diffMs = now - updatedAt;
      const diffHours = diffMs / 1000 / 60 / 60;

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
        } else {
          console.log(`Server ${server.attributes.name} dihapus karena tidak aktif`);
        }
      }
    }

    // Step 2: Ambil ulang semua server setelah penghapusan
    const updatedServersRes = await fetch(`${domain}/api/application/servers`, {
      headers: {
        'Authorization': `Bearer ${apikey}`,
        'Accept': 'application/json',
      }
    });
    const updatedServersData = await updatedServersRes.json();
    const updatedServers = updatedServersData.data;

    // Buat set user yang masih punya server
    const activeUserIds = new Set(updatedServers.map(s => s.attributes.user));

    // Ambil semua user
    const usersRes = await fetch(`${domain}/api/application/users`, {
      headers: {
        'Authorization': `Bearer ${apikey}`,
        'Accept': 'application/json',
      }
    });
    const usersData = await usersRes.json();
    const users = usersData.data;

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

    res.status(200).send('✅ Semua server tidak aktif & user tanpa server berhasil dihapus!');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Error: ' + err.message);
  }
}
