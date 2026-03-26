import fetch from 'node-fetch'; // npm install node-fetch@2
import dotenv from 'dotenv';
import { Keyboard } from '@maxhub/max-bot-api';

dotenv.config();

if (!process.env.BOT_TOKEN) {
    console.error('❌ BOT_TOKEN не найден');
    process.exit(1);
}

const BOT_TOKEN = process.env.BOT_TOKEN;
console.log('✅ Токен загружен');

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

// 🟢 Параметры Long Polling
let marker = null;
const POLL_TIMEOUT = 30; // сек

// 🔥 Основной цикл Long Polling
async function pollUpdates() {
    try {
        const url = new URL('https://platform-api.max.ru/updates');
        url.searchParams.append('limit', '100');
        url.searchParams.append('timeout', POLL_TIMEOUT.toString());
        if (marker) url.searchParams.append('marker', marker);

        const res = await fetch(url.toString(), {
            headers: { 'Authorization': BOT_TOKEN }
        });
        const data = await res.json();

        if (data.updates && data.updates.length) {
            for (const update of data.updates) {
                await handleUpdate(update);
                marker = update.update_id + 1; // обновляем marker
            }
        }

    } catch (err) {
        console.error('❌ Ошибка polling:', err);
    }

    // запускаем следующую итерацию
    setTimeout(pollUpdates, 1000);
}

// 🔹 Обработка обновлений
async function handleUpdate(update) {
    const type = update.update_type;
    const chat_id = update.chat_id;
    const payload = update.payload || null;
    const text = update.message?.body?.text;

    switch (type) {
        case 'bot_started':
            console.log('🔥 bot_started', 'payload:', payload);
            await sendMessage(chat_id, '👋 Добро пожаловать в Инженерный клуб "Технологии будущего"!\n\nВыберите раздел:', mainKeyboard);
            break;

        case 'message_created':
            console.log('📩 Сообщение:', text);
            if (text === '/start') {
                await sendMessage(chat_id, '👋 Добро пожаловать!\n\nВыберите раздел:', mainKeyboard);
            }
            break;

        case 'message_callback':
            const action = update.message?.callback?.data;
            console.log('🖱 Клик по кнопке:', action);
            await handleAction(chat_id, action);
            break;

        default:
            console.log('🔹 Необработанный тип:', type);
    }
}

// 🔹 Отправка сообщений
async function sendMessage(chat_id, text, keyboard = null) {
    const body = { chat_id, text };
    if (keyboard) body.attachments = [keyboard];

    try {
        await fetch('https://platform-api.max.ru/messages', {
            method: 'POST',
            headers: {
                'Authorization': BOT_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
    } catch (err) {
        console.error('❌ Ошибка отправки сообщения:', err);
    }
}

// 🔹 Обработка inline кнопок
async function handleAction(chat_id, action) {
    switch (action) {
        case 'about':
            await sendMessage(chat_id,
                '🔧 Инженерный клуб "Технологии будущего"\n\n• программирование\n• 3D-моделирование\n• робототехника\n\nРазвиваем навыки будущего 🚀',
                mainKeyboard
            );
            break;

        case 'schedule':
            const scheduleKeyboard = Keyboard.inlineKeyboard([
                [Keyboard.button.link(
                    'Открыть расписание',
                    'https://inzhenernyyklubtehnologiibuduschego.s20.online/common/1/online-schedule/embed?data_pc=59CD90&data_locale=ru'
                )],
                [Keyboard.button.callback('⬅️ Назад', 'back')]
            ]);
            await sendMessage(chat_id, '📅 Онлайн расписание:', scheduleKeyboard);
            break;

        case 'prices':
            await sendMessage(chat_id,
                '💰 Стоимость занятий:\n\n• Пробное занятие — бесплатно\n• Абонементы — уточняйте у администратора',
                mainKeyboard
            );
            break;

        case 'contacts':
            await sendMessage(chat_id,
                '📞 Контакты:\n\nТелефон: +7 XXX XXX-XX-XX\nАдрес: ваш адрес',
                mainKeyboard
            );
            break;

        case 'back':
            await sendMessage(chat_id, '⬅️ Назад в меню', mainKeyboard);
            break;

        default:
            console.log('❌ Неизвестное действие:', action);
    }
}

// 🚀 Старт Long Polling
console.log('🚀 Бот запущен (Long Polling)');
pollUpdates();
