import { Client } from 'whatsappy';
import { group, access } from "./system/control.js";

/* =========== client ======== */

const client = new Client({
  phoneNumber: '201554582851',
  info: { 
  nameBot: "Pomni AI", 
  nameChannel: "𝐕𝐈𝐈7 ~ 𝐂𝐡𝐚𝐧𝐧𝐞𝐥 🕷️", 
  idChannel: "120363225356834044@newsletter"
},
  fromMe: false,
  showLogs: true,
  commandsPath: './plugins',
  prefix: [".", "/", "!"],
  owners: [
  // Owner 1
      { name: "VA",
      lid: "247579682029763@lid", jid: "201066826750@s.whatsapp.net" },
      
  // Owner 2
      { name: "emam",
       lid: "221307316789354@lid", jid: "201144480436@s.whatsapp.net" },
       
  // Owner 3
      { name: "Sukuna", 
      jid: "201033024135@s.whatsapp.net", lid: "50414477168824@lid" }
  ],
  autoReconnect: true,
  printQR: false,
  markOnline: true,
});

client.onGroupEvent(group)
client.onCommandAccess(access);


/* =========== function start ======== */
client.start();
