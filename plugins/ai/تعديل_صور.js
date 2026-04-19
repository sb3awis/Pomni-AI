// • Feature : img2img (editimg) باستخدام catbox
// • New uploader : catbox.moe

import fetch from "node-fetch";
import FormData from "form-data";

// =================== UPLOAD IMAGE via CATBOX ===================
async function uploadToCatbox(buffer) {
    try {
        const form = new FormData();
        form.append("reqtype", "fileupload");
        form.append("fileToUpload", buffer, "image.jpg");

        const res = await fetch("https://catbox.moe/user/api.php", {
            method: "POST",
            body: form,
            headers: form.getHeaders(),
        });

        const url = await res.text();
        if (!url.startsWith("https")) throw new Error("Catbox upload failed");
        return url; // الرابط المباشر
    } catch (e) {
        console.error("Catbox upload error:", e);
        return null;
    }
}
// ===============================================================

const handler = async (m, { conn, text, command }) => {
    try {
        // إصلاح كشف الصورة
        let q = m.quoted ? m.quoted : null;
        let mime = "";

        if (q?.message?.imageMessage) mime = "image/jpeg";
        else if (q?.mimetype) mime = q.mimetype;
        else if (q?.mediaType) mime = q.mediaType;

        if (!q || !mime.startsWith("image")) {
            return m.reply(
                `❌ *يجب الرد على صورة*\n\nمثال:\n${"."}${command} اجعل الخلفية زرقاء`
            );
        }

        if (!text)
            return m.reply(
                `⚠️ أدخل وصف التعديل!\nمثال:\n${"."}${command} اجعل الصورة واقعية`
            );

        const loadingMsg = await conn.sendMessage(m.chat, {
            text: `⏳ *جاري رفع الصورة إلى Catbox…*`,
        });

        // تحميل صورة الرد
        const imageBuffer = await q.download();

        // رفع عبر Catbox
        const catboxUrl = await uploadToCatbox(imageBuffer);
        if (!catboxUrl) {
            await conn.sendMessage(m.chat, { delete: loadingMsg.key });
            return m.reply("❌ فشل رفع الصورة إلى Catbox!");
        }

        await conn.sendMessage(m.chat, {
            text: `⏳ *OK! الآن يتم تعديل الصورة…*\nPrompt: "${text}"`,
        });

        // API الجديد v2
        const apiUrl = `https://api.nekolabs.web.id/image-generation/nano-banana/v2?prompt=${encodeURIComponent(
            text
        )}&imageUrl=${encodeURIComponent(catboxUrl)}`;

        const res = await fetch(apiUrl);
        const json = await res.json();

        if (!json || !json.result) {
            throw new Error(json?.message || "لم يتم الحصول على الصورة المعدلة.");
        }

        // تحميل الصورة الجديدة
        const imgRes = await fetch(json.result);
        const resultBuffer = await imgRes.buffer();

        // إرسال النتيجة
        await conn.sendMessage(
            m.chat,
            {
                image: resultBuffer,
                caption: `✨ *AI Image Result*\nPrompt: ${text}`,
            },
            { quoted: m }
        );

        await conn.sendMessage(m.chat, { delete: loadingMsg.key });
    } catch (e) {
        console.error("IMG2IMG Error:", e);
        m.reply(`❌ *فشل تعديل الصورة!*\n\nخطأ: ${e.message}`);
    }
};

handler.help = ["img2img"];
handler.category = 'ai';


export default handler;

handler.command = ["img2img"];
