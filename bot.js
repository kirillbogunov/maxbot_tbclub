import { Bot, Keyboard } from '@maxhub/max-bot-api';
import dotenv from 'dotenv';

dotenv.config();

// 🔥 проверка токена
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

// 🚀 Старт через command (иногда не срабатывает)
bot.command('start', async (ctx) => {
    console.log('👉 command /start');

    await ctx.reply(
        '👋 Добро пожаловать в Инженерный клуб "Технологии будущего"!\n\nВыберите раздел:',
        { attachments: [mainKeyboard] }
    );
});

// 🚀 Гарантированный старт через обычное сообщение
bot.on('message_created', async (ctx) => {
    const text = ctx.message?.body?.text;

    console.log('📩 Сообщение:', text);

    if (text === '/start') {
        await ctx.reply(
            '👋 Добро пожаловать в Инженерный клуб "Технологии будущего"!\n\nВыберите раздел:',
            { attachments: [mainKeyboard] }
        );
    }
});


// 📚 О клубе
bot.action('about', async (ctx) => {
    await ctx.reply(
        '🔧 Инженерный клуб "Технологии будущего"\n\n' +
        '• программирование\n' +
        '• 3D-моделирование\n' +
        '• робототехника\n\n' +
        'Развиваем навыки будущего 🚀',
        { attachments: [mainKeyboard] }
    );
});


// 📅 Онлайн расписание
bot.action('schedule', async (ctx) => {
    const scheduleKeyboard = Keyboard.inlineKeyboard([
        [
            Keyboard.button.link(
                'Открыть расписание',
                'https://inzhenernyyklubtehnologiibuduschego.s20.online/common/1/online-schedule/embed?data_pc=59CD90&data_locale=ru'
            )
        ],
        [
            Keyboard.button.callback('⬅️ Назад', 'back')
        ]
    ]);

    await ctx.reply('📅 Онлайн расписание:', {
        attachments: [scheduleKeyboard]
    });
});


// 💰 Цены
bot.action('prices', async (ctx) => {
    await ctx.reply(
        '💰 Стоимость занятий:\n\n' +
        '• Пробное занятие — бесплатно\n' +
        '• Абонементы — уточняйте у администратора',
        { attachments: [mainKeyboard] }
    );
});


// 📞 Контакты
bot.action('contacts', async (ctx) => {
    await ctx.reply(
        '📞 Контакты:\n\n' +
        'Телефон: +7 XXX XXX-XX-XX\n' +
        'Адрес: ваш адрес',
        { attachments: [mainKeyboard] }
    );
});


// ⬅️ Назад
bot.action('back', async (ctx) => {
    await ctx.reply('Выберите раздел:', {
        attachments: [mainKeyboard]
    });
});


// 🚀 запуск
bot.start();

console.log('🚀 Бот запущен');