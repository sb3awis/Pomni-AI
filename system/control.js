/* 
لو عايز أشيل واحده منهم زي الترحيب ادي ل if بتاعها return اديلو أي قيمة موجب زي true أو حتي string 
========================
you wanna disable one of them (like the welcome), just make its if return something positive like true or even a string.
*/

import fs from "fs";
import path from "path";

const group = async (ctx, event, eventType) => {
  try {
    if (!event || !event.participants) return null;

    const participants = event.participants.filter(p => p?.phoneNumber).map(p => p.phoneNumber);
    const author = event.author;
    let txt;

    const users = participants.length ? participants.map(p => '@' + p.split('@')[0]).join(' and ') : 'No users';
    const authorTag = author ? '@' + author.split('@')[0] : 'Unknown';

    if (eventType === "add") txt = `♡゙ مـنـور/ه ${users}\nby ${authorTag}`;
    else if (eventType === "remove") txt = `${users} تم إزالته من الجروب\nby ${authorTag}`;
    else if (eventType === "promote") txt = `♡゙ مـبـروك الادمـن ${users}\nby ${authorTag}`;
    else if (eventType === "demote") txt = `♡゙ بـقـيـت عـضـو خـلاص ${users}\nby ${authorTag}`;
    else return null;
    
   
        const filePath = path.join(process.cwd(), 'system', 'database.json');
        const data = fs.readFileSync(filePath, 'utf8');
        const database = JSON.parse(data);
        if (database.settings[event.chat].noWelcome) return 99999 

    await ctx.sock.msgUrl(event.chat, txt, {
      img: ["remove", "add"].includes(eventType) ? (event.userUrl || "https://files.catbox.moe/hm9iq4.jpg") : "https://files.catbox.moe/hm9iq4.jpg",
      title: ctx.config?.info.namebot || "WhatsApp Bot",
      body: "A simple WhatsApp bot for beginners, by VENOM",
      mentions: author ? [author, ...participants] : participants,
      newsletter: {
      name: '𝐕𝐈𝐈7 ~ 𝐂𝐡𝐚𝐧𝐧𝐞𝐥 🕷️',
      jid: '120363225356834044@newsletter'
    },
      big: ["remove", "add"].includes(eventType)
    });
  } catch (e) {
    console.error(e);
  }
  return null;
};

const access = async (msg, checkType, time) => {
  const msgs = {
    cooldown: `*♡⏳ استنى ${time || 'بعض كام ثانيه'} ثانية وكمل الأمر ⏳♡*`,
    owner: "*♡ 🇩🇪 الأمر ده لـ المطورين فقط 🇩🇪♡*",
    group: "*♡💠 الأمر ده بيشتغل بس ف الجروبات 💠♡*",
    admin: "*♡📯 الأمر ده لـ الادمن فقط 📯♡*",
    private: "*♡🏷️ الأمر ده في الخاص فقط 🏷️♡*",
    botAdmin: "*♡📌 لازم اكون ادمن عشان انقذ الأمر 📌♡*",
    disabled: "*♡🗃️ الامر متوقف (تحت صيانة) 🗃️♡*",
    error: "*♡❌ الأمر فيه خطأ، كلم المطورين ❌♡*"
  };
  if (msg.reply && msgs[checkType]) await msg.reply(msgs[checkType]);
  return null;
};

export { access, group };