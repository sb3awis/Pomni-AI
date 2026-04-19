import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text,  command }) => {
  // التحقق من وجود صوت بالرد
  if (!m.quoted || !/audio/.test(m.quoted.mimetype)) {
    return m.reply(`🚫 من فضلك قم بالرد على مقطع صوتي.\n\nمثال:\n${"." + command} 0:10 0:25`)
  }

  // التحقق من وجود الأوقات
  let args = text.trim().split(/\s+/)
  if (args.length < 2) {
    return m.reply(`⚠️ استعمل هكذا:\n${"." + command} [من] [إلى]\n\nمثال:\n${"." + command} 0:05 0:20`)
  }

  let start = args[0] // البداية
  let end = args[1]   // النهاية

  // تحميل الملف الصوتي
  let media = await m.quoted.download()
  let inputPath = path.join(process.cwd(), `input_${Date.now()}.mp3`)
  let outputPath = path.join(process.cwd(), `output_${Date.now()}.mp3`)

  fs.writeFileSync(inputPath, media)

  // ffmpeg لتقطيع الصوت
  await new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-i', inputPath,
      '-ss', start,
      '-to', end,
      '-c', 'copy',
      outputPath
    ])

    ffmpeg.on('close', code => {
      if (code === 0) resolve()
      else reject(new Error('فشل في معالجة الصوت'))
    })
  })

  // إرسال النتيجة
  let trimmed = fs.readFileSync(outputPath)
  await conn.sendMessage(m.chat, { audio: trimmed, mimetype: 'audio/mpeg', ptt: false }, { quoted: m })

  // حذف الملفات المؤقتة
  fs.unlinkSync(inputPath)
  fs.unlinkSync(outputPath)
}

handler.help = ['trim <from> <to>']
handler.category = 'tools'
export default handler
handler.command = ["trim"];
