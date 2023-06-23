const { Scenes, session, Telegraf, Markup } = require('telegraf');
require('dotenv').config();
const bot = new Telegraf(process.env.BOT_TOKEN);
module.exports = {Markup}
const { main_keyboards, predloj_keyboards, predloj_senderinfo, predloj_senderonv, links, dlinks, vpacks, bpacks, pxtpacks, bpxtpacks, reklam_keyboards, uslugi_keyboards, uslug_svedm_keyboards, uslug_beats_keyboards, lisenziya } = require('./additions/markups.js') 
const { beatsinfo, svedinfo } = require('./additions/extra.js')
const { collection, ObjectId } = require('./additions/db');
// bot.telegram.setWebhook('https://zade-production.up.railway.app', {max_connections: 50});
// const { DateTime } = require('luxon');
const { enter, leave } = Scenes.Stage;

const predlojka = new Scenes.BaseScene("predlojka");

predlojka.enter(async ctx => {
    try {
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {predlojawaitforfiles: false, predmsg: 'null'}})
        return await ctx.reply('🥔 Предложите свою новость, отправить мем, идею для видео, или задайте мне вопрос: ', {reply_markup: {keyboard: [['Отменить 🔴']], resize_keyboard: true}})
    } catch (e) {
        console.error(e);
    }
})

predlojka.on('text', async ctx => {
    try {
        const db = await collection.findOne({user_id: ctx.from.id})
        if(db.predmsg != 'null') return await ctx.reply('➕ Вы хотите прикрепить файлы?')
        if(ctx.message.text == 'Отменить 🔴') {
            await ctx.reply('Отменено ✅', {reply_markup: {remove_keyboard: true}})
            await ctx.replyWithPhoto('AgACAgIAAxkBAAIBQGRwpdUHgsO-VzXinFdsqtt53IflAAJcyzEb3-yIS8NvKBi2G2GKAQADAgADeAADLwQ', {caption: `Привет, ${ctx.from.first_name}! Я бот Потэйтоса ✨\n\nЕсли у тебя есть какие-то вопросы, пожелания или предложения - ты можешь описать их здесь 💬\n\nВыберите действие из списка👇🏻`, reply_markup: {inline_keyboard: main_keyboards}})
            return ctx.scene.leave('predlojka')
        }

        await ctx.reply('Обработка...', {reply_markup: {remove_keyboard: true}})
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {predlmsg: ctx.message.message_id, predmsg: ctx.message.text, predlojfiles: []}})
        await ctx.reply('Хотите прикрепить файлы?\nВы можете прикрепить один файл ➕', {reply_to_message_id: ctx.message.message_id, reply_markup: {inline_keyboard: [[Markup.button.callback('➕ Добавить', 'predlojaddfile')], [Markup.button.callback('📩 Отправить', 'predlojsend')]]}})
        // await ctx.reply('Вы уверены что хотите отправить вами написанное предложение выше?', {reply_to_message_id: ctx.message.message_id, reply_markup: {inline_keyboard: predloj_keyboards}})
    } catch (e) {
        console.error(e);
    }
})

predlojka.action('predlojaddfile', async ctx => {
    try {
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await ctx.reply('Отправьте файл:')
        const db = await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {predlojawaitforfiles: true}})
    } catch (e) {
        console.error(e);
    }
})

predlojka.action('predlojsend', async ctx => {
    try {
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await ctx.scene.enter('predlojkasend')
        await ctx.answerCbQuery('Отправляю...', {show_alert: false})
    } catch (e) {
        console.error(e);
    }
})

predlojka.action('predlojcanc', async ctx => {
    try {
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await ctx.reply('Отменено ✅')
        await ctx.replyWithPhoto('AgACAgIAAxkBAAIBQGRwpdUHgsO-VzXinFdsqtt53IflAAJcyzEb3-yIS8NvKBi2G2GKAQADAgADeAADLwQ', {caption: `Привет, ${ctx.from.first_name}! Я бот Потэйтоса ✨\n\nЕсли у тебя есть какие-то вопросы, пожелания или предложения - ты можешь описать их здесь 💬\n\nВыберите действие из списка👇🏻`, reply_markup: {inline_keyboard: main_keyboards}})
        return ctx.scene.leave('predlojka')
    } catch (e) {
        console.error(e);
    }
})

predlojka.on('photo', async ctx => {
    try {
        const db = await collection.findOne({user_id: ctx.from.id})
        if(db.predmsg == 'null') return await ctx.reply('⚠️ Введите текст, а позже сможете прикрепить файлы: ')
        if(db.predlojawaitforfiles == true) {
            await collection.findOneAndUpdate({user_id: ctx.from.id}, {$push: {predlojfiles: {file_id: ctx.message.photo.pop().file_id, type: 'photo'}}, $set: {predlojawaitforfiles: false}})
            await ctx.reply('📩 Выберите действие:', {reply_markup: {inline_keyboard: [[Markup.button.callback('📩 Отправить', 'predlojsend')], [Markup.button.callback('🔴 Отменить', 'predlojcanc')]]}})
        }
    } catch (e) {
        console.error(e);
    }
})

predlojka.on('audio', async ctx => {
    try {
        const db = await collection.findOne({user_id: ctx.from.id})
        if(db.predmsg == 'null') return await ctx.reply('⚠️ Введите текст, а позже сможете прикрепить файлы: ')
        if(db.predlojawaitforfiles == true) {
            await collection.findOneAndUpdate({user_id: ctx.from.id}, {$push: {predlojfiles: {file_id: ctx.message.audio.file_id, type: 'audio'}}, $set: {predlojawaitforfiles: false}})
            await ctx.reply('📩 Выберите действие:', {reply_markup: {inline_keyboard: [[Markup.button.callback('📩 Отправить', 'predlojsend')], [Markup.button.callback('🔴 Отменить', 'predlojcanc')]]}})
        }
    } catch (e) {
        console.error(e);
    }
})

predlojka.on('document', async ctx => {
    try {
        const db = await collection.findOne({user_id: ctx.from.id})
        if(db.predmsg == 'null') return await ctx.reply('⚠️ Введите текст, а позже сможете прикрепить файлы: ')
        if(db.predlojawaitforfiles == true) {
            await collection.findOneAndUpdate({user_id: ctx.from.id}, {$push: {predlojfiles: {file_id: ctx.message.document.file_id, type: 'document'}}, $set: {predlojawaitforfiles: false}})
            await ctx.reply('📩 Выберите действие:', {reply_markup: {inline_keyboard: [[Markup.button.callback('📩 Отправить', 'predlojsend')], [Markup.button.callback('🔴 Отменить', 'predlojcanc')]]}})
        }
    } catch (e) {
        console.error(e);
    }
})

predlojka.on('voice', async ctx => {
    try {
        const db = await collection.findOne({user_id: ctx.from.id})
        if(db.predmsg == 'null') return await ctx.reply('⚠️ Введите текст, а позже сможете прикрепить файлы: ')
        if(db.predlojawaitforfiles == true) {
            await collection.findOneAndUpdate({user_id: ctx.from.id}, {$push: {predlojfiles: {file_id: ctx.message.voice.file_id, type: 'voice'}}, $set: {predlojawaitforfiles: false}})
            await ctx.reply('📩 Выберите действие:', {reply_markup: {inline_keyboard: [[Markup.button.callback('📩 Отправить', 'predlojsend')], [Markup.button.callback('🔴 Отменить', 'predlojcanc')]]}})
        }
    } catch (e) {
        console.error(e);
    }
})

const predlojkasend = new Scenes.BaseScene("predlojkasend");

predlojkasend.enter(async ctx => {
    try {
        const prid = await collection.findOne({_id: new ObjectId('646f07782ec51704c9ff90bd')})
        const predid = prid.predlojids + 1
        const db = await collection.findOne({user_id: ctx.from.id})
        await collection.findOneAndUpdate({_id: new ObjectId('646f07782ec51704c9ff90bd')}, {$set: {predlojids: predid}})
        if(db.predlojfiles.length == 0) {
            await ctx.telegram.sendMessage(1031267639, `${predid}# | Новое сообщение с предложки:\n<i>${db.predmsg}</i>`, {reply_markup: {inline_keyboard: predloj_senderinfo}, parse_mode: "HTML"})
        }else {
            if(db.predlojfiles[0].type == 'photo') {
                await ctx.tg.sendPhoto(1031267639, db.predlojfiles[0].file_id, {caption: `${predid}# | Новое сообщение с предложки:\n<i>${db.predmsg}</i>`, reply_markup: {inline_keyboard: predloj_senderinfo}, parse_mode: "HTML"})
            }else if(db.predlojfiles[0].type == 'audio') {
                await ctx.tg.sendAudio(1031267639, db.predlojfiles[0].file_id, {caption: `${predid}# | Новое сообщение с предложки:\n<i>${db.predmsg}</i>`, reply_markup: {inline_keyboard: predloj_senderinfo}, parse_mode: "HTML"})
            }else if(db.predlojfiles[0].type == 'voice') {
                await ctx.tg.sendVoice(1031267639, db.predlojfiles[0].file_id, {caption: `${predid}# | Новое сообщение с предложки:\n<i>${db.predmsg}</i>`, reply_markup: {inline_keyboard: predloj_senderinfo}, parse_mode: "HTML"})
            }else {
                await ctx.tg.sendDocument(1031267639, db.predlojfiles[0].file_id, {caption: `${predid}# | Новое сообщение с предложки:\n<i>${db.predmsg}</i>`, reply_markup: {inline_keyboard: predloj_senderinfo}, parse_mode: "HTML"})
            }
        }
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {predsend: `${predid}`}})
        await ctx.reply('Отправил ✅', {reply_markup: {inline_keyboard: [[Markup.button.callback('⏮ В меню', 'backtomnscenes')]]}})
        await ctx.scene.leave('predlojkasend')
    } catch (e) {
        console.error(e);
    }
})

const pxtatansw = new Scenes.BaseScene("pxtatansw");

pxtatansw.enter(async ctx => {
    try {
        return await ctx.reply('🥔 Введите ответ к предложке: ')
    } catch (e) {
        console.error(e);
    }
})

pxtatansw.on('text', async ctx => {
    try {
        const db = await collection.findOne({user_id: ctx.from.id})
        try {
            await ctx.telegram.sendMessage(db.usertoansw, '🟢 Потата ответил на ваше предложение:')
            await ctx.telegram.copyMessage(db.usertoansw, ctx.chat.id, ctx.message.message_id) 
        } catch (e) {
            console.log('');
        }
        await collection.findOneAndUpdate({user_id: db.usertoansw}, {$set: {predsend: 'none'}})
        await ctx.reply('Отправил ✅', {reply_markup: {inline_keyboard: [[Markup.button.callback('⏮ В меню', 'backtomnscenes')]]}})
        await ctx.scene.leave('pxtatansw')
    } catch (e) {
        console.error(e);
    }
})

const reklam = new Scenes.BaseScene("reklam");

reklam.enter(async ctx => {
    try {
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {reklam_link: 'null', skipad: 'null', reklam_tzmsg: 'null', reklam_tzfile: 'null', reklam_alrtext: 'null', reklam_date: 'null', waitingforfile: false}})
        return await ctx.reply('🔗 Отправьте ссылку на рекламируемый проект: ', {reply_markup: {keyboard: [['Отменить 🔴']], resize_keyboard: true}})
    } catch (e) {
        console.error(e);
    }
})

reklam.on('text', async ctx => {
    try {
        if (ctx.message.text == 'Отменить 🔴') {
            await ctx.reply('Отменено ✅', {reply_markup: {remove_keyboard: true}})
            await ctx.replyWithPhoto('AgACAgIAAxkBAAIBQGRwpdUHgsO-VzXinFdsqtt53IflAAJcyzEb3-yIS8NvKBi2G2GKAQADAgADeAADLwQ', {caption: `Привет, ${ctx.from.first_name}! Я бот Потэйтоса ✨\n\nЕсли у тебя есть какие-то вопросы, пожелания или предложения - ты можешь описать их здесь 💬\n\nВыберите действие из списка👇🏻`, reply_markup: {inline_keyboard: main_keyboards}})
            return ctx.scene.leave('reklam')
        }
        await ctx.reply('Вношу изменения в анкету 🔄', {reply_markup: {remove_keyboard: true}})
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {reklam_link: `${ctx.message.text}`}})
        await ctx.scene.enter('reklam_st2')
    } catch (e) {
        console.error(e);
    }
})

const reklam_st2 = new Scenes.BaseScene("reklam_st2");

reklam_st2.enter(async ctx => {
    try {
        return await ctx.reply('✍️ Развернуто опишите ваш проект или продукцию, прикрепите ТЗ:', {reply_markup: {keyboard: [['Отменить 🔴']], resize_keyboard: true}})
    } catch (e) {
        console.error(e);
    }
})

reklam_st2.on('text', async ctx => {
    try {
        const db = await collection.findOne({user_id: ctx.from.id})
        if (ctx.message.text == 'Отменить 🔴') {
            try {
                await ctx.deleteMessage(db.skipad)   
            } catch (e) {
                console.log('log id r_2 deleting');
            }
            await ctx.reply('Отменено ✅', {reply_markup: {remove_keyboard: true}})
            await ctx.replyWithPhoto('AgACAgIAAxkBAAIBQGRwpdUHgsO-VzXinFdsqtt53IflAAJcyzEb3-yIS8NvKBi2G2GKAQADAgADeAADLwQ', {caption: `Привет, ${ctx.from.first_name}! Я бот Потэйтоса ✨\n\nЕсли у тебя есть какие-то вопросы, пожелания или предложения - ты можешь описать их здесь 💬\n\nВыберите действие из списка👇🏻`, reply_markup: {inline_keyboard: main_keyboards}})
            return ctx.scene.leave('reklam_st2')
        }
        if(db.reklam_tzmsg != 'null') return

        const skipad = await ctx.reply('Вы хотите прикрепить файлы к описанию?', {reply_markup: {inline_keyboard: [[Markup.button.callback('Добавить файл ➕', 'addfile')], [Markup.button.callback('Продолжить заполнение ⏩', 'skipaddfile')]]}})
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {skipad: skipad.message_id, reklam_tzmsg: ctx.message.text, reklam_tzfile: []}})
    } catch (e) {
        console.error(e);
    }
})

reklam_st2.on('document', async ctx => {
    try {
        const db = await collection.findOne({user_id: ctx.from.id})
        if(db.waitingforfile == false) return
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$push: {reklam_tzfile: ctx.message.document.file_id}})
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {waitingforfile: false}})
        const skipad = await ctx.reply('* Если вы группируете файлы, то я возьму только самый первый файл! Чтобы избежать этого добавляйте файлы по отдельностью ‼️\n\nДобавите ещё?', {reply_markup: {inline_keyboard: [[Markup.button.callback('Добавить файл ➕', 'addfile')], [Markup.button.callback('Продолжить заполнение ⏩', 'skipaddfile')]]}})
    } catch (e) {
        console.error(e);
    }
})

reklam_st2.on('photo', async ctx => {
    try {
        const db = await collection.findOne({user_id: ctx.from.id})
        if(db.waitingforfile == false) return
        return await ctx.reply('⚠️ Извините, я принимаю только документ, отправьте файл без сжатия: ')
    } catch (e) {
        console.error(e);
    }
})

reklam_st2.on('video', async ctx => {
    try {
        const db = await collection.findOne({user_id: ctx.from.id})
        if(db.waitingforfile == false) return
        return await ctx.reply('⚠️ Извините, я принимаю только документ, отправьте файл без сжатия: ')
    } catch (e) {
        console.error(e);
    }
})

reklam_st2.on('audio', async ctx => {
    try {
        const db = await collection.findOne({user_id: ctx.from.id})
        if(db.waitingforfile == false) return
        return await ctx.reply('⚠️ Извините, я принимаю только документ, отправьте файл без сжатия: ')
    } catch (e) {
        console.error(e);
    }
})

reklam_st2.on('voice', async ctx => {
    try {
        const db = await collection.findOne({user_id: ctx.from.id})
        if(db.waitingforfile == false) return
        return await ctx.reply('⚠️ Извините, я принимаю только документ, отправьте файл без сжатия: ')
    } catch (e) {
        console.error(e);
    }
})

reklam_st2.action('addfile', async ctx => {
    try {
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {waitingforfile: true}})
        await ctx.reply('Отправьте файл без сжатия:')
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

reklam_st2.action('skipaddfile', async ctx => {
    try {
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await ctx.reply('Вношу изменения в анкету 🔄', {reply_markup: {remove_keyboard: true}})
        await ctx.scene.enter('reklam_st3')
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

const reklam_st3 = new Scenes.BaseScene("reklam_st3");

reklam_st3.enter(async ctx => {
    try {
        return await ctx.reply('💬 Если у вас есть уже готовый рекламный текст, напишите его здесь, а если нет, то просто напишите "Нет":', {reply_markup: {keyboard: [['Отменить 🔴']], resize_keyboard: true}})
    } catch (e) {
        console.error(e);
    }
})

reklam_st3.on('text', async ctx => {
    try {
        if (ctx.message.text == 'Отменить 🔴') {
            await ctx.reply('Отменено ✅', {reply_markup: {remove_keyboard: true}})
            await ctx.replyWithPhoto('AgACAgIAAxkBAAIBQGRwpdUHgsO-VzXinFdsqtt53IflAAJcyzEb3-yIS8NvKBi2G2GKAQADAgADeAADLwQ', {caption: `Привет, ${ctx.from.first_name}! Я бот Потэйтоса ✨\n\nЕсли у тебя есть какие-то вопросы, пожелания или предложения - ты можешь описать их здесь 💬\n\nВыберите действие из списка👇🏻`, reply_markup: {inline_keyboard: main_keyboards}})
            return ctx.scene.leave('reklam_st3')
        }
        await ctx.reply('Вношу изменения в анкету 🔄', {reply_markup: {remove_keyboard: true}})
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {reklam_alrtext: `${ctx.message.text}`}})
        await ctx.scene.enter('reklam_st4')
    } catch (e) {
        console.error(e);
    }
})

const regex = /^(0[1-9]|[12][0-9]|3[01])\:(0[1-9]|1[0-2])\:\d{4}$/;

function isValidDateFormat(dateString) {
  return regex.test(dateString);
}

const reklam_st4 = new Scenes.BaseScene("reklam_st4");

reklam_st4.enter(async ctx => {
    try {
        return await ctx.reply('🕚 Укажите планируемую дату публикации рекламы в формате (DD:MM:YYYY):', {reply_markup: {keyboard: [['Отменить 🔴']], resize_keyboard: true}})
    } catch (e) {
        console.error(e);
    }
})

reklam_st4.on('text', async ctx => {
    try {
        if (ctx.message.text == 'Отменить 🔴') {
            await ctx.reply('Отменено ✅', {reply_markup: {remove_keyboard: true}})
            await ctx.replyWithPhoto('AgACAgIAAxkBAAIBQGRwpdUHgsO-VzXinFdsqtt53IflAAJcyzEb3-yIS8NvKBi2G2GKAQADAgADeAADLwQ', {caption: `Привет, ${ctx.from.first_name}! Я бот Потэйтоса ✨\n\nЕсли у тебя есть какие-то вопросы, пожелания или предложения - ты можешь описать их здесь 💬\n\nВыберите действие из списка👇🏻`, reply_markup: {inline_keyboard: main_keyboards}})
            return ctx.scene.leave('reklam_st4')
        }
        if(isValidDateFormat(ctx.message.text) == false) return ctx.reply('Пожалуйста введите дату в формате (DD:MM:YYYY), где:\nDD - день\nMM - месяц\nYYYY - год')
        await ctx.reply('Вношу изменения в анкету 🔄', {reply_markup: {remove_keyboard: true}})
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {reklam_date: `${ctx.message.text}`}})
        if(!ctx.from.username) return ctx.scene.enter('reklam_st5')
            
        // Отпрака потейтосу .........
        const db = await collection.findOne({user_id: ctx.from.id})
        if(db.reklam_tzmsg != 'null' && db.reklam_tzfile.length != 0) {
            if(db.reklam_tzfile.length > 1) {
                await ctx.tg.sendMessage(1031267639, `🟢 Новая заявка на рекламу:\n\n<b>Платформа:</b> ${db.reklam_type}\n<b>Пользователь:</b> ${db.user_name}\n<b>Cсылка на рекламируемый проект:</b> ${db.reklam_link}\n<b>Описание проекта и ТЗ:</b> <code>${db.reklam_tzmsg}</code>\n<b>Рекламный текст:</b> <code>${db.reklam_alrtext}</code>\n<b>Желаемая дата:</b> <code>${db.reklam_date}</code>\n\nПрикрепленные файлы ниже ⬇️`, {reply_markup: {inline_keyboard: [[Markup.button.url('Ссылка на профиль пользователя 👤', `https://t.me/${db.user_name.replace('@', '')}`)]]}, parse_mode: 'HTML'})
                let arr = []
                for (let i = 0; i < db.reklam_tzfile.length; i++) {
                    arr.push({type: 'document', media: db.reklam_tzfile[i]})
                }
                await ctx.tg.sendMediaGroup(1031267639, arr)
            }else {
                await ctx.tg.sendDocument(1031267639, db.reklam_tzfile[0], {caption: `🟢 Новая заявка на рекламу:\n\n<b>Платформа:</b> ${db.reklam_type}\n<b>Пользователь:</b> ${db.user_name}\n<b>Cсылка на рекламируемый проект:</b> ${db.reklam_link}\n<b>Описание проекта и ТЗ:</b> <code>${db.reklam_tzmsg}</code>\n<b>Рекламный текст:</b> <code>${db.reklam_alrtext}</code>\n<b>Желаемая дата:</b> <code>${db.reklam_date}</code>`, reply_markup: {inline_keyboard: [[Markup.button.url('Ссылка на профиль пользователя 👤', `https://t.me/${db.user_name.replace('@', '')}`)]]}, parse_mode: 'HTML'})
            }
        }else {
            await ctx.tg.sendMessage(1031267639, `🟢 Новая заявка на рекламу:\n\n<b>Платформа:</b> ${db.reklam_type}\n<b>Пользователь:</b> ${db.user_name}\n<b>Cсылка на рекламируемый проект:</b> ${db.reklam_link}\n<b>Описание проекта и ТЗ:</b> <code>${db.reklam_tzmsg}</code>\n<b>Рекламный текст:</b> <code>${db.reklam_alrtext}</code>\n<b>Желаемая дата:</b> <code>${db.reklam_date}</code>`, {reply_markup: {inline_keyboard: [[Markup.button.url('Ссылка на профиль пользователя 👤', `https://t.me/${db.user_name.replace('@', '')}`)]]}, parse_mode: 'HTML'})
        }
        
        await ctx.reply('Ваша заявка создана ✅\n\nС вами свяжутся в ближайшее время для уточнений заявки ✍️', {reply_markup: {inline_keyboard: [[Markup.button.callback('⏮ В меню', 'backtomnscenes')]]}})
        await ctx.scene.leave('reklam_st4')
    } catch (e) {
        console.error(e);
    }
})

const reklam_st5 = new Scenes.BaseScene("reklam_st5");

reklam_st5.enter(async ctx => {
    try {
        await ctx.reply('👤 Для того чтобы с вами смогли связаться, вам нужно поставить юрезнейм и не удалять(изменять) его до тех пор, пока вам не ответят, но если всетаки вы сделаете это, то с вами никто не свяжется‼️\n\nИнструкция ниже:', {reply_markup: {inline_keyboard: [[Markup.button.callback('Проверить 🔍', 'chekusernm')]]}})
        return await ctx.replyWithMediaGroup([{type: 'photo', media: 'AgACAgIAAxkBAAIBXWRySbC2c3ztwBjT-EJk8GeDwcqnAALNyDEbmlaQS7YiW9qqWzDJAQADAgADeAADLwQ'}, {type: 'photo', media: 'AgACAgIAAxkBAAIBXmRySfQq51-izYu-s4AzuFJtA79dAALOyDEbmlaQSyMgq8IjbXc_AQADAgADeAADLwQ'}, {type: 'photo', media: 'AgACAgIAAxkBAAIEEWR0lPyRTacB3dnzuSofKaenVwO6AAIRyDEbo8egSzhghsxyKuiYAQADAgADeAADLwQ'}])
    } catch (e) {
        console.error(e);
    }
})

reklam_st5.on('text', async ctx => {
    try {
        await ctx.reply('Нажмите на кнопку проверить выше ⬆️')
    } catch (e) {
        console.error(e);
    }
})

reklam_st5.action('chekusernm', async ctx => {
    try {
        if(!ctx.from.username) return ctx.answerCbQuery('К сожалению не вижу изменений 😕\n\nПопробуйте ещё раз все по инструкции.', {show_alert: true})
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {user_name: `@${ctx.from.username}`}})
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await ctx.answerCbQuery('👌')
        const db = await collection.findOne({user_id: ctx.from.id})
        if(db.reklam_tzmsg != 'null' && db.reklam_tzfile.length != 0) {
            if(db.reklam_tzfile.length > 1) {
                await ctx.tg.sendMessage(1031267639, `🟢 Новая заявка на рекламу:\n\n<b>Платформа:</b> ${db.reklam_type}\n<b>Пользователь:</b> ${db.user_name}\n<b>Cсылка на рекламируемый проект:</b> ${db.reklam_link}\n<b>Описание проекта и ТЗ:</b> <code>${db.reklam_tzmsg}</code>\n<b>Рекламный текст:</b> <code>${db.reklam_alrtext}</code>\n<b>Желаемая дата:</b> <code>${db.reklam_date}</code>\n\nПрикрепленные файлы ниже ⬇️`, {reply_markup: {inline_keyboard: [[Markup.button.url('Ссылка на профиль пользователя 👤', `https://t.me/${db.user_name.replace('@', '')}`)]]}, parse_mode: 'HTML'})
                let arr = []
                for (let i = 0; i < db.reklam_tzfile.length; i++) {
                    arr.push({type: 'document', media: db.reklam_tzfile[i]})
                }
                await ctx.tg.sendMediaGroup(1031267639, arr)
            }else {
                await ctx.tg.sendDocument(1031267639, db.reklam_tzfile[0], {caption: `🟢 Новая заявка на рекламу:\n\n<b>Платформа:</b> ${db.reklam_type}\n<b>Пользователь:</b> ${db.user_name}\n<b>Cсылка на рекламируемый проект:</b> ${db.reklam_link}\n<b>Описание проекта и ТЗ:</b> <code>${db.reklam_tzmsg}</code>\n<b>Рекламный текст:</b> <code>${db.reklam_alrtext}</code>\n<b>Желаемая дата:</b> <code>${db.reklam_date}</code>`, reply_markup: {inline_keyboard: [[Markup.button.url('Ссылка на профиль пользователя 👤', `https://t.me/${db.user_name.replace('@', '')}`)]]}, parse_mode: 'HTML'})
            }
        }else {
            await ctx.tg.sendMessage(1031267639, `🟢 Новая заявка на рекламу:\n\n<b>Платформа:</b> ${db.reklam_type}\n<b>Пользователь:</b> ${db.user_name}\n<b>Cсылка на рекламируемый проект:</b> ${db.reklam_link}\n<b>Описание проекта и ТЗ:</b> <code>${db.reklam_tzmsg}</code>\n<b>Рекламный текст:</b> <code>${db.reklam_alrtext}</code>\n<b>Желаемая дата:</b> <code>${db.reklam_date}</code>`, {reply_markup: {inline_keyboard: [[Markup.button.url('Ссылка на профиль пользователя 👤', `https://t.me/${db.user_name.replace('@', '')}`)]]}, parse_mode: 'HTML'})
        }

        await ctx.reply('Ваша заявка создана ✅\n\nС вами свяжутся в ближайшее время для уточнений заявки ✍️', {reply_markup: {inline_keyboard: [[Markup.button.callback('⏮ В меню', 'backtomnscenes')]]}})
        await ctx.scene.leave('reklam_st5')
    } catch (e) {
        console.error(e);
    }
})

const svedfold_scene = new Scenes.BaseScene("svedfold_scene");

svedfold_scene.enter(async ctx => {
    try {
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {sved_tz: 'null', user_instruct: false}})
        return await ctx.reply('✍️ Подробно опишите, что вас интересует. Постарайтесь максимально развернуто описать ТЗ:', {reply_markup: {keyboard: [['Отменить 🔴']], resize_keyboard: true}})
    } catch (e) {
        console.error(e);
    }
})

svedfold_scene.on('text', async ctx => {
    try {
        const db = await collection.findOne({user_id: ctx.from.id})
        if(db.sved_tz != 'null') return
        if (ctx.message.text == 'Отменить 🔴') {
            await ctx.reply('Отменено ✅', {reply_markup: {remove_keyboard: true}})
            await ctx.replyWithPhoto('AgACAgIAAxkBAAIBQGRwpdUHgsO-VzXinFdsqtt53IflAAJcyzEb3-yIS8NvKBi2G2GKAQADAgADeAADLwQ', {caption: `Привет, ${ctx.from.first_name}! Я бот Потэйтоса ✨\n\nЕсли у тебя есть какие-то вопросы, пожелания или предложения - ты можешь описать их здесь 💬\n\nВыберите действие из списка👇🏻`, reply_markup: {inline_keyboard: main_keyboards}})
            return ctx.scene.leave('svedfold_scene')
        }
        await ctx.reply('Обработка...', {reply_markup: {remove_keyboard: true}})
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {sved_tz: ctx.message.text}})
        await ctx.reply('🟡 Вы уверены что хотите отправить?', {reply_to_message_id: ctx.message.message_id, reply_markup: {inline_keyboard: [[Markup.button.callback('Да, отправляй 🟢', 'ysved'), Markup.button.callback('Нет, отменить 🔴', 'nsved')], [Markup.button.callback('Редактировать 📝', 'esved')]]}})
    } catch (e) {
        console.error(e);
    }
})

svedfold_scene.action('ysved', async ctx => {
    try {
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        const db = await collection.findOne({user_id: ctx.from.id})
        if(!ctx.from.username) {
            await ctx.answerCbQuery()
            if(db.user_instruct == false) {
                await ctx.reply('Для того чтобы PXTATXES смог с вами связаться, вам нужно будет создать юзернейм в настройках акаунта и не убирать его, для того, чтобы PXTATES смог с вами связаться!\n\nИнструкция ниже:')
                await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {user_instruct: true}})
                return await ctx.replyWithMediaGroup([{type: 'photo', media: 'AgACAgIAAxkBAAIBXWRySbC2c3ztwBjT-EJk8GeDwcqnAALNyDEbmlaQS7YiW9qqWzDJAQADAgADeAADLwQ'}, {type: 'photo', media: 'AgACAgIAAxkBAAIBXmRySfQq51-izYu-s4AzuFJtA79dAALOyDEbmlaQSyMgq8IjbXc_AQADAgADeAADLwQ'}, {type: 'photo', media: 'AgACAgIAAxkBAAIEEWR0lPyRTacB3dnzuSofKaenVwO6AAIRyDEbo8egSzhghsxyKuiYAQADAgADeAADLwQ'}])
            }
            return await ctx.reply('Для того чтобы PXTATXES смог с вами связаться, вам нужно будет поставить юзернейм в настройках акаунта и не убирать его, для того, чтобы PXTATES смог с вами связаться!\n\nИнструкция выше ⬆️')
        }
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {user_name: `@${ctx.from.username}`}})
        const dbcommit = await collection.findOne({user_id: ctx.from.id})
        await ctx.tg.sendMessage(1031267639, `🟢 Новая заявка на: <b>${dbcommit.uslug_type}</b>\n\n<b>Пользователь:</b> ${dbcommit.user_name}\n<b>Интересует:</b> ${dbcommit.sved_tz}`, {parse_mode: 'HTML', reply_markup: {inline_keyboard: [[Markup.button.url('Профиль пользователя 👤', `https://t.me/${dbcommit.user_name.replace('@', '')}`)]]}})
        await ctx.reply('Ваша заявка создана ✅\n\nС вами свяжутся в ближайшее время для уточнений заявки ✍️', {reply_markup: {inline_keyboard: [[Markup.button.callback('⏮ В меню', 'backtomnscenes')]]}})
        await ctx.scene.leave('svedfold_scene')
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

svedfold_scene.action('nsved', async ctx => {
    try {
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await ctx.replyWithPhoto('AgACAgIAAxkBAAIBQGRwpdUHgsO-VzXinFdsqtt53IflAAJcyzEb3-yIS8NvKBi2G2GKAQADAgADeAADLwQ', {caption: `Привет, ${ctx.from.first_name}! Я бот Потэйтоса ✨\n\nЕсли у тебя есть какие-то вопросы, пожелания или предложения - ты можешь описать их здесь 💬\n\nВыберите действие из списка👇🏻`, reply_markup: {inline_keyboard: main_keyboards}})
        ctx.scene.leave('svedfold_scene')
        await ctx.answerCbQuery('Отменено ✅')
    } catch (e) {
        console.error(e);
    }
})

svedfold_scene.action('esved', async ctx => {
    try {
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await ctx.scene.enter('svedfold_scene')
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

const beatfold_spisscene = new Scenes.BaseScene("beatfold_spisscene");

beatfold_spisscene.enter(async ctx => {
    try {
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {beatfrspis: 'null', user_instruct: false}})
        await ctx.reply('Список битов ⬇️', {reply_markup: {keyboard: [['Отменить 🔴']], resize_keyboard: true}})
        return await ctx.reply('🎹 Введите название интересующего бита:', {reply_markup: {inline_keyboard: [[Markup.button.url('Открыть список битов 🗂️', 'https://t.me/pxtatxess')]]}})
    } catch (e) {
        console.error(e);
    }
})

beatfold_spisscene.on('text', async ctx => {
    try {
        const db = await collection.findOne({user_id: ctx.from.id})
        if(db.beatfrspis != 'null') return
        if (ctx.message.text == 'Отменить 🔴') {
            await ctx.reply('Отменено ✅', {reply_markup: {remove_keyboard: true}})
            await ctx.replyWithPhoto('AgACAgIAAxkBAAIBQGRwpdUHgsO-VzXinFdsqtt53IflAAJcyzEb3-yIS8NvKBi2G2GKAQADAgADeAADLwQ', {caption: `Привет, ${ctx.from.first_name}! Я бот Потэйтоса ✨\n\nЕсли у тебя есть какие-то вопросы, пожелания или предложения - ты можешь описать их здесь 💬\n\nВыберите действие из списка👇🏻`, reply_markup: {inline_keyboard: main_keyboards}})
            return ctx.scene.leave('beatfold_spisscene')
        }
        await ctx.reply('Обработка...', {reply_markup: {remove_keyboard: true}})
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {beatfrspis: ctx.message.text}})
        await ctx.reply('Выберите вид лицензии:', {reply_to_message_id: ctx.message.message_id, reply_markup: {inline_keyboard: lisenziya}})
    } catch (e) {
        console.error(e);
    }
})

beatfold_spisscene.action('arendawav', async ctx => {
    try {
        const db = await collection.findOne({user_id: ctx.from.id})
        if(!ctx.from.username) {
            await ctx.answerCbQuery()
            if(db.user_instruct == false) {
                await ctx.reply('Для того чтобы PXTATXES смог с вами связаться, вам нужно будет создать юзернейм в настройках акаунта и не убирать его, для того, чтобы PXTATES смог с вами связаться!\n\nИнструкция ниже:')
                await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {user_instruct: true}})
                return await ctx.replyWithMediaGroup([{type: 'photo', media: 'AgACAgIAAxkBAAIBXWRySbC2c3ztwBjT-EJk8GeDwcqnAALNyDEbmlaQS7YiW9qqWzDJAQADAgADeAADLwQ'}, {type: 'photo', media: 'AgACAgIAAxkBAAIBXmRySfQq51-izYu-s4AzuFJtA79dAALOyDEbmlaQSyMgq8IjbXc_AQADAgADeAADLwQ'}, {type: 'photo', media: 'AgACAgIAAxkBAAIEEWR0lPyRTacB3dnzuSofKaenVwO6AAIRyDEbo8egSzhghsxyKuiYAQADAgADeAADLwQ'}])
            }
            return await ctx.reply('Для того чтобы PXTATXES смог с вами связаться, вам нужно будет поставить юзернейм в настройках акаунта и не убирать его, для того, чтобы PXTATES смог с вами связаться!\n\nИнструкция выше ⬆️')
        }
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {lic: 'Аренда Wav', user_name: `@${ctx.from.username}`}})
        const dbcommit = await collection.findOne({user_id: ctx.from.id})
        await ctx.tg.sendMessage(1031267639, `🟢 Новая заявка на: <b>${dbcommit.uslug_type}</b>\n\n<b>Пользователь:</b> ${dbcommit.user_name}\n<b>Название интересующего бита:</b> ${dbcommit.beatfrspis}\n<b>Тип лицензии:</b> ${dbcommit.lic}`, {parse_mode: 'HTML', reply_markup: {inline_keyboard: [[Markup.button.url('Профиль пользователя 👤', `https://t.me/${dbcommit.user_name.replace('@', '')}`)]]}})
        await ctx.reply('Ваша заявка создана ✅\n\nС вами свяжутся в ближайшее время для уточнений заявки ✍️', {reply_markup: {inline_keyboard: [[Markup.button.callback('⏮ В меню', 'backtomnscenes')]]}})
        await ctx.scene.leave('beatfold_spisscene')
    } catch (e) {
        console.error(e);
    }
})

beatfold_spisscene.action('wptrackout', async ctx => {
    try {
        const db = await collection.findOne({user_id: ctx.from.id})
        if(!ctx.from.username) {
            await ctx.answerCbQuery()
            if(db.user_instruct == false) {
                await ctx.reply('Для того чтобы PXTATXES смог с вами связаться, вам нужно будет создать юзернейм в настройках акаунта и не убирать его, для того, чтобы PXTATES смог с вами связаться!\n\nИнструкция ниже:')
                await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {user_instruct: true}})
                return await ctx.replyWithMediaGroup([{type: 'photo', media: 'AgACAgIAAxkBAAIBXWRySbC2c3ztwBjT-EJk8GeDwcqnAALNyDEbmlaQS7YiW9qqWzDJAQADAgADeAADLwQ'}, {type: 'photo', media: 'AgACAgIAAxkBAAIBXmRySfQq51-izYu-s4AzuFJtA79dAALOyDEbmlaQSyMgq8IjbXc_AQADAgADeAADLwQ'}, {type: 'photo', media: 'AgACAgIAAxkBAAIEEWR0lPyRTacB3dnzuSofKaenVwO6AAIRyDEbo8egSzhghsxyKuiYAQADAgADeAADLwQ'}])
            }
            return await ctx.reply('Для того чтобы PXTATXES смог с вами связаться, вам нужно будет поставить юзернейм в настройках акаунта и не убирать его, для того, чтобы PXTATES смог с вами связаться!\n\nИнструкция выше ⬆️')
        }
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {lic: 'Wav + Trackout', user_name: `@${ctx.from.username}`}})
        const dbcommit = await collection.findOne({user_id: ctx.from.id})
        await ctx.tg.sendMessage(1031267639, `🟢 Новая заявка на: <b>${dbcommit.uslug_type}</b>\n\n<b>Пользователь:</b> ${dbcommit.user_name}\n<b>Название интересующего бита:</b> ${dbcommit.beatfrspis}\n<b>Тип лицензии:</b> ${dbcommit.lic}`, {parse_mode: 'HTML', reply_markup: {inline_keyboard: [[Markup.button.url('Профиль пользователя 👤', `https://t.me/${dbcommit.user_name.replace('@', '')}`)]]}})
        await ctx.reply('Ваша заявка создана ✅\n\nС вами свяжутся в ближайшее время для уточнений заявки ✍️', {reply_markup: {inline_keyboard: [[Markup.button.callback('⏮ В меню', 'backtomnscenes')]]}})
        await ctx.scene.leave('beatfold_spisscene')
    } catch (e) {
        console.error(e);
    }
})
 
beatfold_spisscene.action('exclusive', async ctx => {
    try {
        const db = await collection.findOne({user_id: ctx.from.id})
        if(!ctx.from.username) {
            await ctx.answerCbQuery()
            if(db.user_instruct == false) {
                await ctx.reply('Для того чтобы PXTATXES смог с вами связаться, вам нужно будет создать юзернейм в настройках акаунта и не убирать его, для того, чтобы PXTATES смог с вами связаться!\n\nИнструкция ниже:')
                await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {user_instruct: true}})
                return await ctx.replyWithMediaGroup([{type: 'photo', media: 'AgACAgIAAxkBAAIBXWRySbC2c3ztwBjT-EJk8GeDwcqnAALNyDEbmlaQS7YiW9qqWzDJAQADAgADeAADLwQ'}, {type: 'photo', media: 'AgACAgIAAxkBAAIBXmRySfQq51-izYu-s4AzuFJtA79dAALOyDEbmlaQSyMgq8IjbXc_AQADAgADeAADLwQ'}, {type: 'photo', media: 'AgACAgIAAxkBAAIEEWR0lPyRTacB3dnzuSofKaenVwO6AAIRyDEbo8egSzhghsxyKuiYAQADAgADeAADLwQ'}])
            }
            return await ctx.reply('Для того чтобы PXTATXES смог с вами связаться, вам нужно будет поставить юзернейм в настройках акаунта и не убирать его, для того, чтобы PXTATES смог с вами связаться!\n\nИнструкция выше ⬆️')
        }
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {lic: 'Эксклюзивная лицензия', user_name: `@${ctx.from.username}`}})
        const dbcommit = await collection.findOne({user_id: ctx.from.id})
        await ctx.tg.sendMessage(1031267639, `🟢 Новая заявка на: <b>${dbcommit.uslug_type}</b>\n\n<b>Пользователь:</b> ${dbcommit.user_name}\n<b>Название интересующего бита:</b> ${dbcommit.beatfrspis}\n<b>Тип лицензии:</b> ${dbcommit.lic}`, {parse_mode: 'HTML', reply_markup: {inline_keyboard: [[Markup.button.url('Профиль пользователя 👤', `https://t.me/${dbcommit.user_name.replace('@', '')}`)]]}})
        await ctx.reply('Ваша заявка создана ✅\n\nС вами свяжутся в ближайшее время для уточнений заявки ✍️', {reply_markup: {inline_keyboard: [[Markup.button.callback('⏮ В меню', 'backtomnscenes')]]}})
        await ctx.scene.leave('beatfold_spisscene')
    } catch (e) {
        console.error(e);
    }
})
 
beatfold_spisscene.action('cancspis', async ctx => {
    try {
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await ctx.reply('Отменено ✅')
        await ctx.replyWithPhoto('AgACAgIAAxkBAAIBQGRwpdUHgsO-VzXinFdsqtt53IflAAJcyzEb3-yIS8NvKBi2G2GKAQADAgADeAADLwQ', {caption: `Привет, ${ctx.from.first_name}! Я бот Потэйтоса ✨\n\nЕсли у тебя есть какие-то вопросы, пожелания или предложения - ты можешь описать их здесь 💬\n\nВыберите действие из списка👇🏻`, reply_markup: {inline_keyboard: main_keyboards}})
        await ctx.scene.leave('beatfold_spisscene')
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

const beatfold_beatscene = new Scenes.BaseScene("beatfold_beatscene");

beatfold_beatscene.enter(async ctx => {
    try {
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {beattype: 'null'}})
        return await ctx.reply('Введите название интересующего тайпа:', {reply_markup: {keyboard: [['Отменить 🔴']], resize_keyboard: true}})
    } catch (e) {
        console.error(e);
    }
})

beatfold_beatscene.on('text', async ctx => {
    try {
        if (ctx.message.text == 'Отменить 🔴') {
            await ctx.reply('Отменено ✅', {reply_markup: {remove_keyboard: true}})
            await ctx.replyWithPhoto('AgACAgIAAxkBAAIBQGRwpdUHgsO-VzXinFdsqtt53IflAAJcyzEb3-yIS8NvKBi2G2GKAQADAgADeAADLwQ', {caption: `Привет, ${ctx.from.first_name}! Я бот Потэйтоса ✨\n\nЕсли у тебя есть какие-то вопросы, пожелания или предложения - ты можешь описать их здесь 💬\n\nВыберите действие из списка👇🏻`, reply_markup: {inline_keyboard: main_keyboards}})
            return ctx.scene.leave('beatfold_beatscene')
        }
        await ctx.reply('Вношу изменения в анкету 🔄️', {reply_markup: {remove_keyboard: true}})
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {beattype: ctx.message.text}})
     await ctx.scene.enter('beatfold_beatscene_st2')
    } catch (e) {
        console.error(e);
    }
})

const beatfold_beatscene_st2 = new Scenes.BaseScene("beatfold_beatscene_st2");

beatfold_beatscene_st2.enter(async ctx => {
    try {
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {beatscrtz: 'null', waitforfilebeat: false, beattzfiles: []}})
        return await ctx.reply('📌 Опишите ваше пожелания к биту более подробно: можете прикрепить примеры работ, на что вы хотите чтобы бит был похож, опишите настроение и темп и т.д\n\nЧем больше информации вы опишите, тем точнее вы получите желаемый результат', {reply_markup: {keyboard: [['Отменить 🔴']], resize_keyboard: true}})
    } catch (e) {
        console.error(e);
    }
})

beatfold_beatscene_st2.on('audio', async ctx => {
    const db = await collection.findOne({user_id: ctx.from.id})
    if(db.waitforfilebeat == true) {
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {waitforfilebeat: false}, $push: {beattzfiles: ctx.message.audio.file_id}})
        await ctx.reply('Добавил ✅')
        return await ctx.reply('Хотите добавить ещё?', {reply_markup: {inline_keyboard: [[Markup.button.callback('Добавить ➕', 'addbetfile')], [Markup.button.callback('Отправить анкенту 🟢', 'sendbeattz')]]}})
    }
    await ctx.reply('Сначала опишите пожелания к биту, а потом сможете прикрепить файл:')
})

beatfold_beatscene_st2.on('photo', async ctx => {
    const db = await collection.findOne({user_id: ctx.from.id})
    if(db.waitforfilebeat == true) {
        return ctx.reply('⚠️ Извините, я принимаю только аудиофайлы, отправьте аудиофайл:')
    }
    await ctx.reply('С начало опишите пожелания к биту, а потом сможете прикрепить файл:')
})

beatfold_beatscene_st2.on('document', async ctx => {
    const db = await collection.findOne({user_id: ctx.from.id})
    if(db.waitforfilebeat == true) {
        return ctx.reply('⚠️ Извините, я принимаю только аудиофайлы, отправьте аудиофайл:')
    }
    await ctx.reply('С начало опишите пожелания к биту, а потом сможете прикрепить файл:')
})

beatfold_beatscene_st2.on('video', async ctx => {
    const db = await collection.findOne({user_id: ctx.from.id})
    if(db.waitforfilebeat == true) {
        return ctx.reply('⚠️ Извините, я принимаю только аудиофайлы, отправьте аудиофайл:')
    }
    await ctx.reply('С начало опишите пожелания к биту, а потом сможете прикрепить файл:')
})

beatfold_beatscene_st2.on('voice', async ctx => {
    const db = await collection.findOne({user_id: ctx.from.id})
    if(db.waitforfilebeat == true) {
        return ctx.reply('⚠️ Извините, я принимаю только аудиофайлы, отправьте аудиофайл:')
    }
    await ctx.reply('С начало опишите пожелания к биту, а потом сможете прикрепить файлы:')
})

beatfold_beatscene_st2.on('text', async ctx => {
    try {
        const db = await collection.findOne({user_id: ctx.from.id})
        if(db.beatscrtz != 'null') return
        if (ctx.message.text == 'Отменить 🔴') {
            await ctx.reply('Отменено ✅', {reply_markup: {remove_keyboard: true}})
            await ctx.replyWithPhoto('AgACAgIAAxkBAAIBQGRwpdUHgsO-VzXinFdsqtt53IflAAJcyzEb3-yIS8NvKBi2G2GKAQADAgADeAADLwQ', {caption: `Привет, ${ctx.from.first_name}! Я бот Потэйтоса ✨\n\nЕсли у тебя есть какие-то вопросы, пожелания или предложения - ты можешь описать их здесь 💬\n\nВыберите действие из списка👇🏻`, reply_markup: {inline_keyboard: main_keyboards}})
            return ctx.scene.leave('beatfold_beatscene_st2')
        }
        await ctx.reply('Вношу изменения в анкету 🔄️', {reply_markup: {remove_keyboard: true}})
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {beatscrtz: ctx.message.text}})
        await ctx.reply('Хотите прикрепить аудиофайлы к вашей анкете?', {reply_markup: {inline_keyboard: [[Markup.button.callback('Добавить ➕', 'addbetfile')], [Markup.button.callback('Отправить анкенту 🟢', 'sendbeattz')]]}})
    } catch (e) {
        console.error(e);
    }
})

beatfold_beatscene_st2.action('addbetfile', async ctx => {
    try {
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {waitforfilebeat: true}})
        await ctx.reply('Отправьте аудиофайл:')
    } catch (e) {
        console.error(e);
    }
})

beatfold_beatscene_st2.action('sendbeattz', async ctx => {
    try {
        const db = await collection.findOne({user_id: ctx.from.id})
        if(!ctx.from.username) {
            await ctx.answerCbQuery()
            if(db.user_instruct == false) {
                await ctx.reply('Для того чтобы PXTATXES смог с вами связаться, вам нужно будет создать юзернейм в настройках акаунта и не убирать его, для того, чтобы PXTATES смог с вами связаться!\n\nИнструкция ниже:')
                await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {user_instruct: true}})
                return await ctx.replyWithMediaGroup([{type: 'photo', media: 'AgACAgIAAxkBAAIBXWRySbC2c3ztwBjT-EJk8GeDwcqnAALNyDEbmlaQS7YiW9qqWzDJAQADAgADeAADLwQ'}, {type: 'photo', media: 'AgACAgIAAxkBAAIBXmRySfQq51-izYu-s4AzuFJtA79dAALOyDEbmlaQSyMgq8IjbXc_AQADAgADeAADLwQ'}, {type: 'photo', media: 'AgACAgIAAxkBAAIEEWR0lPyRTacB3dnzuSofKaenVwO6AAIRyDEbo8egSzhghsxyKuiYAQADAgADeAADLwQ'}])
            }
            return await ctx.reply('Для того чтобы PXTATXES смог с вами связаться, вам нужно будет поставить юзернейм в настройках акаунта и не убирать его, для того, чтобы PXTATES смог с вами связаться!\n\nИнструкция выше ⬆️')
        }
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {user_name: `@${ctx.from.username}`}})
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        const dbcommit = await collection.findOne({user_id: ctx.from.id})
        if(dbcommit.beattzfiles.length > 1) {
            await ctx.tg.sendMessage(1031267639, `Новая заявка на: ${dbcommit.uslug_type}\n\n<b>Пользователь:</b> ${dbcommit.user_name}\n<b>ID пользователя:</b> <code>${dbcommit.user_id}</code>\n<b>Beat type:</b> <code>${dbcommit.beattype}</code>\n<b>Пожелания к биту:</b> <code>${dbcommit.beatscrtz}</code>\n\nПрикрепленные файлы ниже ⬇️`, {parse_mode: 'HTML', reply_markup: {inline_keyboard: [[Markup.button.url('Открыть профиль пользователя 👤', `https://t.me/${dbcommit.user_name.replace('@', '')}`)]]}})
            let arr = []
            for (let i = 0; i < db.beattzfiles.length; i++) {
                arr.push({type: 'audio', media: db.beattzfiles[i]})
            }
            await ctx.tg.sendMediaGroup(1031267639, arr)
        }else if(dbcommit.beattzfiles.length == 1) {
            await ctx.tg.sendAudio(1031267639, dbcommit.beattzfiles[0], {caption: `Новая заявка на: ${dbcommit.uslug_type}\n\n<b>Пользователь:</b> ${dbcommit.user_name}\n<b>ID пользователя:</b> <code>${dbcommit.user_id}</code>\n<b>Beat type:</b> <code>${dbcommit.beattype}</code>\n<b>Пожелания к биту:</b> <code>${dbcommit.beatscrtz}</code>`, parse_mode: 'HTML', reply_markup: {inline_keyboard: [[Markup.button.url('Открыть профиль пользователя 👤', `https://t.me/${dbcommit.user_name.replace('@', '')}`)]]}})
        }else {
            ctx.tg.sendMessage(1031267639, `Новая заявка на: ${dbcommit.uslug_type}\n\n<b>Пользователь:</b> ${dbcommit.user_name}\n<b>ID пользователя:</b> <code>${dbcommit.user_id}</code>\n<b>Beat type:</b> <code>${dbcommit.beattype}</code>\n<b>Пожелания к биту:</b> <code>${dbcommit.beatscrtz}</code>`, {parse_mode: 'HTML', reply_markup: {inline_keyboard: [[Markup.button.url('Открыть профиль пользователя 👤', `https://t.me/${dbcommit.user_name.replace('@', '')}`)]]}})
        }

        await ctx.reply('Ваша заявка создана ✅\n\nС вами свяжутся в ближайшее время для уточнений заявки ✍️', {reply_markup: {inline_keyboard: [[Markup.button.callback('⏮ В меню', 'backtomnscenes')]]}})
        await ctx.scene.leave('beatfold_beatscene_st2')
    } catch (e) {
        console.error(e);
    }
})
 
const stage = new Scenes.Stage([predlojka, predlojkasend, pxtatansw, reklam, reklam_st2, reklam_st3, reklam_st4, reklam_st5, svedfold_scene, beatfold_spisscene, beatfold_beatscene, beatfold_beatscene_st2]);  
bot.use(session());
bot.use(stage.middleware());  

bot.start(async (ctx) => {
    try {
        if(ctx.scene.current != undefined) return
        await ctx.deleteMessage(ctx.message.message_id)
        const db = await collection.findOne({user_id: ctx.from.id})
        if(db == null) {
            await collection.insertOne({user_id: ctx.from.id, predsend: 'none', first_name: ctx.from.first_name, user_name: `@${ctx.from.username}` || 'Нету'})
            await collection.findOneAndUpdate({_id: new ObjectId('646f07782ec51704c9ff90bd')}, {$push: {users: ctx.from.id}})
        }
        await ctx.replyWithPhoto('AgACAgIAAxkBAAIBQGRwpdUHgsO-VzXinFdsqtt53IflAAJcyzEb3-yIS8NvKBi2G2GKAQADAgADeAADLwQ', {caption: `Привет, ${ctx.from.first_name}! Я бот Потэйтоса ✨\n\nЕсли у тебя есть какие-то вопросы, пожелания или предложения - ты можешь описать их здесь 💬\n\nВыберите действие из списка👇🏻`, reply_markup: {inline_keyboard: main_keyboards}})
    } catch (e) {
        console.error(e);
    }
});

// bot.on('forward_date', async ctx => {
//     try {
//         console.log(ctx.update.message);
//     } catch (e) {
//         console.error(e);
//     }
// })

bot.help(async (ctx) => {
    try {
        if(ctx.scene.current != undefined) return
        await ctx.reply(`Я бот Потэйтоса ✨\n\nЕсли у тебя есть какие-то вопросы, пожелания или предложения - ты можешь описать их здесь 💬`)  
    } catch (e) {
        console.error(e);
    }
});

bot.action('predloj', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        const db = await collection.findOne({user_id: ctx.from.id})
        if(db.predsend != "none") {
            return await ctx.answerCbQuery('Вы не сможете отправлять новые предложения, пока PXTATXES не проверит ваше последнее предложение! Я сообщу вам, как только предложка будет доступна...', {show_alert: true})
        }
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await ctx.answerCbQuery('Вход в предложку 🔄', {show_alert: false})
        await ctx.scene.enter('predlojka')
    } catch (e) {
        console.error(e);
    }
})

bot.action('idea', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        const db = await collection.findOne({user_id: ctx.from.id})
        if(db.predsend != "none") {
            return await ctx.answerCbQuery('Вы не сможете отправлять новые предложения, пока PXTATXES не проверит ваше последнее предложение! Я сообщу вам, как только предложка будет доступна...', {show_alert: true})
        }
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await ctx.answerCbQuery('Вход в предложку 🔄', {show_alert: false})
        await ctx.scene.enter('predlojka')
    } catch (e) {
        console.error(e);
    }
})

// Предложка(ответ):

bot.action('predlojsender', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        let usdb = 0
        if(ctx.callbackQuery.message.text) {
            usdb = await collection.findOne({predsend: ctx.callbackQuery.message.text.split(' ')[0].replace('#', '')})
            await ctx.editMessageText(`${usdb.predsend}# | Данные отправителя:\n\n<b>USER ID:</b> <code>${usdb.user_id}</code>\n<b>USER NAME:</b> <code>${usdb.first_name}</code>\n<b>USER NAME:</b> ${usdb.user_name}`, {reply_markup: {inline_keyboard: predloj_senderonv}, parse_mode: "HTML"})
        }else if(ctx.callbackQuery.message.caption) {
            usdb = await collection.findOne({predsend: ctx.callbackQuery.message.caption.split(' ')[0].replace('#', '')})
            await ctx.editMessageCaption(`${usdb.predsend}# | Данные отправителя:\n\n<b>USER ID:</b> <code>${usdb.user_id}</code>\n<b>USER NAME:</b> <code>${usdb.first_name}</code>\n<b>USER NAME:</b> ${usdb.user_name}`, {reply_markup: {inline_keyboard: predloj_senderonv}, parse_mode: "HTML"})
        }
        await ctx.answerCbQuery('Вот его голова)', {show_alert: false})
    } catch (e) {
        console.error(e);
    }
})

bot.action('predlojacanc', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        let db = 0
        if(ctx.callbackQuery.message.text) {
            db = await collection.findOneAndUpdate({predsend: ctx.callbackQuery.message.text.split(' ')[0].replace('#', '')}, {$set: {predsend: 'none'}})
        }else if(ctx.callbackQuery.message.caption) {
            db = await collection.findOneAndUpdate({predsend: ctx.callbackQuery.message.caption.split(' ')[0].replace('#', '')}, {$set: {predsend: 'none'}})
        }
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await ctx.tg.sendMessage(db.value.user_id, '🟢 Предложка потаты снова доступна!')
        await ctx.answerCbQuery('Закрыто ✅', {show_alert: false})
    } catch (e) {
        console.error(e);
    }
})

bot.action('predlojsenderback', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        let db = 0
        if(ctx.callbackQuery.message.text) {
            db = await collection.findOne({predsend: ctx.callbackQuery.message.text.split(' ')[0].replace('#', '')})
            await ctx.editMessageText(`${db.predsend}# | Сообщение с предложки:\n<i>${db.predmsg}</i>`, {reply_markup: {inline_keyboard: predloj_senderinfo}, parse_mode: "HTML"})
        }else if(ctx.callbackQuery.message.caption) {
            db = await collection.findOne({predsend: ctx.callbackQuery.message.caption.split(' ')[0].replace('#', '')})
            await ctx.editMessageCaption(`${db.predsend}# | Сообщение с предложки:\n<i>${db.predmsg}</i>`, {reply_markup: {inline_keyboard: predloj_senderinfo}, parse_mode: "HTML"})
        }
        await ctx.answerCbQuery('Вернул ✅', {show_alert: false})
    } catch (e) {
        console.error(e);
    }
})

bot.action('predlojanswer', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        let db = 0
        if(ctx.callbackQuery.message.text) {
            db = await collection.findOne({predsend: ctx.callbackQuery.message.text.split(' ')[0].replace('#', '')})
        }else if(ctx.callbackQuery.message.caption) {
            db = await collection.findOne({predsend: ctx.callbackQuery.message.caption.split(' ')[0].replace('#', '')})
        }
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {usertoansw: db.user_id}})
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await ctx.scene.enter('pxtatansw')
        await ctx.answerCbQuery('Загружаю...', {show_alert: false})
    } catch (e) {
        console.error(e);
    }
})

bot.action('links', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        await ctx.editMessageCaption('Здесь собраны ссылки на соц.сети:', {reply_markup: {inline_keyboard: links}})
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

bot.action('zakaz_uslug', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        await ctx.editMessageCaption('🛠 Выберите интересующую вас услугу:', {reply_markup: {inline_keyboard: uslugi_keyboards}})
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

bot.action('uslug_svedmaster', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        await ctx.editMessageCaption('🛠 Выберите услугу:', {reply_markup: {inline_keyboard: uslug_svedm_keyboards}})
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

bot.action('uslug_svedfold_svedm', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {uslug_type: 'Сведение и Мастеринг 🛠'}})
        await ctx.scene.enter('svedfold_scene')
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

bot.action('uslug_svedfold_vocalsett', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {uslug_type: 'Обработка вокала 🎙️'}})
        await ctx.scene.enter('svedfold_scene')
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

bot.action('uslug_svedfold_beatscorr', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {uslug_type: 'Корректировка бита 🎹'}})
        await ctx.scene.enter('svedfold_scene')
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

bot.action('uslug_beatsfold_spisbeat', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {uslug_type: 'Купить бит из списка 🎹'}})
        await ctx.scene.enter('beatfold_spisscene')
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

bot.action('uslug_beatsfold_zakazbeat', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {uslug_type: 'Создание бита с нуля 🛠'}})
        await ctx.scene.enter('beatfold_beatscene')
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

bot.action('uslug_beats', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        await ctx.editMessageCaption('🛠 Выберите услугу:', {reply_markup: {inline_keyboard: uslug_beats_keyboards}})
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

bot.action('uslug_beatsfold_info', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await ctx.reply(beatsinfo, {reply_markup: {inline_keyboard: [[Markup.button.callback('⏪ Назад', 'backtobeatsfold')]]}})
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

bot.action('uslug_svedfold_info', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        await ctx.editMessageMedia({type: 'photo', media: 'AgACAgIAAxkBAAIECmR0eQN8YlmmJ7brTgZbfBnXVRfVAAKexzEbo8egS5NdZfKVAAFk6AEAAwIAA3kAAy8E', caption: svedinfo}, {reply_markup: {inline_keyboard: [[Markup.button.callback('⏪ Назад', 'backtosvedfold')]]}})
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

bot.action('uslug_none', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        await ctx.editMessageCaption('🛠 Извините, пока не доступно')
        setTimeout(async () => {
            await ctx.editMessageCaption('🛠 Выберите интересующую вас услугу:', {reply_markup: {inline_keyboard: uslugi_keyboards}})
        }, 2000);
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

bot.action('donat', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        await ctx.editMessageCaption('Если у вас есть желание поддержать мой канал, вот ссылка на площадки для донатов👇🏻', {reply_markup: {inline_keyboard: dlinks}})
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

bot.action('videodkits', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        await ctx.editMessageCaption('📂 Выберите интересующий вас пак:', {reply_markup: {inline_keyboard: vpacks}})
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

bot.action('dkit', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        await ctx.editMessageCaption('🥁 Выберите драмкит:', {reply_markup: {inline_keyboard: pxtpacks}})
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

bot.action('zakaz_reklamu', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        await ctx.editMessageCaption('📈 Для заказа реклама, заполните анкету\n\nРеклама на какой площадке вас интересует?', {reply_markup: {inline_keyboard: reklam_keyboards}})
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})
bot.action('ytreklam', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {reklam_type: 'YT'}})
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await ctx.scene.enter('reklam')
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})
bot.action('tgreklam', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {reklam_type: 'TG'}})
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await ctx.scene.enter('reklam')
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})
bot.action('vkreklam', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {reklam_type: 'VK'}})
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await ctx.scene.enter('reklam')
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

const descr = 
`
В этом драм ките собрано множество самых интересных и качественных звуков, которые я ежедневно использую при написании своих работ, а также использую в роликах на канале
`

bot.action('buykit', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        await ctx.replyWithInvoice({currency: 'RUB', photo_size: 500, photo_height: 400, photo_width: 1000, photo_url: 'https://cdn.discordapp.com/attachments/992866546596712638/1117160834389512212/secret.jpg', prices: [{amount: 60000, label: '600.0'}], title: 'PXTATXES - SECRET DRUM KIT', provider_token: '381764678:TEST:59083', start_parameter: '1', description: descr, payload: ctx.from.id})
    } catch (e) {
        console.error(e);
    }
})

bot.on('pre_checkout_query', async ctx => {
    await ctx.answerPreCheckoutQuery(true);
});

bot.on('successful_payment', async (ctx) => {
    const paymentInfo = ctx.message.successful_payment;
    await ctx.reply('Спасибо за оплату!\n\nВот ваш драмкит:', {reply_markup: {inline_keyboard: [[Markup.button.callback('⏮ В меню', 'backtomnscenes')]]}})
});


bot.action('secretdkit', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {drumclicked: 'helper'}})
        await ctx.editMessageMedia({type: 'photo', media: 'AgACAgIAAxkBAAIBVGRws9I-Zb_hQyM4tXXP6FaqWkp2AAK5yzEb3-yIS4KElcDr2GiqAQADAgADeQADLwQ', caption: '📋 <b>Описание:</b>\n\n<b>Драм пак содержит:</b>\n808s - 32\nBass - 21\nClaps - 27\nCrash - 17\nFXs - 34\nHi-Hats - 20\nKicks - 20\nOne Shots - 50\nMIDIs - 239\nOpen-Hats - 18\nPercs & Rims - 25\nProjects - 2\nSnaps - 9\nSnares - 27\n\nВ этом драм ките собрано множество самых интересных и качественных звуков, которые я ежедневно использую при написании своих работ, а также использую в роликах на канале\n\n<b>Данный драм кит подойдет для создания битов в жанре: </b>Trap | Hyperpop | Jersey Club | Drill | Rage | Glitchcore | Dariacore | SuperTrap | Alien и многих других  Вес - 1гб\n\n💰 <b>Цена: 600 руб.</b>', parse_mode: 'HTML'}, {reply_markup: {inline_keyboard: bpxtpacks}})
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

bot.action('helpermdkit', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {drumclicked: 'helper'}})
        await ctx.editMessageMedia({type: 'photo', media: 'AgACAgIAAxkBAAIBRGRwpjcH6Fhq5COWd0O8EpvklscnAAJeyzEb3-yIS6BOcaVyM7-qAQADAgADeAADLwQ', caption: '✨ @pxtatxes! - HELPER {MIDI KIT}\n\nПак, призванный помочь привнести разнообразие в ваши работы!\n\nMIDI KIT содержит:\n808 (10)\nClap\'s (10)\nHi-Hat\'s (10)\nKick\'s (10)\nMelody\'s(10)\nPerc\'s (10)'}, {reply_markup: {inline_keyboard: bpacks}})
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

bot.action('fiveminutekit', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {drumclicked: 'fminute'}})
        await ctx.editMessageMedia({type: 'photo', media: 'AgACAgIAAxkBAAIBRWRwpm_e_ZOZnlVF0z6w8y7pctyYAAJjyzEb3-yISymDxzXXmDgTAQADAgADeQADLwQ', caption: 'Небольшой пак, содержащий в себе заготовки и скейлы, которые смогут облегчить тебе написание мелодий и ударных партий, привнести разнообразие в работы и найти вдохновение если оно отсутствует 💚'}, {reply_markup: {inline_keyboard: bpacks}})
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

bot.action('downkit', async ctx => {
    try {
        // -1001974175255
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        const db = await collection.findOne({user_id: ctx.from.id})
        try {
            const inchanel = await ctx.tg.getChatMember(-1001974175255, ctx.from.id)
            console.log(inchanel);
            if (inchanel.status != 'left') {
                if (db.chanelsubcheck == true) {
                    let current = Math.floor(Date.now() / 1000);
                    let delta = current - db.hoursinchannel;
                    const hoursPassed = Math.floor(delta / 3600);
                    if (hoursPassed >= 24) {
                        await ctx.answerCbQuery()
                    }else {
                        await ctx.answerCbQuery()
                        return await ctx.reply(`🕛 Для получения доступа требуется быть подписанным на канал ещё <b>${24 - hoursPassed}</b> часов.`, {parse_mode: 'HTML'})
                    }
                }else {
                    await ctx.answerCbQuery()
                    await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {chanelsubcheck: true, hoursinchannel: Math.floor(Date.now() / 1000)}})
                    return await ctx.reply(`🕛 Для получения доступа требуется быть подписанным на канал ещё <b>${24 - hoursPassed}</b> часов.`, {parse_mode: 'HTML'})
                }
            } else {
                await ctx.answerCbQuery()
                await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {chanelsubcheck: false}})
                return await ctx.reply('📣 Для того чтобы скачать паки, вам нужно подписаться на канал <a href="https://t.me/pxtatxes">"PXTATXES"</a>', {parse_mode: 'HTML', disable_web_page_preview: true, reply_markup: {inline_keyboard: [[Markup.button.url('Открыть канал 🛢️', 'https://t.me/pxtatxes')]]}})
            }
        } catch (e) {
            await ctx.answerCbQuery()
            await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {chanelsubcheck: false}})
            return await ctx.reply('📣 Для того чтобы скачать паки, вам нужно подписаться на канал <a href="https://t.me/pxtatxes">"PXTATXES"</a>', {parse_mode: 'HTML', disable_web_page_preview: true, reply_markup: {inline_keyboard: [[Markup.button.url('Открыть канал 🛢️', 'https://t.me/pxtatxes')]]}})
        }
        if(db.drumclicked == 'helper') {
            await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
            await ctx.replyWithDocument('BQACAgIAAxkBAAIBSWRwqC1bZjPC1iOOnhUat14dfi9gAAJ1KwACoVh4S67CxK54c24sLwQ', {caption: '✨ @pxtatxes! - HELPER {MIDI KIT}\n\nПороль от архива: pxtatxes', reply_markup: {inline_keyboard: [[Markup.button.url('СКАЧАТЬ ЧЕРЕЗ GOOGLE DRIVE', 'https://drive.google.com/file/d/11O_Rzl9pg9sNv4pjk5ouqa2GFUJ0mG0N/view')]]}})
        }else if(db.drumclicked == 'fminute') {
            await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
            await ctx.replyWithDocument('BQACAgIAAxkBAAIBSmRwqDwxYvPP9nm2zWMyNX61q-U-AALKKwACoVh4S2lLPkYpkumxLwQ', {caption: '✨ @pxtatxes! - "5 MINUTE" (Helper Pack)', reply_markup: {inline_keyboard: [[Markup.button.url('СКАЧАТЬ ЧЕРЕЗ GOOGLE DRIVE', 'https://drive.google.com/file/d/1Egq7EM20mgdjTcILTVLLjXvrpbGmM1oH/view')]]}})
        }
        await ctx.answerCbQuery()
        setTimeout(async () => {
            await ctx.replyWithPhoto('AgACAgIAAxkBAAIBQGRwpdUHgsO-VzXinFdsqtt53IflAAJcyzEb3-yIS8NvKBi2G2GKAQADAgADeAADLwQ', {caption: 'Ваш драмкит ждет вас выше ⬆️\n\n📂 Выберите интересующий вас пак:', reply_markup: {inline_keyboard: vpacks}}) 
        }, 2000);    
    } catch (e) {
        console.error(e);
    }
})

bot.action('backtomain', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        await ctx.editMessageCaption('Я бот Потэйтоса ✨\n\nЕсли у тебя есть какие-то вопросы, пожелания или предложения - ты можешь описать их здесь 💬\n\nВыберите действие из списка👇🏻', {reply_markup: {inline_keyboard: main_keyboards}})
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

bot.action('backtopacks', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        await ctx.editMessageMedia({type: 'photo', media: 'AgACAgIAAxkBAAIBQGRwpdUHgsO-VzXinFdsqtt53IflAAJcyzEb3-yIS8NvKBi2G2GKAQADAgADeAADLwQ', caption: '📂 Выберите интересующий вас пак:'}, {reply_markup: {inline_keyboard: vpacks}})
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

bot.action('backtopxtpacks', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        await ctx.editMessageMedia({type: 'photo', media: 'AgACAgIAAxkBAAIBQGRwpdUHgsO-VzXinFdsqtt53IflAAJcyzEb3-yIS8NvKBi2G2GKAQADAgADeAADLwQ', caption: '🥁 Выберите драмкит:'}, {reply_markup: {inline_keyboard: pxtpacks}})
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

bot.action('backtouslugi', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        await ctx.editMessageCaption('🛠 Выберите интересующую вас услугу:', {reply_markup: {inline_keyboard: uslugi_keyboards}})
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

bot.action('backtobeatsfold', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await ctx.replyWithPhoto('AgACAgIAAxkBAAIBQGRwpdUHgsO-VzXinFdsqtt53IflAAJcyzEb3-yIS8NvKBi2G2GKAQADAgADeAADLwQ', {caption: '🛠 Выберите услугу:', reply_markup: {inline_keyboard: uslug_beats_keyboards}})
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

bot.action('backtomnscenes', async ctx => {
    try {
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await ctx.replyWithPhoto('AgACAgIAAxkBAAIBQGRwpdUHgsO-VzXinFdsqtt53IflAAJcyzEb3-yIS8NvKBi2G2GKAQADAgADeAADLwQ', {caption: 'Я бот Потэйтоса ✨\n\nЕсли у тебя есть какие-то вопросы, пожелания или предложения - ты можешь описать их здесь 💬\n\nВыберите действие из списка👇🏻', reply_markup: {inline_keyboard: main_keyboards}})
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})

bot.action('backtosvedfold', async ctx => {
    try {
        if(ctx.scene.current != undefined) return await ctx.answerCbQuery() 
        await ctx.editMessageMedia({type: 'photo', media: 'AgACAgIAAxkBAAIBQGRwpdUHgsO-VzXinFdsqtt53IflAAJcyzEb3-yIS8NvKBi2G2GKAQADAgADeAADLwQ', caption: '🛠 Выберите услугу:'}, {reply_markup: {inline_keyboard: uslug_svedm_keyboards}})
        await ctx.answerCbQuery()
    } catch (e) {
        console.error(e);
    }
})



// bot.startWebhook('/', null, 3000);

bot.launch({dropPendingUpdates: true})
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));