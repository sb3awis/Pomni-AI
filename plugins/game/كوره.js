import fs from 'fs'
import similarity from 'similarity'

let timeout = 60000
let poin = 500
const threshold = 0.72

let handler = async (m, { conn }) => {
    conn.tekateki = conn.tekateki ? conn.tekateki : {}
    let id = m.chat
    
    if (id in conn.tekateki) {
        await conn.reply(m.chat, '❐┃لم يتم الاجابة علي السؤال بعد┃❌ ❯', conn.tekateki[id][0])
        throw false
    }
    
    try {
        let tekateki = JSON.parse(fs.readFileSync('./src/game/كوره.json'))
        let json = tekateki[Math.floor(Math.random() * tekateki.length)]
        
        let caption = `
~*⊹‏⊱≼━━⌬〔 ❬ NEZUKO-BOT ❭ 〕⌬━━≽⊰⊹*~
════════════════╦
° ๛ *من هو هذا اللاعب؟*
° ๛ *الـوقـت⏳↞ ${(timeout / 1000).toFixed(2)} ثانية*
° ๛ *الـجـائـزة💰↞ ${poin} نقاط*
═════════════════
~*⊹‏⊱≼━⌬〔 ❬ NEZUKO-BOT ❭ 〕⌬━≽⊰⊹*~
`.trim()
        
        let sentMsg = await conn.sendMessage(m.chat, { 
            image: { url: json.img },
            caption: caption
        }, { quoted: m })
        
        conn.tekateki[id] = [
            sentMsg,
            json, 
            poin,
            setTimeout(() => {
                if (conn.tekateki[id]) {
                    conn.sendMessage(m.chat, { 
                        text: `*⌛ انتهي الوقت ⌛*\n*الاجـابـة✅:* ${json.name}` 
                    }, { quoted: sentMsg })
                    delete conn.tekateki[id]
                }
            }, timeout)
        ]
    } catch (e) {
        console.error('Error in main handler:', e)
        await conn.reply(m.chat, 'حدث خطأ أثناء تحميل الألغاز، يرجى المحاولة لاحقاً', m)
    }
}

handler.before = async function (m) {
    try {
        if (!m || !m.quoted || !m.text) return
        
        let id = m.chat
        this.tekateki = this.tekateki ? this.tekateki : {}
        
        if (!(id in this.tekateki)) return
        
        let gameData = this.tekateki[id]
        if (!gameData || !gameData[0]) return
        
        if (m.quoted.id === gameData[0].id) {
            let json = gameData[1]
            let userAnswer = m.text.toLowerCase().trim()
            let correctAnswer = json.name.toLowerCase().trim()
            
            if (userAnswer === correctAnswer) {
                if (global.db.data.users[m.sender]) {
                    global.db.data.users[m.sender].exp += gameData[2]
                }
                await this.sendMessage(m.chat, {
                    text: `*⊱─═⪨༻𓆩〘⚡〙𓆪༺⪩═─⊰*\n\n*⌬ ❛╏ اجـــابــه صـحـيـحــه شـطــور يـلا جــرب تــــانــي*\n\n*الـــجــائــزة💰↞ ${gameData[2]} نــقـطـه*\n\n*⊱─═⪨༻𓆩〘⚡〙𓆪༺⪩═─⊰*`
                }, { quoted: m })
                clearTimeout(gameData[3])
                delete this.tekateki[id]
            } else if (similarity(userAnswer, correctAnswer) >= threshold) {
                await this.sendMessage(m.chat, {
                    text: '*⌬ ❛╏ قـــربـت مـن الاجــابــة جــرب تــــانــي*'
                }, { quoted: m })
            } else {
                await this.sendMessage(m.chat, {
                    text: '*⊱─═⪨༻𓆩〘⚡〙𓆪༺⪩═─⊰*\n\n*⌬ ❛╏ اجـــابــه خــاطــئـــه يــا فــاشــل*\n\n*⊱─═⪨༻𓆩〘⚡〙𓆪༺⪩═─⊰*'
                }, { quoted: m })
            }
        }
    } catch (e) {
        console.error('Error in before handler:', e)
    }
    return true
}

handler.help = ['كوره']
handler.category = 'game'
export default handler 
handler.command = ["كوره"];
