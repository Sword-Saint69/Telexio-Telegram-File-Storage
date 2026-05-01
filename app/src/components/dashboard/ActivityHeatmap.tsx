import { useMemo } from 'react';

interface ActivityHeatmapProps {
    data: { date: string; count: number }[];
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
    // Generate a simple heatmap for the last 3 months
    const weeks = useMemo(() => {
        const result = [];
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - 90); // 90 days

        let currentDay = new Date(start);
        while (currentDay <= today) {
            const week = [];
            for (let i = 0; i < 7 && currentDay <= today; i++) {
                const dateStr = currentDay.toISOString().split('T')[0];
                const dayData = data.find(d => d.date === dateStr);
                week.push({
                    date: dateStr,
                    count: dayData ? dayData.count : 0
                });
                currentDay.setDate(currentDay.getDate() + 1);
            }
            result.push(week);
        }
        return result;
    }, [data]);

    const getColor = (count: number) => {
        if (count === 0) return 'bg-telegram-border/30';
        if (count < 3) return 'bg-telegram-primary/30';
        if (count < 7) return 'bg-telegram-primary/60';
        return 'bg-telegram-primary';
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex gap-1 overflow-x-auto pb-2 custom-scrollbar">
                {weeks.map((week, i) => (
                    <div key={i} className="flex flex-col gap-1">
                        {week.map((day, j) => (
                            <div
                                key={j}
                                className={`w-2.5 h-2.5 rounded-sm ${getColor(day.count)} transition-colors hover:ring-2 hover:ring-telegram-primary/50`}
                                title={`${day.date}: ${day.count} uploads`}
                            />
                        ))}
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-between text-[8px] text-telegram-subtext uppercase tracking-widest font-bold">
                <span>90 days ago</span>
                <span>Today</span>
            </div>
        </div>
    );
}
