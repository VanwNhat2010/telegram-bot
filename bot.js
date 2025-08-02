const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Thay thế bằng token bot của bạn
const BOT_TOKEN = "8280612700:AAFiIRFMfRo2KjE9ukQ-qkkVnDIxTtRqPes";

// Thay thế bằng ID của các nhóm yêu cầu người dùng tham gia
const REQUIRED_GROUP_IDS = [-1002783922741, -1002535895365];

// Thay thế bằng ID của admin
const ADMIN_ID = 6781092017;

// URL API của bạn
const API_URL = "https://sunwin-proxy-yyki.onrender.com/proxy";

// Khởi tạo bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Lưu trạng thái của key (lưu ý: sẽ mất khi bot khởi động lại)
const keys = {};

// Lệnh /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const user = msg.from;

    const keyboard = {
        inline_keyboard: [
            [
                { text: "NHÓM 1", url: "https://t.me/tnambipnhatnekkk" },
                { text: "NHÓM 2", url: "https://t.me/danhsaptaixiu001" },
            ],
            [{ text: "✅ TÔI ĐÃ VÀO", callback_data: "check_groups" }],
        ],
    };

    bot.sendMessage(
        chatId,
        `Chào mừng ${user.first_name}! Vui lòng tham gia các nhóm dưới đây để tiếp tục:`,
        { reply_markup: keyboard }
    );
});

// Xử lý nút "TÔI ĐÃ VÀO"
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const data = query.data;

    if (data === "check_groups") {
        await bot.answerCallbackQuery(query.id);

        let joinedAll = true;
        for (const groupId of REQUIRED_GROUP_IDS) {
            try {
                const member = await bot.getChatMember(groupId, userId);
                if (member.status === "left" || member.status === "kicked") {
                    joinedAll = false;
                    break;
                }
            } catch (error) {
                console.error(`Lỗi khi kiểm tra thành viên nhóm ${groupId}:`, error);
                joinedAll = false;
                break;
            }
        }

        const keyboard = {
            inline_keyboard: [
                [
                    { text: "NHÓM 1", url: "https://t.me/tnambipnhatnekkk" },
                    { text: "NHÓM 2", url: "https://t.me/danhsaptaixiu001" },
                ],
                [{ text: "✅ TÔI ĐÃ VÀO", callback_data: "check_groups" }],
            ],
        };

        if (joinedAll) {
            bot.editMessageText(
                "🎉 ĐÃ ĐĂNG KÍ THÀNH CÔNG 🎉\n\n" +
                "💥 IB QUA ADMIN ĐỂ LẤY KEY : @CsTool001",
                {
                    chat_id: chatId,
                    message_id: query.message.message_id,
                }
            );
        } else {
            bot.editMessageText(
                "⚠️ CHƯA VÀO ĐỦ CÁC NHÓM.\n\n" +
                "Vui lòng tham gia tất cả các nhóm trên để tiếp tục.",
                {
                    chat_id: chatId,
                    message_id: query.message.message_id,
                    reply_markup: keyboard,
                }
            );
        }
    }
});

// Lệnh /key <mã key>
bot.onText(/\/key (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userKey = match[1];

    if (!keys[userKey]) {
        bot.sendMessage(chatId, "❌ Key không hợp lệ.");
        return;
    }
    
    if (keys[userKey] === userId) {
        bot.sendMessage(chatId, "✅ Key này đã được bạn sử dụng.");
        return;
    }

    if (keys[userKey] !== null) {
        bot.sendMessage(chatId, "❌ Key đã được người khác sử dụng.");
        return;
    }

    // Gán key cho người dùng
    keys[userKey] = userId;
    bot.sendMessage(chatId, "✅ Key đã được nhập thành công! Bạn có thể sử dụng bot.");
});


// Lệnh /taokey <mã key> <số này> (chỉ admin)
bot.onText(/\/taokey (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    if (msg.from.id != ADMIN_ID) {
        bot.sendMessage(chatId, "Bạn không có quyền sử dụng lệnh này.");
        return;
    }
    
    const key = match[1];
    keys[key] = null;
    bot.sendMessage(chatId, `✅ Key '${key}' đã được tạo thành công.`);
});


// Lệnh /chaybot
bot.onText(/\/chaybot/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    // Kiểm tra key
    if (!Object.values(keys).includes(userId)) {
        bot.sendMessage(chatId, "❌ Vui lòng nhập key hợp lệ bằng lệnh /key.");
        return;
    }
        
    const message = await bot.sendMessage(chatId, "Bot đang khởi động, vui lòng đợi...");
    
    try {
        const response = await axios.get(API_URL);
        const data = response.data;
        
        const { phien, xuc_xac, tong, ket_qua, phien_sau, du_doan, do_tin_cay } = data;
        
        const messageText = (
            "♦️ SUNWIN VIP - PHÂN TÍCH CHUẨN XÁC ♦️\n" +
            "══════════════════════════\n" +
            `🆔 Phiên: ${phien}\n` +
            `🎲 Xúc xắc: ${xuc_xac}\n` +
            `🧮 Tổng điểm: ${tong} | Kết quả: ${ket_qua} ❌\n` +
            "──────────────────────────\n" +
            `🔮 Dự đoán phiên ${phien_sau}: ${du_doan}\n` +
            `📊 Độ tin cậy: ⚠️ THẤP (${do_tin_cay}%)\n` +
            `🎯 Khuyến nghị: Đặt cược ${du_doan}\n` +
            "\n" +
            "🧩 Pattern: N/A\n" +
            `⏱️ Thời gian: ${new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}\n` +
            "══════════════════════════\n" +
            "👥 Hệ thống phân tích Sunwin AI 👥\n" +
            "💎 Uy tín - Chính xác - Hiệu quả 💎"
        );
        
        bot.editMessageText(messageText, { chat_id: chatId, message_id: message.message_id });
        
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        bot.editMessageText(`❌ Lỗi khi gọi API: ${error.message}`, { chat_id: chatId, message_id: message.message_id });
    }
});


// Lệnh /tatbot
bot.onText(/\/tatbot/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Bot đã được tắt.");
});

console.log('Bot is running...');

