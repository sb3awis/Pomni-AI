let toM = a => '@' + a.split('@')[0]
function handler(m, { groupMetadata }) {
let ps = groupMetadata.participants.map(v => v.id)
let a = ps.getRandom()
let b
do b = ps.getRandom()
while (b === a)
m.reply(`*${toM(a)},  وش رأيك في ثالثة😂*
*${toM(b)},*لاتزعلي 🤭\n\*نزوجك مارك وش رأيك*`, null, {
mentions: [a, b]
})}
handler.help = ['طلاق']
handler.category = 'fun'
handler.command = ['طلاق']
handler.group = true
export default handler


handler.command = ["طلاق"];
