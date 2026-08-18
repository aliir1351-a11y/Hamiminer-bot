const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// فایل HTML را در مسیر ریشه نمایش بده
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Hamiminer_v10-4.html'));
});

let browser = null;
let page = null;

async function startBot() {
  console.log('🚀 راه‌اندازی مرورگر بدون رابط (Headless)...');
  try {
    // راه‌اندازی مرورگر با تنظیمات مخصوص سرور (رندر)
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // اتصال به سرور محلی که خودمان بالا آوردیم
    const url = `http://localhost:${PORT}`;
    console.log(`🌐 اتصال به ${url} ...`);
    
    // صبر می‌کنیم تا محتوای اصلی صفحه لود شود (توجه: WebSocket بی‌نهایت است، پس فقط DOM را لود کن)
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // صبر می‌کنیم تا دکمه‌های برنامه ظاهر شوند
    console.log('⏳ منتظر بارگذاری کامل دکمه‌ها...');
    await page.waitForSelector('#btnStart', { timeout: 60000 });

    // 【کلیک روی دکمه‌ی شروع شکارچی】
    console.log('🖱️ کلیک روی دکمه «شروع شکارچی»...');
    await page.click('#btnStart');
    
    // 【اختیاری: اگر می‌خواهید ماینر هم شروع شود، کامنت زیر را باز کنید】
    // await page.click('#btnMinerStart'); 

    console.log('✅ ربات با موفقیت روی سرور رندر روشن شد!');

    // هر ۵ دقیقه یک لاگ بده تا نشان دهد زنده است
    setInterval(() => {
      console.log('💓 ضربان قلب ربات: ' + new Date().toISOString());
    }, 300000);

  } catch (error) {
    console.error('❌ خطا در راه‌اندازی ربات:', error.message);
    // اگر خطا خورد، ۳۰ ثانیه صبر کن و دوباره تلاش کن
    setTimeout(startBot, 30000);
  }
}

// سرور را روشن کن
const server = app.listen(PORT, () => {
  console.log(`✅ سرور وب روی پورت ${PORT} راه‌اندازی شد.`);
  startBot(); // بلافاصله ربات را استارت بزن
});

// وقتی سرور خاموش می‌شود، مرورگر را هم ببند
process.on('SIGINT', async () => {
  console.log('🛑 در حال خاموش‌سازی امن...');
  if (browser) await browser.close();
  server.close(() => process.exit(0));
});