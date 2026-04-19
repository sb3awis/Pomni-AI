import fetch from 'node-fetch'

const timeout = 60000
const categories = [
  'cultural',
  'islamic',
  'football',
  'entertainment',
  'scientific',
  'mathematical'
]

let handler = async (m, { conn, command }) => {

  conn.quiz = conn.quiz || {}
  conn.quizDifficulty = conn.quizDifficulty || {}

  let id = m.chat

  /* ========== زر إنهاء اللعبة ========= */
  if (command === 'quiz_stop') {
    if (!conn.quiz[id]) {
      return conn.reply(m.chat, '❌ لا توجد لعبة نشطة حاليًا', m)
    }

    clearTimeout(conn.quiz[id][2])
    delete conn.quiz[id]
    delete conn.quizDifficulty[id]

    return conn.reply(m.chat,
`⛔ *تم إنهاء اللعبة*
شكراً لمشاركتك 👋`, m)
  }

  /* ========== استقبال الإجابة ========= */
  if (command.startsWith('answer_')) {
    let quiz = conn.quiz[id]
    if (!quiz) return

    let selectedAnswer = command.split('_')[1]
    let isCorrect = quiz[0].right_answer == selectedAnswer

    if (isCorrect) {
      await conn.reply(m.chat,
`*❐═━━━═╊⊰🐉⊱╉═━━━═❐*
*『✅┇اجـابـه صـحـيـحـة┇✅』*

*【💰┇الـجـائـزة ⟣ 500𝚡𝚙 】*
*❐═━━━═╊⊰🐉⊱╉═━━━═❐*
> *𝙱𝚈┇NEZUKO-BOT*`, m)

      global.db.data.users[m.sender].exp += 500
      clearTimeout(quiz[2])
      delete conn.quiz[id]

      let difficulty = conn.quizDifficulty[id]
      if (difficulty) {
        setTimeout(() => sendQuestion(conn, m, difficulty), 1500)
      }
      return
    }

    quiz[3] -= 1
    if (quiz[3] > 0) {
      await conn.reply(m.chat,
`*❐═━━━═╊⊰🐉⊱╉═━━━═❐*
*『❌┇اجـابـة خـطـئ┇❌』*

> *⧉↫تـبـقـي عـدد مـحـولات↫ ${quiz[3]} ❯*
*❐═━━━═╊⊰🐉⊱╉═━━━═❐*
> *𝙱𝚈┇NEZUKO-BOT*`, m)
      return
    }

    await conn.reply(m.chat,
`*❐═━━━═╊⊰🐉⊱╉═━━━═❐*
*『❌┇اجـابـة خـطـئ┇❌』*

> *⧉↫الاجـابـه الـصـحـيـة↫ ${quiz[0]['answer_' + quiz[0].right_answer]} ❯*
*❐═━━━═╊⊰🐉⊱╉═━━━═❐*
> *𝙱𝚈┇NEZUKO-BOT*`, m)

    clearTimeout(quiz[2])
    delete conn.quiz[id]

    let difficulty = conn.quizDifficulty[id]
    if (difficulty) {
      setTimeout(() => sendQuestion(conn, m, difficulty), 1500)
    }
    return
  }

  /* ========== اختيار الصعوبة ========= */
  if (command.startsWith('difficulty_')) {
    let difficulty = command.split('_')[1]
    conn.quizDifficulty[id] = difficulty

    await conn.reply(m.chat, `✅ تم اختيار الصعوبة: *${difficulty}*`, m)
    return sendQuestion(conn, m, difficulty)
  }

  /* ========== رسالة اختيار الصعوبة ========= */
  await conn.sendMessage(m.chat, {
    text: '🎮 اختر مستوى الصعوبة:',
    buttons: [
      { buttonId: '.difficulty_easy', buttonText: { displayText: '🟢 سهل' }, type: 1 },
      { buttonId: '.difficulty_medium', buttonText: { displayText: '🟡 متوسط' }, type: 1 },
      { buttonId: '.difficulty_hard', buttonText: { displayText: '🔴 صعب' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })
}

/* ========== إرسال سؤال ========= */
async function sendQuestion(conn, m, difficulty) {
  let id = m.chat
  if (conn.quiz[id]) return

  let category = categories[Math.floor(Math.random() * categories.length)]
  let url = `https://obito-mr-apis.vercel.app/api/game/questions?category=${category}&difficulty=${difficulty}`

  let res = await fetch(url)
  let data = await res.json()
  if (!data.status) return

  let options = data.options
  let rightIndex = options.indexOf(data.answer) + 1

  let quizData = {
    question: data.question,
    answer_1: options[0],
    answer_2: options[1],
    answer_3: options[2],
    answer_4: options[3],
    right_answer: rightIndex
  }

  let questionText = `
*❐═━━━═╊⊰🐉⊱╉═━━━═❐*
*『🎮┇حـسـنـاً لـنـبـدأ الـلـعـبـة┇🎮』*
*❐═━━━═╊⊰🐉⊱╉═━━━═❐*

*السؤال:*
${quizData.question}

*✠ ━━ • ━ ‹✤› ━ • ━━ ✠*
*⚡ الوقت: ${timeout / 1000} ثانية*
*💰 الجائزة: 500 نقطة*
*❐═━━━═╊⊰🐉⊱╉═━━━═❐*
`.trim()

  await conn.sendMessage(m.chat, {
    text: questionText,
    footer: 'اختر الإجابة أو أنهِ اللعبة:',
    buttons: [
      { buttonId: '.answer_1', buttonText: { displayText: `1. ${quizData.answer_1}` }, type: 1 },
      { buttonId: '.answer_2', buttonText: { displayText: `2. ${quizData.answer_2}` }, type: 1 },
      { buttonId: '.answer_3', buttonText: { displayText: `3. ${quizData.answer_3}` }, type: 1 },
      { buttonId: '.answer_4', buttonText: { displayText: `4. ${quizData.answer_4}` }, type: 1 },
      { buttonId: '.quiz_stop', buttonText: { displayText: '⛔ إنهاء اللعبة' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })

  conn.quiz[id] = [
    quizData,
    500,
    setTimeout(async () => {
      if (conn.quiz[id]) {
        await conn.reply(m.chat,
`*❐═━━━═╊⊰🐉⊱╉═━━━═❐*
*『⌛┇انـتـهـي الـوقـت┇⌛』*

*【✅┇الاجـابـة ⟣ ${quizData['answer_' + quizData.right_answer]} 】*
*❐═━━━═╊⊰🐉⊱╉═━━━═❐*
> *𝙱𝚈┇NEZUKO-BOT*`, m)

        delete conn.quiz[id]

        let diff = conn.quizDifficulty[id]
        if (diff) {
          setTimeout(() => sendQuestion(conn, m, diff), 1500)
        }
      }
    }, timeout),
    2
  ]
}

handler.help = ['ثقافة']
handler.category = 'game'
export default handler

handler.command = ["ثقافة"];
