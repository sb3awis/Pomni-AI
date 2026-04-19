import fetch from 'node-fetch'

let handler = async (m, { conn, text,  command }) => {
  if (!text) throw `🔍 اكتب اسم الحزمة التي تريد البحث عنها.\n📌 مثال:\n${"." + command} flork`

  try {
    m.reply('🔎 جاري البحث عن حزم الملصقات...')

    let res = await fetch(`https://delirius-apiofc.vercel.app/search/stickerly?query=${encodeURIComponent(text)}`)
    if (!res.ok) throw '❌ لم أتمكن من الاتصال بالخادم.'

    let json = await res.json()
    let results = json?.data

    if (!results || results.length === 0) throw '❌ لم يتم العثور على أي حزمة بهذا الاسم.'

    let message = `🔖 تم العثور على ${results.length} حزمة (عرض أول 10):\n\n`

    results.slice(0, 10).forEach((sticker, index) => {
      message += `*${index + 1}.* 🧩 *${sticker.name}*\n👤 المؤلف: ${sticker.author}\n🧷 عدد الملصقات: ${sticker.sticker_count}\n🔗 [رابط الحزمة](${sticker.url})\n\n`
    })

    await conn.sendMessage(m.chat, { text: message.trim(), linkPreview: true }, { quoted: m })

  } catch (e) {
    console.error(e)
    throw '⚠️ حدث خطأ أثناء تنفيذ البحث. يرجى المحاولة لاحقًا.'
  }
}

handler.help = ['searchsticker <الاسم>']
handler.category = 'search'

export default handler
handler.command = ["searchsticker"];
