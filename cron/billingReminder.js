const cron = require('node-cron');
const dayjs = require('dayjs');
const BillingsService = require('../services/BillingsService');
const UserAuthService = require('../services/UserAuthService');
const transporter = require('../config/nodemailer');

const runBillingReminderJob = async () => {
    try {
        const targetDate = dayjs().add(3, 'day').format('YYYY-MM-DD');
        const billings = await BillingsService.getAllBillingsDueOn(targetDate);
        const userMap = new Map();

        for (const billing of billings) {
            if (!userMap.has(billing.userId)) userMap.set(billing.userId, []);
            userMap.get(billing.userId).push(billing);
        }

        // 2. Send reminders per user
        for (const [userId, userBillings] of userMap.entries()) {
            const user = await UserAuthService.getUserById(userId);
            if (user) {
                const plainedBillings = await userBillings?.map(billing => {
                    const obj = billing.toObject ? billing.toObject() : billing;
                    BillingsService.updateBilling(obj._id, { ...obj, isReminded: true });
                    return {
                        ...obj,
                        dueDate: dayjs(obj.dueDate).format('MMMM D, YYYY'),
                    }
                })

                await BillingsService.sendBillingReminder(plainedBillings, user);
            }
        }
        console.log('Billing reminder job ran successfully');
    } catch (error) {
        console.error('Error in billing reminder job:', error);
    }
};

// Runs every day at 8 AM server time
cron.schedule('0 8 * * *', () => {
    console.log('Running daily at 8am for billing reminder...');
    runBillingReminderJob();
});
