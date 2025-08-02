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

// Lưu trạng thái của các bot tự động (để có thể bật/tắt)
const activeBots = {}; // Cấu trúc: { userId: { intervalId: number, lastPhien: string } }

// --- Các hàm xử lý lệnh ---

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

    if (!(userKey in keys)) {
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

// Hàm lấy dữ liệu và gửi tin nhắn
async function fetchAndSendUpdate(chatId, userId) {
    try {
        const response = await axios.get(API_URL);
        const data = response.data;
        const currentPhien = data.phien;

        // Tránh gửi tin nhắn trùng lặp
        if (activeBots[userId] && activeBots[userId].lastPhien === currentPhien) {
            return;
        }

        if (activeBots[userId]) {
            activeBots[userId].lastPhien = currentPhien;
        }

        // Lấy dữ liệu từ API một cách an toàn
        const {
            phien = "N/A",
            xuc_xac = "N/A",
            tong = "N/A",
            ket_qua = "N/A",
            phien_sau = "N/A",
            du_doan = "N/A",
            do_tin_cay = "N/A",
            pattern_nhan_dien = "N/A",
        } = data;

        const messageText = (
            "♦️ SUNWIN VIP - PHÂN TÍCH CHUẨN XÁC ♦️\n" +
            "══════════════════════════\n" +
            `🆔 Phiên: ${phien}\n` +
            `🎲 Xúc xắc: ${Array.isArray(xuc_xac) ? xuc_xac.join(', ') : xuc_xac}\n` +
            `🧮 Tổng điểm: ${tong} | Kết quả: ${ket_qua} ❌\n` +
            "──────────────────────────\n" +
            `🔮 Dự đoán phiên ${phien_sau}: ${du_doan}\n` +
            `📊 Độ tin cậy: ⚠️ THẤP (${do_tin_cay}%)\n` +
            `🎯 Khuyến nghị: Đặt cược ${du_doan}\n` +
            "\n" +
            `🧩 Pattern: ${pattern_nhan_dien}\n` +
            `⏱️ Thời gian: ${new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}\n` +
            "══════════════════════════\n" +
            "👥 Hệ thống phân tích Sunwin AI 👥\n" +
            "💎 Uy tín - Chính xác - Hiệu quả 💎"
        );

        bot.sendMessage(chatId, messageText);

    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        let errorMessage = "Lỗi không xác định.";
        if (axios.isAxiosError(error)) {
            if (error.response) {
                // Lỗi từ phía server (ví dụ: 502)
                errorMessage = `Lỗi khi gọi API: Request failed with status code ${error.response.status}`;
            } else if (error.request) {
                // Lỗi không nhận được phản hồi (mạng, timeout)
                errorMessage = `Lỗi khi gọi API: Không nhận được phản hồi từ server. Vui lòng thử lại sau.`;
            } else {
                // Lỗi khác khi thiết lập request
                errorMessage = `Lỗi khi gọi API: ${error.message}`;
            }
        } else {
            errorMessage = `Lỗi khi gọi API: ${error.message}`;
        }
        bot.sendMessage(chatId, `❌ ${errorMessage}`);
    }
}

// Lệnh /batbot - Khởi động chế độ tự động
bot.onText(/\/batbot/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!Object.values(keys).includes(userId)) {
        bot.sendMessage(chatId, "❌ Vui lòng nhập key hợp lệ bằng lệnh /key.");
        return;
    }

    if (activeBots[userId]) {
        bot.sendMessage(chatId, "⚠️ Bot đã được khởi động rồi.");
        return;
    }

    const intervalId = setInterval(() => fetchAndSendUpdate(chatId, userId), 15000); // Tự động cập nhật mỗi 15 giây
    activeBots[userId] = { intervalId: intervalId, lastPhien: null };

    bot.sendMessage(chatId, "✅ Bot đã được khởi động tự động. Dữ liệu sẽ được cập nhật liên tục.");
    fetchAndSendUpdate(chatId, userId);
});

// Lệnh /dungbot - Dừng chế độ tự động
bot.onText(/\/dungbot/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (activeBots[userId]) {
        clearInterval(activeBots[userId].intervalId);
        delete activeBots[userId];
        bot.sendMessage(chatId, "✅ Bot đã được dừng.");
    } else {
        bot.sendMessage(chatId, "⚠️ Bot chưa được khởi động.");
    }
});

console.log('Bot is running...');
