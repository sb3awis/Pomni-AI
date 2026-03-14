import fs from 'fs';
import path from 'path';

const ff = async (m, { conn, text, command }) => {
    const filePath = path.join(process.cwd(), 'settings', 'database.json');
    const data = fs.readFileSync(filePath, 'utf8');
    const database1 = JSON.parse(data);
    
    if (!database1.ban) database1.ban = {};
    
    let target = m.mentionedJid?.[0] || (m.quoted?.sender);
    
    if (target && target.includes('@lid')) {
        let groupMetadata = await conn.groupMetadata(m.chat);
        let participant = groupMetadata.participants.find(p => p.id === target);
        if (participant) target = participant.phoneNumber;
    }
    
    if (!target && text) {
        if (text.includes('@')) {
            target = text.replace('@', '') + '@s.whatsapp.net';
        } else {
            let groupMetadata = await conn.groupMetadata(m.chat);
            let participant = groupMetadata.participants.find(p => 
                p.phoneNumber.split('@')[0] === text
            );
            if (participant) target = participant.phoneNumber;
        }
    }
    
    if (!target) {
        return m.reply(`*~ 💙 منشن شخص مثل /${command} @${m.sender.split('@')[0]} ❤️ ~*`);
    }
    
    if (command === "فك_حظر" || command === "الغاء_الحظر") {
        if (database1.ban[target]) {
            delete database1.ban[target];
            if (global.database?.ban?.[target]) {
                delete global.database.ban[target];
            }
            fs.writeFileSync(filePath, JSON.stringify(database1, null, 2));
      conn.sendMessage(m.chat, { text: `*✅ ~تم فك حظر @${target.split('@')[0]}*\n> *_دلوقت يقدر يكلم البوت عادي_*`, mentions: [target] }, { quoted: m })
        } else {
            m.reply(`*❌ ~هذا المستخدم ليس محظوراً*`);
        }
        return;
    }
    
    if (!global.database) global.database = {};
    if (!global.database.ban) global.database.ban = {};
    
    global.database.ban[target] = true;
    database1.ban[target] = true;
    fs.writeFileSync(filePath, JSON.stringify(database1, null, 2));
    conn.sendMessage(m.chat, { text: `*✅ ~تم حظر @${target.split('@')[0]}*\n> *_مش هيعرف يكلم البوت تاني_*`, mentions: [target] }, { quoted: m })
};
ff.usage = ["حظر", "فك_حظر"]
ff.category = "owner";
ff.command = ["حظر", "فك_حظر", "الغاء_الحظر"];
ff.owner = true;
export default ff;