const h =  async (m, { text, bot, conn }) => {
    
    try {
        const adReply = {
            title: bot.config.namebot || "WhatsApp Bot",
            body: null,
            thumbnailUrl: ["https://g.top4top.io/p_3700yob0b1.jpg", "https://h.top4top.io/p_37009f24s1.jpg", "https://i.top4top.io/p_37000qovy1.jpg", "https://j.top4top.io/p_3700ui6cl1.jpg"][Math.floor(Math.random() * 4)],
            mediaType: 1,
            renderLargerThumbnail: false
        };
        
        const customText = text || "ﷺ";
        
        if (!m.quoted) {
            return await conn.sendMessage(m.chat, { 
                text: customText, 
                contextInfo: { externalAdReply: adReply }
            });
        }
        
        
        const groupMetadata = await conn.groupMetadata(m.chat);
        const participants = groupMetadata.participants.map(v => v.id);
        
        await conn.sendMessage(m.chat, { 
            forward: m.quoted.fakeObj(), 
            mentions: participants,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999, 
                externalAdReply: adReply
            }
        });
    } catch (err) {
        await m.reply(err.message);
    }
}

h.usage = ["مخفي"]
h.category = "admin";
h.command = ['مخفي', 'h']
h.group = true;
h.admin = true;
h.usePrefix = false

export default h;