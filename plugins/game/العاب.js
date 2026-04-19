import fetch from 'node-fetch'
import similarity from 'similarity'

let timeout = 60000
let poin = 500
const threshold = 0.72

let handler = async (m, { conn }) => {
    conn.tekateki = conn.tekateki || {}
    let id = m.chat

    if (id in conn.tekateki) {
        await conn.reply(m.chat, '❐┃لم يتم الاجابة علي السؤال بعد┃❌ ❯', conn.tekateki[id][0])
        throw false
    }

    try {
        // جلب البيانات من API
        let res = await fetch('https://raw.githubusercontent.com/qisyana/scrape/main/tebakgame.json')
        let data = await res.json()

        // اختيار عشوائي
        let json = data[Math.floor(Math.random() * data.length)]

        let caption = `
~*⊹‏⊱≼━━⌬〔 ❬ NEZUKO-BOT ❭ 〕⌬━━≽⊰⊹*~
════════════════╦
° ๛ *ما هي هذه اللعبة؟*
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
                        text: `*⌛ انتهي الوقت ⌛*\n*الإجابة الصحيحة✅:* ${json.jawaban}`
                    }, { quoted: sentMsg })
                    delete conn.tekateki[id]
                }
            }, timeout)
        ]
    } catch (e) {
        console.error('Error in main handler:', e)
        await conn.reply(m.chat, '❌ حدث خطأ أثناء تحميل السؤال من الإنترنت، حاول لاحقاً.', m)
    }
}

handler.before = async function (m) {
    try {
        if (!m || !m.quoted || !m.text) return

        let id = m.chat
        this.tekateki = this.tekateki || {}

        if (!(id in this.tekateki)) return

        let gameData = this.tekateki[id]
        if (!gameData || !gameData[0]) return

        if (m.quoted.id === gameData[0].id) {
            let json = gameData[1]
            let userAnswer = m.text.toLowerCase().trim()
            let correctAnswer = json.jawaban.toLowerCase().trim()

            if (userAnswer === correctAnswer) {
                if (global.db.data.users[m.sender]) {
                    global.db.data.users[m.sender].exp += gameData[2]
                }
                await this.sendMessage(m.chat, {
                    text: `*⊱─═⪨༻𓆩〘⚡〙𓆪༺⪩═─⊰*\n\n*⌬ ❛╏ إجابة صحيحة! شطور!*\n\n*💰 الجائزة: ${gameData[2]} نقطة*\n\n*⊱─═⪨༻𓆩〘⚡〙𓆪༺⪩═─⊰*`
                }, { quoted: m })
                clearTimeout(gameData[3])
                delete this.tekateki[id]
            } else if (similarity(userAnswer, correctAnswer) >= threshold) {
                await this.sendMessage(m.chat, {
                    text: '*⌬ ❛╏ قـــربـت مـن الاجــابــة جــرب تــــانــي*'
                }, { quoted: m })
            } else {
                await this.sendMessage(m.chat, {
                    text: '*⊱─═⪨༻𓆩〘⚡〙𓆪༺⪩═─⊰*\n\n*⌬ ❛╏ اجـــابــه خــاطــئـــه يــا فــاشــل*\n\n*⊱─═⪨༻𓆩〘⚡〙𓆪༺⪩═─⊰'
                }, { quoted: m })
            }
        }
    } catch (e) {
        console.error('Error in before handler:', e)
    }
    return true
}

handler.help = ['العاب']
handler.category = 'game'
export default handler
handler.command = ["العاب"];
