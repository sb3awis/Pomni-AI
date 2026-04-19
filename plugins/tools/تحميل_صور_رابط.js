import fetch from 'node-fetch';
import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';

let handler = async (m, { conn,  command, text }) => {
  try {
    if (!text) {
      const helpMessage = `📷 *أمر تحميل الصور الموحد* 📷

*الاستخدام:* 
${"." + command} <خيار> <رابط/روابط>

*الخيارات المتاحة:*
🔹 *download* - تحميل صورة واحدة بأعلى جودة
🔹 *multi* - تحميل عدة صور مرة واحدة
🔹 *quality* - تحميل بجودة محددة
🔹 *info* - عرض معلومات الصورة

*أمثلة:*
${"." + command} download https://example.com/image.jpg
${"." + command} multi رابط1 رابط2 رابط3
${"." + command} quality high https://example.com/image.jpg
${"." + command} info https://example.com/image.jpg

*للجودة:* high (عالية), medium (متوسطة), low (منخفضة)`;
      
      return m.reply(helpMessage);
    }

    const args = text.split(' ');
    const option = args[0].toLowerCase();
    const params = args.slice(1);

    switch (option) {
      case 'download':
        await handleDownload(m, conn, params);
        break;
      
      case 'multi':
        await handleMultiDownload(m, conn, params);
        break;
      
      case 'quality':
        await handleQualityDownload(m, conn, params);
        break;
      
      case 'info':
        await handleImageInfo(m, conn, params);
        break;
      
      default:
        m.reply(`❌ *خيار غير صالح!*\nاستخدم: download, multi, quality, info\n\nمثال: ${"." + command} download https://example.com/image.jpg`);
    }
    
  } catch (error) {
    console.error('Error:', error);
    m.reply(`❌ *خطأ:* ${error.message || error}`);
  }
}

// دالة التحميل العادي
async function handleDownload(m, conn, params) {
  if (params.length === 0) throw '📷 *يرجى تقديم رابط الصورة*';
  
  const url = params[0];
  m.reply('⏳ جاري تحميل الصورة بأعلى جودة...');
  
  const response = await fetch(url);
  if (!response.ok) throw '❌ فشل في تحميل الصورة من الرابط';
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.startsWith('image/')) {
    throw '❌ الرابط لا يشير إلى صورة صالحة';
  }
  
  const buffer = await response.arrayBuffer();
  const imageBuffer = Buffer.from(buffer);
  const fileType = await fileTypeFromBuffer(imageBuffer);
  const extension = fileType ? fileType.ext : 'jpg';
  const filename = `downloaded_${Date.now()}.${extension}`;
  
  await conn.sendMessage(m.chat, {
    image: imageBuffer,
    caption: `✅ *تم التحميل بنجاح!*\n📊 *الحجم:* ${(imageBuffer.length / 1024).toFixed(2)} KB\n🎯 *الجودة:* أعلى جودة\n📁 *الصيغة:* ${extension.toUpperCase()}`,
    fileName: filename,
    mimetype: contentType
  }, { quoted: m });
}

// دالة التحميل الجماعي
async function handleMultiDownload(m, conn, params) {
  if (params.length === 0) throw '📷 *يرجى تقديم روابط الصور*';
  
  const urls = params.filter(url => url.startsWith('http'));
  if (urls.length === 0) throw '❌ لم يتم العثور على روابط صالحة';
  if (urls.length > 5) throw '❌ الحد الأقصى 5 صور في المرة الواحدة';
  
  m.reply(`⏳ جاري تحميل ${urls.length} صورة بأعلى جودة...`);
  
  let successCount = 0;
  let errorMessages = [];
  
  for (let i = 0; i < urls.length; i++) {
    try {
      const response = await fetch(urls[i]);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        const imageBuffer = Buffer.from(buffer);
        
        await conn.sendMessage(m.chat, {
          image: imageBuffer,
          caption: `🖼️ *الصورة ${i + 1}/${urls.length}*`
        }, { quoted: i === 0 ? m : null });
        
        successCount++;
        
        // تأخير بين الصور
        if (i < urls.length - 1) await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        errorMessages.push(`❌ الرابط ${i + 1}: خطأ ${response.status}`);
      }
    } catch (error) {
      errorMessages.push(`❌ الرابط ${i + 1}: ${error.message}`);
    }
  }
  
  let resultMessage = `✅ *تم الانتهاء!*\n📊 *نجح:* ${successCount}/${urls.length}`;
  if (errorMessages.length > 0) {
    resultMessage += `\n\n❌ *الأخطاء:*\n${errorMessages.join('\n')}`;
  }
  
  m.reply(resultMessage);
}

// دالة التحميل بجودة محددة
async function handleQualityDownload(m, conn, params) {
  if (params.length < 2) throw '📷 *استخدام:* quality [high|medium|low] [رابط]';
  
  const quality = params[0].toLowerCase();
  const url = params.slice(1).join(' ');
  
  const qualities = {
    'high': { quality: 100, width: null, label: 'عالية' },
    'medium': { quality: 75, width: 1280, label: 'متوسطة' },
    'low': { quality: 50, width: 800, label: 'منخفضة' }
  };
  
  if (!qualities[quality]) throw '❌ جودة غير صالحة. استخدم: high, medium, low';
  
  m.reply(`⏳ جاري تحميل الصورة بجودة ${qualities[quality].label}...`);
  
  const response = await fetch(url);
  if (!response.ok) throw '❌ فشل في تحميل الصورة';
  
  const buffer = await response.arrayBuffer();
  let imageBuffer = Buffer.from(buffer);
  const originalSize = imageBuffer.length;
  
  // معالجة الجودة إذا لم تكن عالية
  if (quality !== 'high') {
    const config = qualities[quality];
    let sharpInstance = sharp(imageBuffer);
    
    if (config.width) {
      sharpInstance = sharpInstance.resize(config.width, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      });
    }
    
    imageBuffer = await sharpInstance
      .jpeg({ 
        quality: config.quality,
        mozjpeg: true 
      })
      .toBuffer();
  }
  
  const qualityInfo = qualities[quality];
  const sizeReduction = ((originalSize - imageBuffer.length) / originalSize * 100).toFixed(1);
  
  await conn.sendMessage(m.chat, {
    image: imageBuffer,
    caption: `✅ *تم التحميل بنجاح!*\n🎯 *الجودة:* ${qualityInfo.label}\n📊 *الحجم:* ${(imageBuffer.length / 1024).toFixed(2)} KB\n📉 *التخفيض:* ${quality !== 'high' ? sizeReduction + '%' : '0%'}`
  }, { quoted: m });
}

// دالة معلومات الصورة
async function handleImageInfo(m, conn, params) {
  if (params.length === 0) throw '📷 *يرجى تقديم رابط الصورة*';
  
  const url = params[0];
  m.reply('⏳ جاري تحليل معلومات الصورة...');
  
  const response = await fetch(url);
  if (!response.ok) throw '❌ فشل في تحميل الصورة';
  
  const buffer = await response.arrayBuffer();
  const imageBuffer = Buffer.from(buffer);
  const fileType = await fileTypeFromBuffer(imageBuffer);
  
  let metadata;
  try {
    metadata = await sharp(imageBuffer).metadata();
  } catch (error) {
    metadata = { width: 'غير معروف', height: 'غير معروف', format: 'غير معروف' };
  }
  
  const infoMessage = `📊 *معلومات الصورة التفصيلية*\n\n` +
    `📁 *نوع الملف:* ${fileType ? fileType.mime : 'غير معروف'}\n` +
    `📏 *الأبعاد:* ${metadata.width} × ${metadata.height} بكسل\n` +
    `💾 *الحجم:* ${(imageBuffer.length / 1024).toFixed(2)} KB\n` +
    `🎯 *القنوات:* ${metadata.channels || 'غير معروف'}\n` +
    `📈 *التنسيق:* ${metadata.format ? metadata.format.toUpperCase() : 'غير معروف'}\n` +
    `🖼️ *المساحة:* ${metadata.width && metadata.height ? (metadata.width * metadata.height).toLocaleString() : 'غير معروف'} بكسل`;
  
  await conn.sendMessage(m.chat, {
    image: imageBuffer,
    caption: infoMessage
  }, { quoted: m });
}

handler.help = ['تحميل'];
handler.category = 'tools';
handler.command = ['تحميل', 'download', 'صور'];
handler.limit = false;

export default handler;
handler.command = ["تحميل"];
