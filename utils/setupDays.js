// setupDayjs.js or top of your main file
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

// Set default timezone globally (optional)
dayjs.tz.setDefault('Asia/Manila');

export default dayjs;
