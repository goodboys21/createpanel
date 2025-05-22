export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

  const domain = 'https://privat.otwbosmuda.web.id';
  const apikey = 'ptla_0RT7eiZh2VZVjHcMAMhD3SlYynsEU03iX3yf3iNhj5U';

  try {
    const getServers = await fetch(`${domain}/api/application/servers`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apikey}`
      }
    });

    const { data: servers } = await getServers.json();
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);
    const deletedUsers = new Set();
    let deletedServers = 0;
    let deletedUserCount = 0;

    // Simpan ID user yang servernya dihapus
    const userServerMap = {};

    for (const server of servers) {
      const updatedAt = new Date(server.attributes.updated_at);
      const serverId = server.attributes.id;
      const userId = server.attributes.user;

      // Simpan list server milik user
      if (!userServerMap[userId]) userServerMap[userId] = [];
      userServerMap[userId].push(serverId);

      if (updatedAt < fiveHoursAgo) {
        // Hapus server
        await fetch(`${domain}/api/application/servers/${serverId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${apikey}`,
            'Accept': 'application/json'
          }
        });
        deletedServers++;
        console.log(`Server ${serverId} milik user ${userId} dihapus.`);

        // Tandai user untuk dicek kemudian
        deletedUsers.add(userId);
      }
    }

    // Cek user yang servernya dihapus, apakah masih punya server lain
    for (const userId of deletedUsers) {
      // Cek ulang server aktif user tersebut
      const check = await fetch(`${domain}/api/application/users/${userId}/servers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apikey}`,
          'Accept': 'application/json'
        }
      });
      const checkData = await check.json();

      if (!checkData.data || checkData.data.length === 0) {
        // Hapus user kalau udah gak punya server
        await fetch(`${domain}/api/application/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${apikey}`,
            'Accept': 'application/json'
          }
        });
        deletedUserCount++;
        console.log(`User ${userId} dihapus karena tidak memiliki server.`);
      }
    }

    res.status(200).send(`Selesai! ${deletedServers} server & ${deletedUserCount} user dihapus.`);
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Gagal hapus: ' + err.message);
  }
}
