const cron = require('node-cron');
const dayjs = require('dayjs');
const BillingsService = require('../services/BillingsService');
const UserAuthService = require('../services/UserAuthService');
const Billings = require('../models/Billings');

const isReminderDue = (billing) => {
    const now = dayjs();
    const due = dayjs(billing.dueDate);

    switch (billing.frequency) {
        case "Daily":
            return due.diff(now, "hour") <= 3 && due.isAfter(now);
        case "Weekly":
            return due.diff(now, "day") <= 1 && due.isAfter(now);
        case "Monthly":
            return due.diff(now, "day") <= 3 && due.isAfter(now);
        case "Yearly":
            return due.diff(now, "month") <= 1 && due.isAfter(now);
        default:
            return false;
    }
};

const frequencyBasedBillingReminder = async () => {
    try {
        const allBillings = await Billings.find({
            isReminded: false,
            isPaid: false,
        });

        const upcomingBillings = allBillings.filter(isReminderDue);
        const userMap = new Map();

        for (const billing of upcomingBillings) {
            if (!userMap.has(billing.userId)) userMap.set(billing.userId, []);
            userMap.get(billing.userId).push(billing);
        }

        for (const [userId, billings] of userMap.entries()) {
            const user = await UserAuthService.getUserById(userId);
            if (user) {
                await Promise.all(
                    billings.map((b) =>
                        BillingsService.updateBilling(b._id, { isReminded: true })
                    )
                );
                const plainedBillings = billings.map((b) => {
                    const obj = b.toObject ? b.toObject() : b;
                    // BillingsService.updateBilling(b._id, { isReminded: true })
                    return {
                        ...obj,
                        dueDate: dayjs(obj.dueDate).format("MMMM D, YYYY"),
                    };
                });

                await BillingsService.sendBillingReminder(plainedBillings, user);
            }
        }
    } catch (error) {
        console.error('Error in billing reminder job:', error);
    }
};

// Runs every 10mins server time
cron.schedule('*/10 * * * *', () => {
    console.log('Running per 10 minutes for billing reminder...');
    frequencyBasedBillingReminder();
});
