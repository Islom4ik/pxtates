const { Markup } = require("../index")

const main_keyboards = [[Markup.button.callback('🥁 Драмкит', 'dkit')], [Markup.button.callback('💬 Предложка потаты', 'predloj')], [Markup.button.url('⭐️ Зацен вне стрима', 'https://fantalks.io/r/pxtatxes')], [Markup.button.callback('🛠 Заказать услугу', 'zakaz_uslug'), Markup.button.callback('📈 Заказать рекламу', 'zakaz_reklamu')], [Markup.button.callback('💜 Донат', 'donat'), Markup.button.callback('🔗 Ссылки', 'links')], [Markup.button.callback('💡 Предложить идею', 'idea')], [Markup.button.callback('📂 Паки из видео', 'videodkits')]]

const predloj_keyboards = [[Markup.button.callback('Да, отправить 🟢', 'predlojsend'), Markup.button.callback('Нет, отменить 🔴', 'predlojcancel')],[Markup.button.callback('Редактировать 🟡', 'predlojedit')]]

const predloj_senderinfo = [[Markup.button.callback('👤 Кто отправил?', 'predlojsender')], [Markup.button.callback('📝 Ответить', 'predlojanswer'), Markup.button.callback('❌ Закрыть', 'predlojacanc')]]
const predloj_senderonv = [[Markup.button.callback('⬅️ Назад', 'predlojsenderback')], [Markup.button.callback('📝 Ответить', 'predlojanswer'), Markup.button.callback('❌ Закрыть', 'predlojacanc')]]

const links = [[Markup.button.url('📽 YouTube', 'https://www.youtube.com/channel/UCqfrkuibnQSwzMHADk0fJOw')], [Markup.button.url('💙 TG канал', 'https://t.me/pxtatxes'), Markup.button.url('💬 Чатик TG', 'https://t.me/pxtatxeschat')], [Markup.button.url('🫡 VK', 'https://vk.com/pxtatxes'), Markup.button.url('🔗 Паблик VK', 'https://vk.com/pxtatxesofficial')], [Markup.button.url('⚡️ Boosty', 'https://boosty.to/pxtatxes')], [Markup.button.callback('⏪ Назад', 'backtomain')]]

const dlinks = [[Markup.button.url('💖 DonationAlerts', 'https://www.donationalerts.com/r/pxtatxes'), Markup.button.url('💗 DonatePay', 'https://donatepay.ru/uploads/qr/959482/8ce4b852-5b22-4bbe-8160-65295d33b616.png')], [Markup.button.callback('⏪ Назад', 'backtomain')]]

const vpacks = [[Markup.button.callback('@pxtatxes! - HELPER (MIDI KIT)', 'helpermdkit')], [Markup.button.callback('@pxtatxes! - "5 MINUTE" (Helper Pack)', 'fiveminutekit')], [Markup.button.callback('⏪ Назад', 'backtomain')]]

const pxtpacks = [[Markup.button.callback('@pxtatxes! - secret (drum kit) - 600₽', 'secretdkit')], [Markup.button.callback('⏪ Назад', 'backtomain')]]

const bpxtpacks = [[Markup.button.callback('✅ Приобрести', 'buykit')], [Markup.button.callback('⏪ Назад', 'backtopxtpacks')]]

const bpacks = [[Markup.button.callback('✅ Скачать', 'downkit')], [Markup.button.callback('⏪ Назад', 'backtopacks')]]

const reklam_keyboards = [[Markup.button.callback('❤️ YouTube', 'ytreklam')], [Markup.button.callback('💙 Telegram канал', 'tgreklam'), Markup.button.callback('🟦 Паблик VK', 'vkreklam')], [Markup.button.url('💸 Прайс на рекламу', 'https://docs.google.com/document/d/11I6kls5Qu3sqAq-2ILnGufvfUhQQD0QF_1bZhdMVuIE/edit?usp=sharing')], [Markup.button.callback('⏪ Назад', 'backtomain')]]

const uslugi_keyboards = [[Markup.button.callback('🎹 Биты', 'uslug_beats')], [Markup.button.callback('💿 Сведение / Мастеринг', 'uslug_svedmaster')], [Markup.button.callback('🖌 Дизайн и оформление', 'uslug_none')], [Markup.button.callback('🎙 Войстег', 'uslug_none')], [Markup.button.callback('⏪ Назад', 'backtomain')]]

const uslug_svedm_keyboards = [[Markup.button.callback('🛠 Сведение и Мастеринг', 'uslug_svedfold_svedm')], [Markup.button.callback('🎙 Обработка голоса', 'uslug_svedfold_vocalsett')], [Markup.button.callback('🎹 Корректировка бита', 'uslug_svedfold_beatscorr')], [Markup.button.callback('⏪ Назад', 'backtouslugi'), Markup.button.callback('❓ Цены и условия', 'uslug_svedfold_info')]]

const uslug_beats_keyboards = [[Markup.button.callback('🎹 Купить бит из списка', 'uslug_beatsfold_spisbeat')], [Markup.button.callback('🛠 Заказать бит', 'uslug_beatsfold_zakazbeat')], [Markup.button.callback('⏪ Назад', 'backtouslugi'), Markup.button.callback('❓ Цены и условия', 'uslug_beatsfold_info')]]

const lisenziya = [[Markup.button.callback('Аренда Wav', 'arendawav'), Markup.button.callback('Wav + Trackou', 'wptrackout')], [Markup.button.callback('Эксклюзивная лицензия', 'exclusive')], [Markup.button.callback('Отменить 🔴', 'cancspis')]]
module.exports = {main_keyboards, predloj_keyboards, predloj_senderinfo, predloj_senderonv, links, dlinks, vpacks, bpacks, pxtpacks, bpxtpacks, reklam_keyboards, uslugi_keyboards, uslug_svedm_keyboards, uslug_beats_keyboards, lisenziya}