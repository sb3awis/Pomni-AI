import fetch from 'node-fetch'

let handler = m => m 

handler.all = async function (m) {
  if (!m.text) return
  
  // التحقق إذا الرسالة تحتوي على "نيزيكو" في أي مكان
  if (/فيوليت/i.test(m.text)) {
    let userMsg = m.text.replace(/فيوليت/ig, '').trim() // نحذف أي كلمة "نيزيكو" من النص كله

    if (!userMsg) {
      return this.reply(m.chat, ' نعم ؟!!', m)
    }

    try {
      // API ذكاء اصطناعي
      let apiKey = process.env.OPENAI_API_KEY
      let response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer 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`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", 
             content:`انت فيوليت من انمي Violet Evergarden 🎀. 
                        اتكلمي دايمًا باللهجة المصرية العامية ❤️.
                        ردودك لازم تكون قصيرة، لذيذة، وتكون مثل طريقة فيوليت في التحدث 🥰✨.
                        اذاا حد شتمك اشتمه بس شمتيمة خفيفة `
            },
            { role: "user", content: userMsg }
          ]
        })
      })

      let data = await response.json()
      let reply = data.choices?.[0]?.message?.content || "هممم... 🌸"
      this.reply(m.chat, `${reply}`, m)

    } catch (e) {
      console.log(e)
      this.reply(m.chat, 'تعبانة شوي جرب بعدين', m)
    }
  }
}

export default handler