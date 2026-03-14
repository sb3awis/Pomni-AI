async function handler(m, { conn }) {
    if (!global.gameActive) {
        global.gameActive = {};
    }
    
    const oldGame = global.gameActive[m.chat];
    if (oldGame) {
        clearTimeout(oldGame.timeout);
        delete global.gameActive[m.chat];
    }
    
    const data = await (await fetch("https://gist.githubusercontent.com/Kyutaka101/799d5646ceed992bf862026847473852/raw/dcbecff259b1d94615d7c48079ed1396ed42ef67/gistfile1.txt")).json();
    
    const country = data[Math.floor(Math.random() * data.length)];
    
    const message = await conn.sendMessage(m.chat, {
        image: { url: country.img },
        caption: "🌍 *خمن العلم*\n\nلديك 30 ثانيه لـ الإجابة رد علي الرساله ب اسم العلم"
    });
    
    global.gameActive[m.chat] = {
        answer: country.name.toLowerCase(),
        image: country.img,
        messageId: message?.key?.id,
        timeout: setTimeout(() => {
            if (global.gameActive[m.chat]) {
                const countryName = global.gameActive[m.chat].answer;
                delete global.gameActive[m.chat];
                conn.sendMessage(m.chat, { 
                    text: `⏰ *أنتهي الوقت* الإجابة هي : *${countryName}*` 
                }, m);
            }
        }, 30000)
    };
}

handler.before = async (m, { conn }) => {
    if (!m.quoted || !m.text) return false;
    
    if (!global.gameActive) {
        global.gameActive = {};
    }
    
    const game = global.gameActive[m.chat];
    if (!game) return false;
    
    if (m.quoted.id !== game.messageId) return false;
    
    const userAnswer = m.text.toLowerCase().trim();
    
    if (userAnswer === game.answer) {
        clearTimeout(game.timeout);
        delete global.gameActive[m.chat];
        await conn.sendMessage(m.chat, {
            image: { url: game.image },
            caption: `🎉 *صحيح صحيح* عاش جبت اسم العلم صح\n💡 هل هتعرف تكمل؟\n\n> اكتب *${m.prefix || '.'}علم* عشان تلعب تاني`
        });
        return true;
    } else {
        await m.reply("*❌ إجابة غلط رد جرب تاني*");
        return true;
    }
};

handler.usage = ["علم"];
handler.category = "games";
handler.command = ['علم','country'];

export default handler;