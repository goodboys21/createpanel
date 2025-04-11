export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { username, email, ram } = req.body;

  const ramConfig = {
    '1gb': { ram: 1000, disk: 1000, cpu: 40 },
    '2gb': { ram: 2000, disk: 1000, cpu: 60 },
    '3gb': { ram: 3000, disk: 2000, cpu: 80 },
    '4gb': { ram: 4000, disk: 2000, cpu: 100 },
  };

  const config = ramConfig[ram] || { ram: 1000, disk: 1000, cpu: 40 };
  const domain = 'https://cloud.bagusx.biz.id';
  const apikey = 'ptla_s8coZy399fKPPRysDDg7xxJE3y43OngG421yDzjEiSS';

  try {
    const createUser = await fetch(`${domain}/api/application/users`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apikey}`,
      },
      body: JSON.stringify({
        email: `${username}@buy.guz`,
        username,
        first_name: username,
        last_name: username,
        language: 'en',
        password: username + '2110'
      })
    });
    const user = await createUser.json();
    if (user.errors) return res.status(500).send('Gagal membuat user.');

    const userId = user.attributes.id;
    const egg = '15';
    const loc = '1';
    const getEgg = await fetch(`${domain}/api/application/nests/5/eggs/${egg}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apikey}`
      }
    });
    const eggData = await getEgg.json();

    const createServer = await fetch(`${domain}/api/application/servers`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apikey}`,
      },
      body: JSON.stringify({
        name: username,
        user: userId,
        egg: parseInt(egg),
        docker_image: 'ghcr.io/parkervcp/yolks:nodejs_18',
        startup: eggData.attributes.startup,
        environment: {
          INST: 'npm',
          USER_UPLOAD: '0',
          AUTO_UPDATE: '0',
          CMD_RUN: 'npm start'
        },
        limits: {
          memory: config.ram,
          swap: 0,
          disk: config.disk,
          io: 500,
          cpu: config.cpu
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 5
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        }
      })
    });
    const serverData = await createServer.json();
    if (serverData.errors) return res.status(500).send('Gagal membuat server.');

    // Kirim email
    const message = `Username: ${username}\nPassword: ${username}2110\nLogin: ${domain}`;
    const mailRes = await fetch(`https://goodsite.vercel.app/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: `Panel Anda Siap - ${username}`,
        message: message
      })
    });

    if (!mailRes.ok) return res.status(500).send('Gagal mengirim email');

    res.status(200).send('✅ Panel berhasil dibuat dan email dikirim!');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Gagal membuat panel: ' + err.message);
  }
}
