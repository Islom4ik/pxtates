const { Markup } = require("../index")

const main_keyboards = [[Markup.button.callback('🥁 Драмкит', 'dkit')], [Markup.button.callback('💬 Предложка потаты', 'predloj')], [Markup.button.url('⭐️ Зацен вне стрима', 'https://fantalks.io/r/pxtatxes')], [Markup.button.callback('🛠 Заказать услугу', 'zakaz_uslug'), Markup.button.callback('📈 Заказать рекламу', 'zakaz_reklamu')], [Markup.button.callback('💜 Донат', 'donat'), Markup.button.callback('🔗 Ссылки', 'links')], [Markup.button.callback('💡 Предложить идею', 'idea')], [Markup.button.callback('📂 Папки из видео', 'videodkits')]]

const predloj_keyboards = [[Markup.button.callback('Да, отправить 🟢', 'predlojsend'), Markup.button.callback('Нет, отменить 🔴', 'predlojcancel')],[Markup.button.callback('Редактировать 🟡', 'predlojedit')]]

const predloj_senderinfo = [[Markup.button.callback('👤 Кто отправил?', 'predlojsender')], [Markup.button.callback('📝 Ответить', 'predlojanswer'), Markup.button.callback('❌ Закрыть', 'predlojacanc')]]
const predloj_senderonv = [[Markup.button.callback('⬅️ Назад', 'predlojsenderback')], [Markup.button.callback('📝 Ответить', 'predlojanswer'), Markup.button.callback('❌ Закрыть', 'predlojacanc')]]

module.exports = {main_keyboards, predloj_keyboards, predloj_senderinfo, predloj_senderonv}