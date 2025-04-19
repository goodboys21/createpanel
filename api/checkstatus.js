export default async function handler(req, res) {
  const { id } = req.query;
  const merchant = 'OK1175639';
  const apikey = 'new2025';

  try {
    const fetchRes = await fetch(`https://restapi-v2.simplebot.my.id/orderkuota/cekstatus?apikey=${apikey}&merchant=${merchant}&keyorkut=${id}`);
    const json = await fetchRes.json();

    if (json.message === 'No transactions found.') {
      return res.status(200).json({ status: 'PENDING' });
    }

    if (json.status === true && json.result.status === 'SUCCESS') {
      return res.status(200).json({ status: 'PAID' });
    }

    return res.status(200).json({ status: 'PENDING' });
  } catch (err) {
    return res.status(500).json({ status: 'ERROR', message: err.message });
  }
}
