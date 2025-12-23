import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';

interface DateRangePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (checkIn: Date, checkOut: Date) => void;
  initialCheckIn?: Date;
  initialCheckOut?: Date;
}

type SelectionMode = 'checkIn' | 'checkOut';

export const DateRangePickerModal: React.FC<DateRangePickerModalProps> = ({
  visible,
  onClose,
  onConfirm,
  initialCheckIn,
  initialCheckOut,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [checkInDate, setCheckInDate] = useState<Date>(initialCheckIn || today);
  const [checkOutDate, setCheckOutDate] = useState<Date>(() => {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return initialCheckOut || tomorrow;
  });
  const [currentMonth, setCurrentMonth] = useState<Date>(today);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('checkIn');
  const [checkInInput, setCheckInInput] = useState<string>('');
  const [checkOutInput, setCheckOutInput] = useState<string>('');

  useEffect(() => {
    if (visible) {
      const resetToday = new Date();
      resetToday.setHours(0, 0, 0, 0);
      const initCheckIn = initialCheckIn || resetToday;
      setCheckInDate(initCheckIn);
      setCurrentMonth(initCheckIn);
      setSelectionMode('checkIn');

      const resetTomorrow = new Date(resetToday);
      resetTomorrow.setDate(resetTomorrow.getDate() + 1);
      const initCheckOut = initialCheckOut || resetTomorrow;
      setCheckOutDate(initCheckOut);

      // Set input values
      setCheckInInput(formatInputDate(initCheckIn));
      setCheckOutInput(formatInputDate(initCheckOut));
    }
  }, [visible, initialCheckIn, initialCheckOut]);

  const formatInputDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseInputDate = (input: string): Date | null => {
    const parts = input.split('/');
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const year = parseInt(parts[2]);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (day < 1 || day > 31 || month < 0 || month > 11 || year < 2000)
      return null;

    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);

    // Validate the date is valid
    if (
      date.getDate() !== day ||
      date.getMonth() !== month ||
      date.getFullYear() !== year
    ) {
      return null;
    }

    return date;
  };

  const formatMonthYear = (date: Date) => {
    const months = [
      'Tháng 1',
      'Tháng 2',
      'Tháng 3',
      'Tháng 4',
      'Tháng 5',
      'Tháng 6',
      'Tháng 7',
      'Tháng 8',
      'Tháng 9',
      'Tháng 10',
      'Tháng 11',
      'Tháng 12',
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const calculateNights = () => {
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isInRange = (date: Date) => {
    return date > checkInDate && date < checkOutDate;
  };

  const isPastDate = (date: Date) => {
    const compareToday = new Date();
    compareToday.setHours(0, 0, 0, 0);
    return date < compareToday;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const handleDateSelect = (date: Date) => {
    if (selectionMode === 'checkIn') {
      setCheckInDate(date);
      setCheckInInput(formatInputDate(date));
      // Auto-adjust checkout if it's before new check-in
      if (date >= checkOutDate) {
        const newCheckOut = new Date(date);
        newCheckOut.setDate(newCheckOut.getDate() + 1);
        setCheckOutDate(newCheckOut);
        setCheckOutInput(formatInputDate(newCheckOut));
      }
      setSelectionMode('checkOut');
    } else {
      // Check-out mode
      if (date <= checkInDate) {
        // If selected date is before check-in, set it as new check-in
        setCheckInDate(date);
        setCheckInInput(formatInputDate(date));
        const newCheckOut = new Date(date);
        newCheckOut.setDate(newCheckOut.getDate() + 1);
        setCheckOutDate(newCheckOut);
        setCheckOutInput(formatInputDate(newCheckOut));
        setSelectionMode('checkOut');
      } else {
        setCheckOutDate(date);
        setCheckOutInput(formatInputDate(date));
      }
    }
  };

  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const handleCheckInInputChange = (text: string) => {
    setCheckInInput(text);
    const parsed = parseInputDate(text);
    if (parsed) {
      setCheckInDate(parsed);
      setCurrentMonth(parsed);
      // Auto-adjust checkout if needed
      if (parsed >= checkOutDate) {
        const newCheckOut = new Date(parsed);
        newCheckOut.setDate(newCheckOut.getDate() + 1);
        setCheckOutDate(newCheckOut);
        setCheckOutInput(formatInputDate(newCheckOut));
      }
    }
  };

  const handleCheckOutInputChange = (text: string) => {
    setCheckOutInput(text);
    const parsed = parseInputDate(text);
    if (parsed) {
      if (parsed <= checkInDate) {
        // If before check-in, adjust to be at least 1 day after
        const newCheckOut = new Date(checkInDate);
        newCheckOut.setDate(newCheckOut.getDate() + 1);
        setCheckOutDate(newCheckOut);
        setCheckOutInput(formatInputDate(newCheckOut));
      } else {
        setCheckOutDate(parsed);
      }
    }
  };

  const handleConfirm = () => {
    onConfirm(checkInDate, checkOutDate);
    onClose();
  };

  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  return (
    <Modal
      visible={visible}
      animationType='slide'
      transparent
      onRequestClose={onClose}
    >
      <View className='flex-1 justify-end bg-black/50'>
        <View className='max-h-[90%] rounded-t-3xl bg-white px-5 pb-8 pt-2'>
          {/* Handle bar */}
          <View className='mb-4 h-1 w-10 self-center rounded-full bg-neutral-lighter' />

          {/* Header */}
          <View className='mb-5 flex-row items-center justify-between'>
            <Text className='text-2xl font-bold text-neutral-darkest'>
              Chọn ngày
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name='close' size={28} color='#64748b' />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Date Selection Summary */}
            <View className='mb-5 rounded-2xl bg-neutral-lightest p-4'>
              <View className='flex-row items-center justify-between'>
                {/* Check-in */}
                <View className='flex-1'>
                  <Text className='mb-1 text-xs text-neutral-main'>
                    Nhận phòng
                  </Text>
                  <TextInput
                    value={checkInInput}
                    onChangeText={handleCheckInInputChange}
                    onFocus={() => setSelectionMode('checkIn')}
                    placeholder='DD/MM/YYYY'
                    keyboardType='numeric'
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                      selectionMode === 'checkIn'
                        ? 'border-primary-main text-primary-main'
                        : 'border-neutral-lighter text-neutral-darkest'
                    }`}
                  />
                </View>

                {/* Arrow & Nights */}
                <View className='items-center px-3'>
                  <Ionicons name='arrow-forward' size={20} color='#f97316' />
                  <Text className='mt-1 text-xs font-semibold text-primary-main'>
                    {calculateNights()} đêm
                  </Text>
                </View>

                {/* Check-out */}
                <View className='flex-1'>
                  <Text className='mb-1 text-xs text-neutral-main'>
                    Trả phòng
                  </Text>
                  <TextInput
                    value={checkOutInput}
                    onChangeText={handleCheckOutInputChange}
                    onFocus={() => setSelectionMode('checkOut')}
                    placeholder='DD/MM/YYYY'
                    keyboardType='numeric'
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                      selectionMode === 'checkOut'
                        ? 'border-primary-main text-primary-main'
                        : 'border-neutral-lighter text-neutral-darkest'
                    }`}
                  />
                </View>
              </View>
            </View>

            {/* Calendar */}
            <View className='mb-5'>
              {/* Month Navigation */}
              <View className='mb-4 flex-row items-center justify-between'>
                <TouchableOpacity
                  onPress={goToPreviousMonth}
                  className='h-9 w-9 items-center justify-center rounded-full border border-neutral-lighter'
                >
                  <Ionicons name='chevron-back' size={20} color='#f97316' />
                </TouchableOpacity>
                <Text className='text-base font-semibold text-neutral-darkest'>
                  {formatMonthYear(currentMonth)}
                </Text>
                <TouchableOpacity
                  onPress={goToNextMonth}
                  className='h-9 w-9 items-center justify-center rounded-full border border-primary-main'
                >
                  <Ionicons name='chevron-forward' size={20} color='#f97316' />
                </TouchableOpacity>
              </View>

              {/* Week Days Header */}
              <View className='mb-2 flex-row'>
                {weekDays.map(day => (
                  <View key={day} className='flex-1 items-center'>
                    <Text className='text-xs font-medium text-neutral-main'>
                      {day}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Calendar Grid */}
              <View className='flex-row flex-wrap'>
                {getDaysInMonth(currentMonth).map((date, index) => {
                  if (!date) {
                    return (
                      <View key={`empty-${index}`} className='w-[14.28%] p-1' />
                    );
                  }

                  const isCheckIn = isSameDay(date, checkInDate);
                  const isCheckOut = isSameDay(date, checkOutDate);
                  const inRange = isInRange(date);
                  const isPast = isPastDate(date);

                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleDateSelect(date)}
                      disabled={isPast}
                      className='w-[14.28%] p-1'
                    >
                      <View
                        className={`aspect-square items-center justify-center rounded-full ${
                          isCheckIn || isCheckOut
                            ? 'bg-primary-main'
                            : inRange
                              ? 'bg-primary-lighter'
                              : 'bg-transparent'
                        }`}
                      >
                        <Text
                          className={`text-sm ${
                            isPast
                              ? 'text-neutral-lighter'
                              : isCheckIn || isCheckOut
                                ? 'font-bold text-white'
                                : inRange
                                  ? 'font-medium text-primary-main'
                                  : 'text-neutral-darkest'
                          }`}
                        >
                          {date.getDate()}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Show next month as well */}
            <View className='mb-5'>
              {(() => {
                const nextMonth = new Date(currentMonth);
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                return (
                  <>
                    {/* Month Header */}
                    <Text className='mb-4 text-center text-base font-semibold text-neutral-darkest'>
                      {formatMonthYear(nextMonth)}
                    </Text>

                    {/* Week Days Header */}
                    <View className='mb-2 flex-row'>
                      {weekDays.map(day => (
                        <View key={day} className='flex-1 items-center'>
                          <Text className='text-xs font-medium text-neutral-main'>
                            {day}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Calendar Grid */}
                    <View className='flex-row flex-wrap'>
                      {getDaysInMonth(nextMonth).map((date, index) => {
                        if (!date) {
                          return (
                            <View
                              key={`empty-${index}`}
                              className='w-[14.28%] p-1'
                            />
                          );
                        }

                        const isCheckIn = isSameDay(date, checkInDate);
                        const isCheckOut = isSameDay(date, checkOutDate);
                        const inRange = isInRange(date);
                        const isPast = isPastDate(date);

                        return (
                          <TouchableOpacity
                            key={index}
                            onPress={() => handleDateSelect(date)}
                            disabled={isPast}
                            className='w-[14.28%] p-1'
                          >
                            <View
                              className={`aspect-square items-center justify-center rounded-full ${
                                isCheckIn || isCheckOut
                                  ? 'bg-primary-main'
                                  : inRange
                                    ? 'bg-primary-lighter'
                                    : 'bg-transparent'
                              }`}
                            >
                              <Text
                                className={`text-sm ${
                                  isPast
                                    ? 'text-neutral-lighter'
                                    : isCheckIn || isCheckOut
                                      ? 'font-bold text-white'
                                      : inRange
                                        ? 'font-medium text-primary-main'
                                        : 'text-neutral-darkest'
                                }`}
                              >
                                {date.getDate()}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </>
                );
              })()}
            </View>
          </ScrollView>

          {/* Confirm Button */}
          <TouchableOpacity
            onPress={handleConfirm}
            className='mt-5 items-center rounded-xl bg-primary-main py-4'
          >
            <Text className='text-base font-bold text-white'>Xác nhận</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
