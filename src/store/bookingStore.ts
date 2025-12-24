import type { RoomDetail } from '@ahomevilla-hotel/node-sdk';
import { create } from 'zustand';

import { type BookingFilters, getDefaultBookingFilters } from '@/types/booking';

interface BookingState {
  // Current booking filters (type, dates, guests)
  filters: BookingFilters;

  // Selected room for booking
  selectedRoom: RoomDetail | null;

  // Branch ID for context
  branchId: string | null;
}

interface BookingActions {
  // Set all filters at once
  setFilters: (filters: BookingFilters) => void;

  // Update partial filters
  updateFilters: (partial: Partial<BookingFilters>) => void;

  // Set the selected room
  setSelectedRoom: (room: RoomDetail) => void;

  // Set branch context
  setBranchId: (branchId: string) => void;

  // Clear all booking state
  clearBooking: () => void;

  // Reset filters to defaults
  resetFilters: () => void;
}

type BookingStore = BookingState & BookingActions;

const initialState: BookingState = {
  filters: getDefaultBookingFilters(),
  selectedRoom: null,
  branchId: null,
};

/**
 * Zustand store for booking state
 * Shared across RoomsSection, RoomDetail, and Payment screens
 */
export const useBookingStore = create<BookingStore>(set => ({
  ...initialState,

  setFilters: filters => set({ filters }),

  updateFilters: partial =>
    set(state => ({
      filters: { ...state.filters, ...partial },
    })),

  setSelectedRoom: room => set({ selectedRoom: room }),

  setBranchId: branchId => set({ branchId }),

  clearBooking: () => set(initialState),

  resetFilters: () => set({ filters: getDefaultBookingFilters() }),
}));

/**
 * Selector hooks for common use cases
 */
export const useBookingFilters = () => useBookingStore(state => state.filters);
export const useSelectedRoom = () =>
  useBookingStore(state => state.selectedRoom);
export const useBranchId = () => useBookingStore(state => state.branchId);
