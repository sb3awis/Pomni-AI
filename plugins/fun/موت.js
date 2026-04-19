let handler = async (m, { conn }) => {
  let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  let name = conn.getName(who)
  let pp = await conn.profilePictureUrl(who, 'image').catch(_ => './Menu.png')
  conn.sendFile(m.chat, global.API('https://some-random-api.com', '/canvas/overlay/wasted', {
    avatar: pp, 
  }), 'waste.png', `*『🔥┇NEZUKO-BOT』*  
╭━━━[ *⚰️* ]━━━━⬣
┃ *☜لقد مات*
╯──────────────────╰
┃*☜ المرحوم*  *⌝ ${name}⌞*`, m)
}
handler.help = ['موت @user']
handler.category = 'fun'
handler.command = ['موت'] 
export default handler
handler.command = ["موت"];
