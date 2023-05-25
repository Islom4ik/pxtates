const { Scenes, session, Telegraf, Markup } = require('telegraf');
require('dotenv').config();
const bot = new Telegraf(process.env.BOT_TOKEN);
module.exports = {Markup}
const { main_keyboards, predloj_keyboards, predloj_senderinfo, predloj_senderonv } = require('./additions/markups.js')  
const { collection, ObjectId } = require('./additions/db');
// bot.telegram.setWebhook('https://zade-production.up.railway.app', {max_connections: 50});
// const { DateTime } = require('luxon');
const { enter, leave } = Scenes.Stage;

const predlojka = new Scenes.BaseScene("predlojka");

predlojka.enter(async ctx => {
    try {
        return await ctx.reply('🥔 Предложите свою новость, отправить мем, изи задать мне вопрос: ', {reply_markup: {keyboard: [['Отменить 🔴']], resize_keyboard: true}})
    } catch (e) {
        console.error(e);
    }
})

predlojka.on('text', async ctx => {
    try {
        if(ctx.message.text == 'Отменить 🔴') {
            await ctx.reply('Отменено ✅', {reply_markup: {remove_keyboard: true}})
            await ctx.replyWithPhoto({source: './start.jpg'}, {caption: `Привет, ${ctx.from.first_name}! Я бот Потэйтоса ✨\n\nЕсли у тебя есть какие-то вопросы, пожелания или предложения - ты можешь описать их здесь 💬\n\nВыберите действие из списка👇🏻`, reply_markup: {inline_keyboard: main_keyboards}})
            return ctx.scene.leave('predlojka')
        }
        await ctx.reply('Отбработка...', {reply_markup: {remove_keyboard: true}})
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {predlmsg: ctx.message.message_id, predmsg: ctx.message.text}})
        await ctx.reply('Вы уверены что хотите отправить вами написанное предложение выше?', {reply_to_message_id: ctx.message.message_id, reply_markup: {inline_keyboard: predloj_keyboards}})
    } catch (e) {
        console.error(e);
    }
})

predlojka.action('predlojedit', async ctx => {
    try {
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await ctx.answerCbQuery('Загружаю...', {show_alert: false})
        await ctx.scene.enter('predlojka')
    } catch (e) {
        console.error(e);
    }
})

predlojka.action('predlojsend', async ctx => {
    try {
        const prid = await collection.findOne({_id: new ObjectId('646f07782ec51704c9ff90bd')})
        const predid = prid.predlojids + 1
        const db = await collection.findOne({user_id: ctx.from.id})
        await collection.findOneAndUpdate({_id: new ObjectId('646f07782ec51704c9ff90bd')}, {$set: {predlojids: predid}})
        await ctx.telegram.sendMessage(5103314362, `${predid}# | Новое сообщение с предложки:\n<i>${db.predmsg}</i>`, {reply_markup: {inline_keyboard: predloj_senderinfo}, parse_mode: "HTML"})
        try {
            await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        } catch (e) {
           console.log('ER'); 
        }
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {predsend: `${predid}`}})
        await ctx.replyWithPhoto({source: './start.jpg'}, {caption: `Привет, ${ctx.from.first_name}! Я бот Потэйтоса ✨\n\nЕсли у тебя есть какие-то вопросы, пожелания или предложения - ты можешь описать их здесь 💬\n\nВыберите действие из списка👇🏻`, reply_markup: {inline_keyboard: main_keyboards}})
        await ctx.answerCbQuery('Отправил ✅', {show_alert: false})
        await ctx.scene.leave('predlojka')
    } catch (e) {
        console.error(e);
    }
})

predlojka.action('predlojcancel', async ctx => {
    try {
        const db = await collection.findOne({user_id: ctx.from.id})
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await ctx.replyWithPhoto({source: './start.jpg'}, {caption: `Привет, ${ctx.from.first_name}! Я бот Потэйтоса ✨\n\nЕсли у тебя есть какие-то вопросы, пожелания или предложения - ты можешь описать их здесь 💬\n\nВыберите действие из списка👇🏻`, reply_markup: {inline_keyboard: main_keyboards}})
        await ctx.answerCbQuery('Отменено ✅', {show_alert: false})
        await ctx.scene.leave('predlojka')
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
        await ctx.reply('Отправил ✅')
        await ctx.replyWithPhoto({source: './start.jpg'}, {caption: `Привет, ${ctx.from.first_name}! Я бот Потэйтоса ✨\n\nЕсли у тебя есть какие-то вопросы, пожелания или предложения - ты можешь описать их здесь 💬\n\nВыберите действие из списка👇🏻`, reply_markup: {inline_keyboard: main_keyboards}})
        await ctx.scene.leave('pxtatansw')
    } catch (e) {
        console.error(e);
    }
})

const stage = new Scenes.Stage([predlojka, pxtatansw]);  
bot.use(session());
bot.use(stage.middleware());  

bot.start(async (ctx) => {
    try {
        await ctx.deleteMessage(ctx.message.message_id)
        const db = await collection.findOne({user_id: ctx.from.id})
        if(db == null) {
            await collection.insertOne({user_id: ctx.from.id, predsend: 'none', first_name: ctx.from.first_name, user_name: `@${ctx.from.username}` || 'Нету'})
            await collection.findOneAndUpdate({_id: new ObjectId('646f07782ec51704c9ff90bd')}, {$push: {users: ctx.from.id}})
        }
        await ctx.replyWithPhoto({source: './start.jpg'}, {caption: `Привет, ${ctx.from.first_name}! Я бот Потэйтоса ✨\n\nЕсли у тебя есть какие-то вопросы, пожелания или предложения - ты можешь описать их здесь 💬\n\nВыберите действие из списка👇🏻`, reply_markup: {inline_keyboard: main_keyboards}})
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
        await ctx.reply(`Я бот Потэйтоса ✨\n\nЕсли у тебя есть какие-то вопросы, пожелания или предложения - ты можешь описать их здесь 💬`)  
    } catch (e) {
        console.error(e);
    }
});

bot.action('predloj', async ctx => {
    try {
        const db = await collection.findOne({user_id: ctx.from.id})
        if(db.predsend != "none") {
            return await ctx.answerCbQuery('Вы не сможете отправлять новые предложения, пока PXTATES не проверит ваше последнее предложение! Я сообщу вам, как только предложка будет доступна...', {show_alert: true})
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
        const usdb = await collection.findOne({predsend: ctx.callbackQuery.message.text.split(' ')[0].replace('#', '')})
        await ctx.editMessageText(`${usdb.predsend}# | Данные отправителя:\n\n<b>USER ID:</b> <code>${usdb.user_id}</code>\n<b>USER NAME:</b> <code>${usdb.first_name}</code>\n<b>USER NAME:</b> ${usdb.user_name}`, {reply_markup: {inline_keyboard: predloj_senderonv}, parse_mode: "HTML"})
        await ctx.answerCbQuery('Вот его голова)', {show_alert: false})
    } catch (e) {
        console.error(e);
    }
})

bot.action('predlojacanc', async ctx => {
    try {
        const db = await collection.findOneAndUpdate({predsend: ctx.callbackQuery.message.text.split(' ')[0].replace('#', '')}, {$set: {predsend: 'none'}})
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await ctx.tg.sendMessage(db.value.user_id, '🟢 Предложка потаты снова доступна!')
        await ctx.answerCbQuery('Закрыто ✅', {show_alert: false})
    } catch (e) {
        console.error(e);
    }
})

bot.action('predlojsenderback', async ctx => {
    try {
        const db = await collection.findOne({predsend: ctx.callbackQuery.message.text.split(' ')[0].replace('#', '')})
        await ctx.editMessageText(`${db.predsend}# | Сообщение с предложки:\n<i>${db.predmsg}</i>`, {reply_markup: {inline_keyboard: predloj_senderinfo}, parse_mode: "HTML"})
        await ctx.answerCbQuery('Вернул ✅', {show_alert: false})
    } catch (e) {
        console.error(e);
    }
})

bot.action('predlojanswer', async ctx => {
    try {
        const db = await collection.findOne({predsend: ctx.callbackQuery.message.text.split(' ')[0].replace('#', '')})
        await collection.findOneAndUpdate({user_id: ctx.from.id}, {$set: {usertoansw: db.user_id}})
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await ctx.scene.enter('pxtatansw')
        await ctx.answerCbQuery('Загружаю...', {show_alert: false})
    } catch (e) {
        console.error(e);
    }
})




// bot.startWebhook('/', null, 3000);

bot.launch({dropPendingUpdates: true})
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));