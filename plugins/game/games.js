handler.before = async (m, { conn }) => {
    if (!m.text || !global.quiz?.games[m.chat] || !global.quiz?.scores[m.chat]) return;

    const game = global.quiz.games[m.chat];
    const player = m.sender;
    
    if (m.text.trim() !== game.answer) return;

    clearTimeout(game.timeout);
    delete global.quiz.games[m.chat];

    if (!global.quiz.scores[m.chat][player]) global.quiz.scores[m.chat][player] = 0;
    global.quiz.scores[m.chat][player]++;
    
    let total = 0;
    for (let id in global.quiz.scores[m.chat]) {
        total += global.quiz.scores[m.chat][id];
    }
    
    if (total >= 20) {
        const entries = Object.entries(global.quiz.scores[m.chat])
            .sort((a, b) => b[1] - a[1]);
        
        const sorted = entries.map(([id, score], i) => 
            `${i+1}. @${id.split('@')[0]} - ${score} نقطة`
        );
        
        const mentions = entries.map(([id]) => id);
        
        await conn.sendMessage(m.chat, { 
            text: `🏆 *الفائزون*\n\n${sorted.join('\n')}`,
            mentions
        });
        delete global.quiz.scores[m.chat];
        return;
    }

    await m.reply(`✅ احسنت معاك: ${global.quiz.scores[m.chat][player]} نقطه`);
    handler(m, { conn })
};



async function handler(m, { conn }) {
    if (!global.quiz) global.quiz = { games: {}, scores: {} };

    if (global.quiz.games[m.chat]) {
        clearTimeout(global.quiz.games[m.chat].timeout);
        delete global.quiz.games[m.chat];
    }

    const data = await (await fetch("https://raw.githubusercontent.com/Xov445447533/Xov11111/master/src/JSON/venom-كتابه.json")).json();
    const q = data[Math.floor(Math.random() * data.length)];
    
    m.reply(`
╭─┈─┈─┈─⟞🍧⟝─┈─┈─┈─╮
┃ *⌯︙ ${q.question}*
╰─┈─┈─┈─⟞🍬⟝─┈─┈─┈─╯
> _*اكتب الكلام بسرعه عشان تتحسبلك نقطه + بعد ٣٠ ثانيه لو مردتش اللعبه هتنتهي*_`);
    
    if (!global.quiz.scores[m.chat]) global.quiz.scores[m.chat] = {};
    
    global.quiz.games[m.chat] = {
        answer: q.response,
        timeout: setTimeout(() => {
            if (global.quiz.games[m.chat]) {
                delete global.quiz.games[m.chat];
                delete global.quiz.scores[m.chat];
                 m.reply("`⏰: انتهى الوقت`");
            }
        }, 30000)
    };
}

handler.usage = ["مسابقه"];
handler.category = "games";
handler.command = ['مسابقه'];
export default handler;