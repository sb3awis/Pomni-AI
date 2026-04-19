/* Creditos a https://github.com/FG98F */

let handler = async (m, { conn,  command }) => {	
if (!m.quoted) throw `*❮ ❗┇يجب ان تضع ريبلاي للرسالة الذي تريد حذفها❯*`
try {
let delet = m.message.extendedTextMessage.contextInfo.participant
let bang = m.message.extendedTextMessage.contextInfo.stanzaId
return conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }})
} catch {
return conn.sendMessage(m.chat, { delete: m.quoted.vM.key })
}}
handler.help = ['حذف']
handler.category = 'owner'
handler.botAdmin = true
handler.owner = true
export default handler
/
handler.command = ["حذف"];
