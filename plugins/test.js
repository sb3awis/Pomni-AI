export default {
  command: [">", "=>"],
  description: "Code to test the rest of the codes",
  usePrefix: false,
  async execute(m, { bot, conn }) {
    try {
      const { format } = await import('util')
      
      const body = m.text || ''
      
      if (!body) return m.reply('❌ Please write code to test')
      
      const codeText = body.replace(/^(>|=>)\s+/, '').trim()
      if (!codeText) return m.reply('❌ Please write code to test')
      
      let result
      let syntaxError = ''
      
      try {
        const hasReturn = /\breturn\b/.test(codeText)
        const lines = codeText.trim().split('\n')
        let processedCode = codeText
        
        if (!hasReturn && lines.length > 0) {
          if (lines.length === 1) {
            processedCode = `return ${codeText}`
          } else if (!lines[lines.length - 1].startsWith('return')) {
            lines[lines.length - 1] = `return ${lines[lines.length - 1]}`
            processedCode = lines.join('\n')
          }
        }
        
        const exec = new (async () => {}).constructor(
          'print',
          'conn',
          'bot',
          'reply',
          'm',
          'Array',
          'process',
          'require',
          processedCode
        )
        
        const customPrint = (...args) => {
          console.log(...args)
          m.reply(format(...args))
        }
        
        const customRequire = (mod) => {
          if (mod === '@whiskeysockets/baileys') {
            return import('@whiskeysockets/baileys')
          }
          return require(mod)
        }
        
        result = await exec.call(
          conn,
          customPrint,
          conn,
          bot,
          m.reply.bind(m),
          m,
          CustomArray,
          process,
          customRequire
        )
      } catch (e) {
        result = e.message || e.toString()
        try {
          new Function(codeText)
        } catch (error) {
          syntaxError = '```' + error.toString() + '```\n\n'
        }
      }
      
      const output = syntaxError + format(result)
      await m.reply(output)
    } catch (err) {
      await m.reply(`❌ Error:\n${err.message}`)
    }
  }
}

class CustomArray extends Array {
  constructor(...args) {
    if (typeof args[0] == 'number') {
      return super(Math.min(args[0], 10000))
    }
    return super(...args)
  }
}