const MENU_TIMEOUT = 120000;

const CATEGORIES = [
  [1, 
  'التـحـمـيـل 📂',
  'downloads'
   ],
  [2, 
  'الـمـجـمـوعـات 🐞', 
  'group'
  ],
  [3, 
  'الـمـلـصـقـات 🌄', 
  'sticker'
  ],
  [4, 
  'الـمـطـوريـن 🇩🇪', 
  'owner'
  ],
  [5, 
  'امـثـلـه ✳️', 
  'example'
  ],
  [6, 
  'الـادوات 🚀', 
  'tools'
  ],
  [7, 
  'الـبـحـث 🌐', 
  'search'
  ],
  [8, 
  'الادمــن 👨🏻‍⚖️', 
  'admin'
  ],
  [9, 
  'الالــعـاب 🎮', 
  'games'
  ],
  [10, 
  'الچيف ✴️', 
  'gif'
  ],
  [11, 
  'أخــرى 🌹', 
  'other']
];

const getCat = (num) => CATEGORIES.find(c => c[0] === num);

if (!global.menus) global.menus = {};

const cleanExpired = () => {
  const now = Date.now();
  Object.keys(global.menus).forEach(key => {
    if (now - global.menus[key].time > MENU_TIMEOUT) {
      delete global.menus[key];
    }
  });
};

const menu = async (m, { conn, bot }) => {
  cleanExpired();
  
  const cmds = await bot.getAllCommands();
  const cats = {};
  
  cmds.forEach(c => {
    if (!c.usage?.length) return;
    const cat = c.category || 'other';
    if (!cats[cat]) cats[cat] = [];
    cats[cat].push(c);
  });

  const txt = `
رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ
وَلَا تَجْعَلْ فِي قُلُوبِنَا غِلًّا لِّلَّذِينَ آمَنُوا رَبَّنَا إِنَّكَ رَءُوفٌ رَّحِيمٌ
╭─┈─┈─┈─⟞🌷⟝─┈─┈─┈─╮
` + 
    CATEGORIES.map(c => `┃ ⌯︙${c[0]} ~ *قـسـم \`${c[1]}\`*`).join('\n') +
    '\n╰─┈─┈─┈─⟞🌷⟝─┈─┈─┈─╯\n> *رد عـلـي الـرسـالـه بـ رقـم الـقـسـم فـقـط بـدون نـقـطـه*';

  const msg = await conn.sendMessage(m.chat, { 
    text: txt,
    contextInfo: {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardingScore: 1,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363225356834044@newsletter',
            newsletterName: '𝐕𝐈𝐈7 ~ 𝐂𝐡𝐚𝐧𝐧𝐞𝐥 🕷️',
            serverMessageId: 0
        },
        externalAdReply: {
            title: "𝘗𝘰𝘮𝘯𝘪 𝘈𝘐 𝘪𝘴 𝘢 𝘞𝘩𝘢𝘵𝘴𝘈𝘱𝘱 𝘣𝘰𝘵 𝘧𝘳𝘰𝘮 𝘵𝘩𝘦 𝘝𝘐𝘐7𝘓𝘐𝘕𝘒 𝘓𝘪𝘣𝘳𝘢𝘳𝘺",
            body: "𝑇𝒉𝑒 𝑏𝑜𝑡 𝑖𝑠 𝑠𝑖𝑚𝑝𝑙𝑒 𝑡𝑜 𝑚𝑜𝑑𝑖𝑓𝑦",
            thumbnailUrl: ["https://g.top4top.io/p_3700yob0b1.jpg", "https://h.top4top.io/p_37009f24s1.jpg", "https://i.top4top.io/p_37000qovy1.jpg", "https://j.top4top.io/p_3700ui6cl1.jpg"][Math.floor(Math.random() * 4)],
            sourceUrl: '',
            mediaType: 1,
            renderLargerThumbnail: true
        }
    }
});

  
  global.menus[msg.key.id] = {
    cats: cats,
    chatId: m.chat,
    time: Date.now()
  };
};

menu.before = async (m, { conn }) => {
  cleanExpired();
  
  const quoted = m.quoted?.id;
  const menu = global.menus[quoted];
  if (!menu) return false;
  
  const num = parseInt(m.text);
  const cat = getCat(num);
  
  if (!cat) {
    await conn.sendMessage(m.chat, { text: '*❌≥ اختار رقم من القائمة بس*' });
    return true;
  }
  
  const cmds = menu.cats[cat[2]];
  if (!cmds?.length) {
    await conn.sendMessage(m.chat, { text: '*❌≥ القسم فاضي*' });
    return true;
  }
  
  await conn.sendMessage(m.chat, { 
    delete: { remoteJid: m.chat, id: quoted, fromMe: true } });
  delete global.menus[quoted];
  
await conn.sendMessage(m.chat, { 
    text: `
╭─┈─┈─┈─⟞🗃️⟝─┈─┈─┈─╮
┃ *⌯︙ قـسـم ${cat[1]}*
╰─┈─┈─┈─⟞🗃️⟝─┈─┈─┈─╯

${cmds.map((c, i) => `┃🐞 /${c.usage.join("\n┃🐞 /")}`).join('\n')}

╭─┈─┈─┈─⟞🗃️⟝─┈─┈─┈─╮
┃ *⌯︙𝐕𝐈𝐈7 ~ 𝐏𝐨𝐦𝐧𝐢 🧮*
╰─┈─┈─┈─⟞🗃️⟝─┈─┈─┈─╯
> *رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا*
`.trim(),
    contextInfo: {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardingScore: 1,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363225356834044@newsletter',
            newsletterName: '𝐕𝐈𝐈7 ~ 𝐂𝐡𝐚𝐧𝐧𝐞𝐥 🕷️',
            serverMessageId: 0
        },
        externalAdReply: {
            title: "𝘗𝘰𝘮𝘯𝘪 𝘈𝘐 𝘪𝘴 𝘢 𝘞𝘩𝘢𝘵𝘴𝘈𝘱𝘱 𝘣𝘰𝘵 𝘧𝘳𝘰𝘮 𝘵𝘩𝘦 𝘝𝘐𝘐7𝘓𝘐𝘕𝘒 𝘓𝘪𝘣𝘳𝘢𝘳𝘺",
            body: "𝑇𝒉𝑒 𝑏𝑜𝑡 𝑖𝑠 𝑠𝑖𝑚𝑝𝑙𝑒 𝑡𝑜 𝑚𝑜𝑑𝑖𝑓𝑦",
            thumbnailUrl: ["https://g.top4top.io/p_3700yob0b1.jpg", "https://h.top4top.io/p_37009f24s1.jpg", "https://i.top4top.io/p_37000qovy1.jpg", "https://j.top4top.io/p_3700ui6cl1.jpg"][Math.floor(Math.random() * 4)],
            sourceUrl: '',
            mediaType: 1,
            renderLargerThumbnail: true
        }
    }
});  
  return true;
};

menu.command = ['الاوامر', 'القائمة', 'menu', 'اوامر'];

export default menu;