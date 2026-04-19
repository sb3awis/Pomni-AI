let marriages = new Map(); // تخزين معلومات الزواج

const marriageDivorceHandler = {
  async marry(m, { conn, participants }) {
    try {
      let sender = m.sender;
      // استخراج الشخص الممنشن بالطريقة الصحيحة
      let mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      let spouse = mentioned[0];

      if (spouse) {
        // التحقق من عدم الزواج من البوت
        if (spouse.includes(conn.user.jid.split('@')[0])) {
          return await conn.reply(m.chat, '⚠️ لا يمكنك الزواج من البوت!', m);
        }

        // التحقق من أن الشخص غير متزوج
        if (marriages.has(sender)) {
          return await conn.reply(m.chat, '⚠️ أنت متزوج بالفعل! استخدم .طلقني أولا', m);
        }
        if (marriages.has(spouse)) {
          return await conn.reply(m.chat, '⚠️ هذا الشخص متزوج بالفعل!', m);
        }

        // تخزين معلومات الزواج
        marriages.set(sender, { spouse, timestamp: Date.now() });
        marriages.set(spouse, { spouse: sender, timestamp: Date.now() });

        let marriageMessage = `
*🎊 حفل زواج 🎊*

بسم الله الرحمن الرحيم

تم إعلان زواج بين:

💑 @${sender.split('@')[0]} و @${spouse.split('@')[0]}

وفقكم الله وحفظكم وجعل حياتكم سعيدة 💕

يمكنكم الآن إرسال *!طلقني* إذا أردتم الانفصال
        `;

        // إرسال صوت الزواج
        await conn.sendMessage(m.chat,
          { audio: { url: 'https://files.catbox.moe/4a9bo6.mp3' },
            mimetype: 'audio/mp4',
            ptt: false
          },
          { quoted: m }
        );

        return await conn.sendMessage(m.chat,
          { text: marriageMessage, mentions: [sender, spouse] },
          { quoted: m }
        );
      }

      // إذا ما فيش منشن: اختيار عشوائي
      let chatParticipants = participants.map(u => u.id);
      let eligibleParticipants = chatParticipants.filter(
        user => user !== sender &&
               !user.includes(conn.user.jid.split('@')[0]) &&
               !marriages.has(user));

      if (eligibleParticipants.length < 1) {
        return await conn.reply(m.chat, '⚠️ لا يوجد أشخاص متاحين للزواج في المجموعة!', m);
      }

      let randomIndex = Math.floor(Math.random() * eligibleParticipants.length);
      spouse = eligibleParticipants[randomIndex];

      marriages.set(sender, { spouse, timestamp: Date.now() });
      marriages.set(spouse, { spouse: sender, timestamp: Date.now() });

      let marriageMessage = `
*🎊 حفل زواج 🎊*

بسم الله الرحمن الرحيم

تم إعلان زواج بين:

💑 @${sender.split('@')[0]} و @${spouse.split('@')[0]}

وفقكم الله وحفظكم وجعل حياتكم سعيدة 💕

يمكنكم الآن إرسال *!طلقني* إذا أردتم الانفصال
      `;

      await conn.sendMessage(m.chat,
        { audio: { url: 'https://files.catbox.moe/4a9bo6.mp3' },
          mimetype: 'audio/mp4',
          ptt: false
        },
        { quoted: m }
      );

      return await conn.sendMessage(m.chat,
        { text: marriageMessage, mentions: [sender, spouse] },
        { quoted: m }
      );

    } catch (error) {
      console.error('Error in marry function:', error);
      return await conn.reply(m.chat, '⚠️ حدث خطأ أثناء تنفيذ الأمر، يرجى المحاولة لاحقاً', m);
    }
  },

  async divorce(m, { conn }) {
    try {
      if (!marriages.has(m.sender)) {
        return await conn.reply(m.chat, '⚠️ أنت غير متزوج حالياً!', m);
      }

      const marriageInfo = marriages.get(m.sender);
      const { spouse, timestamp } = marriageInfo;

      const marriageDuration = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
      const durationText = marriageDuration > 0 ? `${marriageDuration} يوم` : 'أقل من يوم';

      let divorceMessage = `
*💔 وثيقة طلاق 💔*

بسم الله الرحمن الرحيم

تم الإعلان عن الطلاق بين:

@${m.sender.split('@')[0]} و @${spouse.split('@')[0]}

بعد زواج استمر لمدة ${durationText}

الله يصلح الحال ويعوضكم خيراً 🌹
      `;

      await conn.sendMessage(m.chat,
        { audio: { url: 'https://files.catbox.moe/z51omq.mp3' },
          mimetype: 'audio/mp4',
          ptt: false
        },
        { quoted: m }
      );

      await conn.sendMessage(m.chat,
        { text: divorceMessage, mentions: [m.sender, spouse] },
        { quoted: m }
      );

      marriages.delete(m.sender);
      marriages.delete(spouse);
    } catch (error) {
      console.error('Error in divorce function:', error);
      return await conn.reply(m.chat, '⚠️ حدث خطأ أثناء تنفيذ الأمر، يرجى المحاولة لاحقاً', m);
    }
  }
}

let handler = async (m, { conn, participants, command }) => {
  try {
    if (command === 'زوجني' || command === 'زوّجني') {
      await marriageDivorceHandler.marry(m, { conn, participants });
    } else if (command === 'طلقني') {
      await marriageDivorceHandler.divorce(m, { conn });
    }
  } catch (error) {
    console.error('Error in handler:', error);
    await conn.reply(m.chat, '⚠️ حدث خطأ في النظام، يرجى المحاولة لاحقاً', m);
  }
}

handler.help = ['زوجني @منشن', 'طلقني'];
handler.category = 'fun';

handler.group = true;

export default handler;

handler.command = ["زوجني","طلقني"];
