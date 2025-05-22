export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

  const domain = 'https://privat.otwbosmuda.web.id';
  const apikey = 'ptla_0RT7eiZh2VZVjHcMAMhD3SlYynsEU03iX3yf3iNhj5U';

  try {
    const now = new Date();

    // Ambil semua server
    let servers = [];
    let page = 1;
    while (true) {
      const serversRes = await fetch(`${domain}/api/application/servers?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${apikey}`,
          'Accept': 'application/json',
        }
      });
      const data = await serversRes.json();
      servers = servers.concat(data.data);
      if (!data.meta.pagination.links.next) break;
      page++;
    }

    // Hapus server tidak aktif > 5 jam
    for (let server of servers) {
      const updatedAt = new Date(server.attributes.updated_at);
      const diffHours = (now - updatedAt) / 1000 / 60 / 60;

      if (diffHours >= 5) {
        await fetch(`${domain}/api/application/servers/${server.attributes.id}/force`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${apikey}`,
            'Accept': 'application/json'
          }
        });
      }
    }

    // Ambil ulang server aktif
    let activeServers = [];
    page = 1;
    while (true) {
      const res = await fetch(`${domain}/api/application/servers?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${apikey}`,
          'Accept': 'application/json',
        }
      });
      const data = await res.json();
      activeServers = activeServers.concat(data.data);
      if (!data.meta.pagination.links.next) break;
      page++;
    }

    const activeUserIds = new Set(activeServers.map(s => s.attributes.user));

    // Ambil semua user (pagination)
    let users = [];
    page = 1;
    while (true) {
      const usersRes = await fetch(`${domain}/api/application/users?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${apikey}`,
          'Accept': 'application/json',
        }
      });
      const data = await usersRes.json();
      users = users.concat(data.data);
      if (!data.meta.pagination.links.next) break;
      page++;
    }

    // Hapus user tanpa server
    for (let user of users) {
      const userId = user.attributes.id;
      if (!activeUserIds.has(userId)) {
        const del = await fetch(`${domain}/api/application/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${apikey}`,
            'Accept': 'application/json'
          }
        });
        if (!del.ok) {
          console.error(`Gagal hapus user ${user.attributes.username}`);
        }
      }
    }

    res.status(200).send('✅ Server tidak aktif & user tanpa server berhasil dihapus!');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Error: ' + err.message);
  }
                                                    }
