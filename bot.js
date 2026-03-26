import { Bot, Keyboard } from '@maxhub/max-bot-api';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.BOT_TOKEN) {
    console.error('❌ BOT_TOKEN не найден');
    process.exit(1);
}

console.log('✅ Токен загружен');

const bot = new Bot(process.env.BOT_TOKEN);

// 🔘 Главное меню
const mainKeyboard = Keyboard.inlineKeyboard([
    [
        Keyboard.button.callback('📚 О клубе', 'about'),
        Keyboard.button.callback('📅 Онлайн расписание', 'schedule')
    ],
    [
        Keyboard.button.callback('💰 Цены', 'prices'),
        Keyboard.button.callback('📞 Контакты', 'contacts')
    ]
]);

// 🔥 старт (очень важно)
bot.on('bot_started', async (ctx) => {
    console.log('🔥 bot_started');

    await ctx.reply(
        '👋 Добро пожаловать в Инженерный клуб "Технологии будущего"!\n\nВыберите раздел:',
        { attachments: [mainKeyboard] }
    );
});

// 📩 сообщения
bot.on('message_created', async (ctx) => {
    const text = ctx.message?.body?.text;
    console.log('📩 Сообщение:', text);

    if (text === '/start') {
        await ctx.reply(
            '👋 Добро пожаловать!\n\nВыберите раздел:',
            { attachments: [mainKeyboard] }
        );
    }
});

// 📚 О клубе
bot.action('about', async (ctx) => {
    await ctx.reply('📚 О клубе...', { attachments: [mainKeyboard] });
});

// 📅 Расписание
bot.action('schedule', async (ctx) => {
    const kb = Keyboard.inlineKeyboard([
        [Keyboard.button.link('Открыть расписание', 'https://inzhenernyyklubtehnologiibuduschego.s20.online/common/1/online-schedule/embed?data_pc=59CD90&data_locale=ru')],
        [Keyboard.button.callback('⬅️ Назад', 'back')]
    ]);

    await ctx.reply('📅 Онлайн расписание:', { attachments: [kb] });
});

// 💰 Цены
bot.action('prices', async (ctx) => {
    await ctx.reply('💰 Цены...', { attachments: [mainKeyboard] });
});

// 📞 Контакты
bot.action('contacts', async (ctx) => {
    await ctx.reply('📞 Контакты...', { attachments: [mainKeyboard] });
});

// ⬅️ Назад
bot.action('back', async (ctx) => {
    await ctx.reply('Назад в меню', { attachments: [mainKeyboard] });
});

// ❗ ВАЖНО — запуск Long Polling
bot.startPolling();

console.log('🚀 Бот запущен (Long Polling)');
