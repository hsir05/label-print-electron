import fs from 'fs';
import path from 'path';

const EXPIRE_TIME = new Date('2025-07-16T23:59:59').getTime();
// 存储首次运行时间的本地文件路径（可放在用户目录下更隐蔽）
const firstRunFile = path.join(process.env.APPDATA || __dirname, 'first_run_time.txt');
console.log(firstRunFile);

export function checkTrialValid(): { valid: boolean; reason?: string } {
    const now = Date.now();
    // 1. 首次运行，写入首次运行时间
    if (!fs.existsSync(firstRunFile)) {
        fs.writeFileSync(firstRunFile, now.toString(), 'utf8');
    }
    // 2. 读取首次运行时间
    const firstRun = Number(fs.readFileSync(firstRunFile, 'utf8'));
    // 3. 检查时间回拨
    if (now < firstRun) {
        return { valid: false, reason: '检测到系统时间回拨，禁止使用！' };
    }
    // 4. 检查是否过期
    if (now > EXPIRE_TIME) {
        return { valid: false, reason: '体验版已到期，禁止使用！' };
    }
    return { valid: true };
}