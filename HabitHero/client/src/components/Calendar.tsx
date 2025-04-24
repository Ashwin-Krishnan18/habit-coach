import React, { useState, useEffect } from "react";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarProps {
  checkIns: Array<{
    habitId: number;
    date: string;
    completed: boolean;
  }>;
}

export default function Calendar({ checkIns }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  useEffect(() => {
    console.log('Calendar received checkIns:', checkIns);
  }, [checkIns]);
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Calculate empty cells for days of week alignment
  const startDay = monthStart.getDay();
  const emptyDays = Array.from({ length: startDay }, (_, i) => i);
  
  // Group check-ins by date
  const checkInsByDate = checkIns.reduce((acc, checkIn) => {
    const date = new Date(checkIn.date).toDateString();
    console.log('Processing checkIn:', checkIn, 'for date:', date);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(checkIn);
    return acc;
  }, {} as Record<string, typeof checkIns>);
  
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">Habit Calendar</h2>
      
      <Glassmorphism className="rounded-xl p-4 md:p-6 overflow-x-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold gradient-text">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <div className="flex space-x-2">
            <button 
              className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
              onClick={prevMonth}
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button 
              className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
              onClick={nextMonth}
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 text-center">
          <div className="text-gray-500 text-sm font-medium">Sun</div>
          <div className="text-gray-500 text-sm font-medium">Mon</div>
          <div className="text-gray-500 text-sm font-medium">Tue</div>
          <div className="text-gray-500 text-sm font-medium">Wed</div>
          <div className="text-gray-500 text-sm font-medium">Thu</div>
          <div className="text-gray-500 text-sm font-medium">Fri</div>
          <div className="text-gray-500 text-sm font-medium">Sat</div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {/* Empty cells for previous month */}
          {emptyDays.map((day) => (
            <div key={`empty-${day}`} className="h-16 md:h-24 rounded-lg bg-dark-800 opacity-50"></div>
          ))}
          
          {/* Calendar days */}
          {monthDays.map((day) => {
            const dayString = day.toDateString();
            const dayCheckIns = checkInsByDate[dayString] || [];
            const completedCheckIns = dayCheckIns.filter(c => c.completed);
            const missedCheckIns = dayCheckIns.filter(c => !c.completed);
            
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "calendar-day relative h-16 md:h-24 rounded-lg p-1 md:p-2",
                  isToday(day) 
                    ? "gradient-border bg-dark-600" 
                    : "bg-dark-700"
                )}
              >
                <div className="text-xs font-medium">{format(day, "d")}</div>
                
                {isToday(day) && (
                  <div className="text-[8px] md:text-[10px] absolute top-1 left-1 md:top-2 md:left-2 text-white font-medium">
                    Today
                  </div>
                )}
                
                <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 flex flex-wrap justify-end gap-1 md:gap-1.5">
                  {completedCheckIns.map((checkIn, i) => (
                    <div 
                      key={`completed-${checkIn.habitId}-${i}`}
                      className={cn(
                        "w-2 h-2 md:w-3 md:h-3 rounded-full bg-accent-success",
                        isToday(day) && "animate-pulse"
                      )}
                    />
                  ))}
                  
                  {missedCheckIns.map((checkIn, i) => (
                    <div 
                      key={`missed-${checkIn.habitId}-${i}`}
                      className={cn(
                        "w-2 h-2 md:w-3 md:h-3 rounded-full bg-accent-danger",
                        isToday(day) && "animate-pulse-slow"
                      )}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 flex items-center justify-center space-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-accent-success mr-2"></div>
            <span className="text-sm text-gray-400">Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-accent-danger mr-2"></div>
            <span className="text-sm text-gray-400">Missed</span>
          </div>
        </div>
      </Glassmorphism>
    </section>
  );
}
