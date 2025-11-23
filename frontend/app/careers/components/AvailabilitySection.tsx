import React from 'react';
import { InterviewAvailability } from '@/types';
import { Input } from '@/components/ui';

interface AvailabilitySectionProps {
  startDate: string;
  onStartDateChange: (date: string) => void;
  interviewAvailability: InterviewAvailability[];
  onInterviewAvailabilityChange: (availability: InterviewAvailability[]) => void;
  errors: {
    startDate?: string;
    interviewAvailability?: string;
  };
}

const timeSlots = [
  '8:00 AM - 9:00 AM',
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 1:00 PM',
  '1:00 PM - 2:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM',
];

export function AvailabilitySection({
  startDate,
  onStartDateChange,
  interviewAvailability,
  onInterviewAvailabilityChange,
  errors
}: AvailabilitySectionProps) {
  // Generate next 14 days (2 weeks) for interview availability
  const next14Days = React.useMemo(() => {
    const days: { date: string; display: string }[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      // Skip weekends
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days.push({
          date: date.toISOString().split('T')[0],
          display: date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })
        });
      }
    }
    
    return days;
  }, []);

  const toggleTimeSlot = (date: string, timeSlot: string) => {
    const existingDay = interviewAvailability.find(a => a.date === date);
    
    if (existingDay) {
      const hasSlot = existingDay.timeSlots.includes(timeSlot);
      const updatedAvailability = interviewAvailability.map(a => {
        if (a.date === date) {
          return {
            ...a,
            timeSlots: hasSlot 
              ? a.timeSlots.filter(s => s !== timeSlot)
              : [...a.timeSlots, timeSlot]
          };
        }
        return a;
      }).filter(a => a.timeSlots.length > 0); // Remove days with no slots
      
      onInterviewAvailabilityChange(updatedAvailability);
    } else {
      onInterviewAvailabilityChange([
        ...interviewAvailability,
        { date, timeSlots: [timeSlot] }
      ]);
    }
  };

  const isSlotSelected = (date: string, timeSlot: string) => {
    const day = interviewAvailability.find(a => a.date === date);
    return day ? day.timeSlots.includes(timeSlot) : false;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Availability
        </h3>
        <p className="text-sm text-gray-600">
          Help us schedule your interview by providing your availability.
        </p>
      </div>

      {/* Start Date Availability */}
      <div>
        <Input
          label="Earliest Start Date *"
          type="date"
          value={startDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onStartDateChange(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          error={errors.startDate}
          helperText="When would you be able to begin employment?"
        />
      </div>

      {/* Interview Availability */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Interview Availability (Next 2 Weeks) *
        </label>
        <p className="text-sm text-gray-600 mb-4">
          Select all time slots when you would be available for an interview. 
          Please select at least 3 different time slots to help us find a convenient time.
        </p>

        {errors.interviewAvailability && (
          <p className="text-sm text-red-600 mb-3">{errors.interviewAvailability}</p>
        )}

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-11 bg-gray-50 border-b border-gray-200">
            <div className="col-span-2 px-3 py-2 text-xs font-semibold text-gray-700">
              Time
            </div>
            {next14Days.slice(0, 9).map(day => (
              <div 
                key={day.date}
                className="px-2 py-2 text-center text-xs font-semibold text-gray-700 border-l border-gray-200"
              >
                {day.display}
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {timeSlots.map(slot => (
            <div key={slot} className="grid grid-cols-11 border-b border-gray-200 last:border-b-0">
              <div className="col-span-2 px-3 py-2 text-xs text-gray-600 flex items-center">
                {slot}
              </div>
              {next14Days.slice(0, 9).map(day => (
                <div 
                  key={day.date}
                  className="border-l border-gray-200 p-1 flex items-center justify-center"
                >
                  <button
                    type="button"
                    onClick={() => toggleTimeSlot(day.date, slot)}
                    className={`w-6 h-6 rounded border-2 transition-all ${
                      isSlotSelected(day.date, slot)
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-white border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {isSlotSelected(day.date, slot) && (
                      <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-3 text-sm text-gray-600">
          <span className="font-medium">
            Selected slots: {interviewAvailability.reduce((sum, day) => sum + day.timeSlots.length, 0)}
          </span>
          {interviewAvailability.length > 0 && (
            <button
              type="button"
              onClick={() => onInterviewAvailabilityChange([])}
              className="ml-4 text-blue-600 hover:text-blue-800"
            >
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
