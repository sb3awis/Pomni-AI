import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'
import { webp2png } from '../lib/webp2mp4.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'

const tmpDir = './src/tmp'

const handler = async (m, { conn, args,  command }) => {
  if (!args[0]) return m.reply(`❗ أرسل رابط مجموعة الملصقات مثل:\n${"." + command} https://sticker.ly/s/QEU2B7`)
  if (!args[0].includes('sticker.ly')) return m.reply('❗ يجب أن يكون الرابط من موقع sticker.ly')

  try {
    let apilink = `https://delirius-apiofc.vercel.app/download/stickerly?url=${args[0]}`
    let res = await fetch(apilink)
    let json = await res.json()

    if (!json.status || !json.data || !json.data.stickers || json.data.stickers.length === 0)
      return m.reply('❌ لم يتم العثور على ملصقات في هذا الرابط')

    let stickers = json.data.stickers

    m.reply(`✅ تم العثور على ${stickers.length} ملصق، جارٍ الإرسال...`)

    for (let i = 0; i < stickers.length; i++) {
      let url = stickers[i]
      let ext = path.extname(url).split('?')[0]
      let filename = path.join(tmpDir, `sticker_${Date.now()}_${i}${ext}`)

      const res = await fetch(url)
      const buffer = await res.buffer()
      fs.writeFileSync(filename, buffer)

      // إذا كان الملف بصيغة webp نرسله مباشرة كملصق
      if (ext.toLowerCase() === '.webp') {
        await conn.sendFile(m.chat, buffer, 'sticker.webp', '', m)
        if (fs.existsSync(filename)) fs.unlinkSync(filename)
        continue
      }

      // للملفات الأخرى نتبع العملية العادية
      let stiker
      try {
        stiker = await sticker(buffer, false, global.packname, global.author, ['✨'], { isAiSticker: true })
      } catch (err) {
        try {
          let uploaded
          if (/webp/.test(ext)) uploaded = await webp2png(buffer)
          else if (/image/.test(ext)) uploaded = await uploadImage(buffer)
          else uploaded = await uploadFile(buffer)
          stiker = await sticker(false, uploaded, global.packname, global.author, ['✨'], { isAiSticker: true })
        } catch (e) {
          console.error('❌ فشل تحويل الملف إلى ملصق:', e)
          continue
        }
      }

      if (stiker) {
        await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
      }

      // حذف الملف المؤقت
      if (fs.existsSync(filename)) fs.unlinkSync(filename)
    }

  } catch (e) {
    console.error(e)
    m.reply('❌ حدث خطأ أثناء تحميل أو إرسال الملصقات')
  }
}

handler.help = ['stickerly url']
handler.category = 'download'
handler.limit = true

export default handler
handler.command = ["stickerly"];
