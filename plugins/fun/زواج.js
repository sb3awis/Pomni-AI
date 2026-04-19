let toM = a => '@' + a.split('@')[0]
function handler(m, { groupMetadata }) {
let ps = groupMetadata.participants.map(v => v.id)
let a = ps.getRandom()
let b
do b = ps.getRandom()
while (b === a)
m.reply(`*${toM(a)}, الف مبروك للعريس🥳✨*
*${toM(b)}, الف مبروك للعروسه🥳✨*\n\*ملاحظه دا منشن عشوائي للمرح فقط اذا لم يعجبك الأمر إذن ماتستخدمش الامر💗*`, null, {
mentions: [a, b]
})}
handler.help = ['زواج']
handler.category = 'fun'
handler.command = ['زواج']
handler.group = true
export default handler

handler.command = ["زواج"];
