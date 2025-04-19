export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { username, email, ram } = req.body;

  const hargaPerGB = 1000;
  const ramGB = parseInt(ram.replace('gb', ''));
  const amount = ramGB * hargaPerGB;

  const codeqr = `00020101021226670016COM.NOBUBANK.WWW01189360050300000879140214057125036591790303UMI51440014ID.CO.QRIS.WWW0215ID20232646203860303UMI520448125303360540410005802ID5918GOODFM21+OK11756396008MINAHASA61059537162070703A016304D191`;
  const paymentRes = await fetch(`https://restapi-v2.simplebot.my.id/orderkuota/createpayment?apikey=new2025&amount=${amount}&codeqr=${encodeURIComponent(codeqr)}`);
  const paymentJson = await paymentRes.json();

  if (!paymentJson.status || !paymentJson.result) {
    return res.status(500).json({ message: 'Gagal membuat QRIS' });
  }

  return res.status(200).json({
    status: 'WAITING_PAYMENT',
    qris: paymentJson.result.imageqris.url,
    keyorkut: paymentJson.result.idtransaksi
  });
}
