import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

if (!process.env.BOT_TOKEN) {
  console.error('❌ BOT_TOKEN не найден');
  process.exit(1);
}

const BOT_TOKEN = process.env.BOT_TOKEN;
let marker = null;

// Главное меню
const mainMenu = [
  { text: '📚 О клубе', callback: 'about' },
  { text: '📅 Онлайн расписание', callback: 'schedule' },
  { text: '💰 Цены', callback: 'prices' },
  { text: '📞 Контакты', callback: 'contacts' },
];

// Функция отправки сообщений
async function sendMessage(chatId, text, keyboard = null) {
  const body = {
    chat_id: chatId,
    text: text,
  };

  if (keyboard) body.attachments = [{ type: 'keyboard', buttons: keyboard }];

  try {
    await fetch('https://platform-api.max.ru/send_message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: BOT_TOKEN,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error('❌ Ошибка отправки сообщения:', err);
  }
}

// Преобразуем меню в формат кнопок MAX
function formatKeyboard(menu) {
  const buttons = menu.map((btn) => [
    { type: 'callback', text: btn.text, payload: btn.callback },
  ]);
  return buttons;
}

// Обработка обновлений
async function handleUpdate(update) {
  const chatId = update.chat_id;

  switch (update.update_type) {
    case 'bot_started':
      await sendMessage(
        chatId,
        '👋 Добро пожаловать в Инженерный клуб "Технологии будущего"!\n\nВыберите раздел:',
        formatKeyboard(mainMenu)
      );
      break;

    case 'message_created':
      const text = update.message.body.text;
      console.log('📩 Сообщение:', text);
      if (text === '/start') {
        await sendMessage(
          chatId,
          '👋 Добро пожаловать!\n\nВыберите раздел:',
          formatKeyboard(mainMenu)
        );
      }
      break;

    case 'message_callback':
      const payload = update.message.body.payload;
      switch (payload) {
        case 'about':
          await sendMessage(
            chatId,
            '🔧 Инженерный клуб "Технологии будущего"\n\n• программирование\n• 3D-моделирование\n• робототехника\n\nРазвиваем навыки будущего 🚀',
            formatKeyboard(mainMenu)
          );
          break;
        case 'schedule':
          await sendMessage(
            chatId,
            '📅 Онлайн расписание: https://inzhenernyyklubtehnologiibuduschego.s20.online/common/1/online-schedule/embed?data_pc=59CD90&data_locale=ru',
            formatKeyboard(mainMenu)
          );
          break;
        case 'prices':
          await sendMessage(
            chatId,
            '💰 Стоимость занятий:\n\n• Пробное занятие — бесплатно\n• Абонементы — уточняйте у администратора',
            formatKeyboard(mainMenu)
          );
          break;
        case 'contacts':
          await sendMessage(
            chatId,
            '📞 Контакты:\n\nТелефон: +7 XXX XXX-XX-XX\nАдрес: ваш адрес',
            formatKeyboard(mainMenu)
          );
          break;
      }
      break;
  }
}

// Long Polling
async function pollUpdates() {
  try {
    const url = new URL('https://platform-api.max.ru/updates');
    if (marker) url.searchParams.set('marker', marker);
    url.searchParams.set('limit', '100');
    url.searchParams.set('timeout', '30');

    const res = await fetch(url.toString(), {
      headers: { Authorization: BOT_TOKEN },
    });

    const data = await res.json();

    for (const update of data.updates || []) {
      marker = update.update_id + 1;
      await handleUpdate(update);
    }
  } catch (err) {
    console.error('❌ Ошибка Long Polling:', err);
  } finally {
    setTimeout(pollUpdates, 1000);
  }
}

console.log('🚀 Бот запущен (Long Polling)');
pollUpdates();
