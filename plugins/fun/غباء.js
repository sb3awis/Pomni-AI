let handler = async (m, { conn, command, text }) => {
let stupidity = `*نسبه الغباء 🥲*
*نسبة غباء ${text}🙂هي* *${Math.floor(Math.random() * 100)}%* *من 100%*
*ربنا يهديكم💙☁️*
`.trim()
m.reply(stupidity, null, { mentions: conn.parseMention(stupidity) })}
handler.help = ['غباء']
handler.category = 'fun'
export default handler

handler.command = ["غباء"];
