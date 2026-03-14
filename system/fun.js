import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import axios from "axios";
import FormData from 'form-data';
import { fileTypeFromBuffer } from "file-type";

const execAsync = promisify(exec);
const tmp = path.join(process.cwd(), "tmp");

if (!fs.existsSync(tmp)) {
    fs.mkdirSync(tmp, { recursive: true });
}

/* ========== GIF TO MP4 ========= */

async function gifToMp4(url) {
    const id = Date.now();
    const gifPath = path.join(tmp, `${id}.gif`);
    const mp4Path = path.join(tmp, `${id}.mp4`);
    
    const writer = fs.createWriteStream(gifPath);
    const res = await axios({ url, responseType: 'stream' });
    res.data.pipe(writer);
    await new Promise(r => writer.on('finish', r));
    
    await execAsync(`ffmpeg -i "${gifPath}" -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -pix_fmt yuv420p "${mp4Path}"`);
    
    const buffer = fs.readFileSync(mp4Path);
    fs.unlinkSync(gifPath);
    fs.unlinkSync(mp4Path);
    
    return buffer;
}

/* =========== CatBox =========== */

async function uploadToCatbox(buffer) {
    const type = await fileTypeFromBuffer(buffer);
    const mime = type ? type.mime : 'application/octet-stream';
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, {
        filename: `${Date.now()}.${type.ext}`,
        contentType: mime
    });

    const response = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: form.getHeaders(),
    });

    if (!response.data || !response.data.includes('catbox')) {
        throw new Error('upload failed');
    }

    return response.data.trim();
}

export { gifToMp4, uploadToCatbox };