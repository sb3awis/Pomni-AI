// • Feature : to figure
// • Credits : https://whatsapp.com/channel/0029Vb4fjWE1yT25R7epR110

import uploadImage from '../lib/uploadImage.js';
import fetch from 'node-fetch';

let handler = async (m, { conn,  command }) => {
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || q.mediaType || '';

    if (/^image/.test(mime) && !/webp/.test(mime)) {
      m.reply('⏳ Mohon tunggu, sedang memproses...');
      const img = await q.download();
      const out = await uploadImage(img);
      if (!out) throw new Error('Gagal upload gambar!');

      const response = await fetch(`https://api.nekolabs.web.id/style-changer/figure?imageUrl=${encodeURIComponent(out)}`);
      const data = await response.json();

      if (!data.status) throw new Error('Gagal mendapatkan data dari API!');

      const resultUrl = data.result;

      await conn.sendMessage(m.chat, {
        image: { url: resultUrl },
        caption: 'done!'
      }, { quoted: m });

    } else {
      m.reply(`📷 Kirim gambar dengan caption *${"." + command}* atau tag gambar yang sudah dikirim.`);
    }
  } catch (e) {
    console.error('Error:', e);
    m.reply('🚨 Error: ' + (e.message || e));
  }
}

handler.help = ['tofigure'];
handler.category = 'ai';
handler.command = ['tofigure'];
handler.limit = true;

export default handler;
handler.command = ["tofigure"];
