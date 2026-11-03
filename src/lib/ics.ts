import { format } from 'date-fns';

export interface CalendarEvent {
    title: string;
    startDate: Date;
    endDate: Date;
    type?: string;
    description?: string;
    location?: string;
    recurrence?: 'weekly' | 'none';
    days?: string[];
    reminder?: number;
}

export const generateICS = (events: CalendarEvent[]): string => {
    const formatDate = (date: Date) => {
        return format(date, "yyyyMMdd'T'HHmmss");
    };

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Kalendafy//NONSGML v1.0//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
    ];

    events.forEach((event) => {
        icsContent.push('BEGIN:VEVENT');
        icsContent.push(`SUMMARY:${event.title}`);
        icsContent.push(`DTSTART:${formatDate(event.startDate)}`);
        icsContent.push(`DTEND:${formatDate(event.endDate)}`);

        if (event.description) {
            icsContent.push(`DESCRIPTION:${event.description}`);
        }

        if (event.location) {
            icsContent.push(`LOCATION:${event.location}`);
        }

        if (event.recurrence === 'weekly' && event.days && event.days.length > 0) {
            icsContent.push(`RRULE:FREQ=WEEKLY;BYDAY=${event.days.join(',')}`);
        }

        if (event.reminder) {
            icsContent.push('BEGIN:VALARM');
            icsContent.push('TRIGGER:-PT' + event.reminder + 'M');
            icsContent.push('ACTION:DISPLAY');
            icsContent.push(`DESCRIPTION:Reminder for ${event.title}`);
            icsContent.push('END:VALARM');
        }

        icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    return icsContent.join('\r\n');
};

export const downloadICS = (icsString: string, filename: string) => {
    const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
