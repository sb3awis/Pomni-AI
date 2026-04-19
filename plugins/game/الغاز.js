import fs from 'fs'
import path from 'path'
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
        // ✅ قراءة ملف عشوائي من الملفات التي تنتهي بـ "لغز.json"
        const folderPath = './src/game'
        const files = fs.readdirSync(folderPath).filter(file => file.match(/لغز.*\.json$/))

        if (!files.length) throw new Error('📁 لا توجد ملفات ألغاز.')

        const randomFile = files[Math.floor(Math.random() * files.length)]
        const filePath = path.join(folderPath, randomFile)

        let raw = fs.readFileSync(filePath, 'utf-8')
        let tekateki = JSON.parse(raw)

        if (!Array.isArray(tekateki) || tekateki.length === 0) {
            throw new Error('📁 ملف الألغاز فارغ أو غير صالح')
        }

        let json = tekateki[Math.floor(Math.random() * tekateki.length)]

        let caption = `~*⊹‏⊱≼━━⌬〔 ❬ NEZUKO-BOT ❭ 〕⌬━━≽⊰⊹*~
════════════════╦
° ๛ *${json.question}*
° ๛ *الـوقـت⏳↞ ${(timeout / 1000).toFixed(0)} ثانية*
° ๛ *الـجـائـزة💰↞ ${poin} نقاط*
═════════════════
~*⊹‏⊱≼━⌬〔 ❬ NEZUKO-BOT ❭ 〕⌬━≽⊰⊹*~`

        let sentMsg = await conn.sendMessage(m.chat, { text: caption }, { quoted: m })

        conn.tekateki[id] = [
            sentMsg,
            json,
            poin,
            setTimeout(() => {
                if (conn.tekateki[id]) {
                    conn.sendMessage(m.chat, {
                        text: `⌛ انتهى الوقت ⌛\nالاجـابـة✅: ${json.response}`
                    }, { quoted: sentMsg })
                    delete conn.tekateki[id]
                }
            }, timeout)
        ]
    } catch (e) {
        console.error('❌ خطأ أثناء تنفيذ الأمر:', e)
        await conn.reply(m.chat, '⚠️ حدث خطأ أثناء تحميل الألغاز، يرجى المحاولة لاحقاً', m)
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

        let quotedId = m.quoted?.id || m.quoted?.key?.id
        let gameMsgId = gameData[0]?.key?.id

        if (quotedId === gameMsgId) {
            let json = gameData[1]
            let userAnswer = m.text.toLowerCase().trim()
            let correctAnswer = json.response.toLowerCase().trim()

            if (userAnswer === correctAnswer) {
                if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
                global.db.data.users[m.sender].exp = (global.db.data.users[m.sender].exp || 0) + gameData[2]

                await this.sendMessage(m.chat, {
                    text: `⊱─═⪨༻𓆩〘⚡〙𓆪༺⪩═─⊰\n\n⌬ ❛╏ اجـــابــه صـحـيـحــه شـطــور يـلا جــرب تــــانــي\n\nالـــجــائــزة💰↞ ${gameData[2]} نــقـطـه\n\n⊱─═⪨༻𓆩〘⚡〙𓆪༺⪩═─⊰`
                }, { quoted: m })

                clearTimeout(gameData[3])
                delete this.tekateki[id]
            } else if (similarity(userAnswer, correctAnswer) >= threshold) {
                await this.sendMessage(m.chat, {
                    text: '⌬ ❛╏ قـــربـت مـن الاجــابــة جــرب تــــانــي'
                }, { quoted: m })
            } else {
                await this.sendMessage(m.chat, {
                    text: `⊱─═⪨༻𓆩〘⚡〙𓆪༺⪩═─⊰\n\n⌬ ❛╏ اجـــابــه خــاطــئـــه يــا فــاشــل\n\n⊱─═⪨༻𓆩〘⚡〙𓆪༺⪩═─⊰`
                }, { quoted: m })
            }
        }
    } catch (e) {
        console.error('❌ خطأ في التحقق من الإجابة:', e)
    }

    return true
}

handler.help = ['لغز']
handler.category = 'game'
export default handler

handler.command = ["لغز"];
