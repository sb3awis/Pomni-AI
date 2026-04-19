let handler = async (m, { conn, command, text }) => {
let intelligence = `*💡 نسبة الذكاء 💡*
*نسبة ذكاء ${text} 💡هي* *${Math.floor(Math.random() * 100)}%* *من 100%*
*ربنا يشفيك😂❤*
`.trim()
m.reply(intelligence, null, { mentions: conn.parseMention(intelligence) })}
handler.help = ['ذكاء']
handler.category = 'fun'
export default handler
handler.command = ["ذكاء"];
