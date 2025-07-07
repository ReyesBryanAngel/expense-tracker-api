const cron = require('node-cron');
const dayjs = require('../utils/setupDays').default;
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

const resetRecurringBillings = async (frequency) => {
    try {
        const billings = await Billings.find({ frequency, isPaid: true });

        for (const billing of billings) {
            const currentDue = dayjs(billing.dueDate);
            let newDueDate;

            switch (frequency) {
                case "Daily":
                    newDueDate = currentDue.add(1, 'day');
                    break;
                case "Weekly":
                    newDueDate = currentDue.add(1, 'week');
                    break;
                case "Monthly":
                    newDueDate = currentDue.add(1, 'month');
                    break;
                case "Yearly":
                    newDueDate = currentDue.add(1, 'year');
                    break;
                default:
                    continue;
            }

            await Billings.updateOne(
                { _id: billing._id },
                {
                    $set: {
                        isPaid: false,
                        isReminded: false,
                        dueDate: newDueDate.toDate()
                    }
                }
            );
        }

        console.log(`[RESET] Updated ${billings.length} ${frequency} billings`);
    } catch (error) {
        console.error(`[RESET] Error resetting ${frequency} billings:`, error);
    }
};


const frequencyBasedBillingReminder = async () => {
    try {
        const allBillings = await Billings.find({ isReminded: false, isPaid: false });
        const upcomingBillings = allBillings.filter(isReminderDue);
        const userMap = new Map();

        for (const billing of upcomingBillings) {
            if (!userMap.has(billing.userId)) userMap.set(billing.userId, []);
            userMap.get(billing.userId).push(billing);
        }

        for (const [userId, billings] of userMap.entries()) {
            const user = await UserAuthService.getUserById(userId);
            if (user) {
                await Promise.all(billings.map((b) =>
                    BillingsService.updateBilling(b._id, { isReminded: true })
                ));

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

// Reset isPaid and isReminded flags based on billing frequency
cron.schedule('0 6 * * *', () => resetRecurringBillings('Daily')); // Every day at 6 AM
// cron.schedule('57 15 * * *', () => resetRecurringBillings('Daily'));
cron.schedule('0 6 * * 1', () => resetRecurringBillings('Weekly')); // Every Monday at 6 AM
cron.schedule('0 6 1 * *', () => resetRecurringBillings('Monthly')); // 1st of every month at 6 AM
cron.schedule('0 6 1 1 *', () => resetRecurringBillings('Yearly')); // Jan 1st at 6 AM

// Run reminder job every 10 minutes
cron.schedule('* * * * *', () => {
    console.log('Running billing reminder job...');
    frequencyBasedBillingReminder();
});
