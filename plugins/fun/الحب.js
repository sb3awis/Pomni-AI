let handler = async (m, { conn, command, text }) => {
let love = `*✨❤️ نسبه الحب ❤️✨*
*نسبة الحب ${text} ليك ✨❤️* *${Math.floor(Math.random() * 100)}%* *من 100%*
*اطلب منها ان تكون صديقه لك ؟*
`.trim()
m.reply(love, null, { mentions: conn.parseMention(love) })}
handler.help = ['الحب']
handler.category = 'fun'
export default handler

handler.command = ["الحب"];
