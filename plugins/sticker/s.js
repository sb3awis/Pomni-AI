import { Sticker, StickerTypes } from "wa-sticker-formatter";

const test = async (m, { conn }) => {
  if(!m.quoted) return m.reply("reply?")
  
  const media = await m.quoted.download();

  const stickerConfig = {
    pack: "ڤـ ـ VA ـ ــا",  
    author: "VA",
    quality: 100,
    type: iStickerTypes.FULL
  };

  const sticker = new Sticker(media, stickerConfig);
  const buffer = await sticker.toBuffer();

  await conn.sendMessage(
    m.chat,
    { sticker: buffer },
    { quoted: m }
  );
};

test.usage = ["ملصق"]
test.command = ["ملصق", "s"]
test.category = "sticker";
export default test;