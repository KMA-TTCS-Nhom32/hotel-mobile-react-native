import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TextInput,
  Modal,
} from 'react-native';

import { BookingDetailModal } from '@/components/bookings/BookingDetailModal';
import { Button } from '@/components/ui';
import { bookingService } from '@/services/booking/bookingService';
import { formatCurrency } from '@/utils/format';
import { showErrorToast, showSuccessToast } from '@/utils/toast';

// Thêm các định nghĩa type
interface ImageType {
  url: string;
  publicId?: string;
}

interface AmenityType {
  id: string;
  name: string;
}

interface RoomDetailType {
  area?: number;
  max_adults?: number;
  room_type?: string;
  bed_type?: string;
  description?: string;
  quantity?: number;
  amenities?: AmenityType[];
  thumbnail?: ImageType;
  images?: ImageType[];
}

interface RoomType {
  id?: string;
  name?: string;
  slug?: string;
  thumbnail?: ImageType;
  images?: ImageType[];
  detail?: RoomDetailType;
  room_type?: string;
  bed_type?: string;
}

interface BookingType {
  id: string;
  _id?: string;
  code: string;
  status:
    | 'PENDING'
    | 'CONFIRMED'
    | 'CANCELED'
    | 'COMPLETED'
    | 'WAITING_FOR_CHECK_IN';
  room?: RoomType;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  total_amount: string | number;
  payment_method: string;
  payment_status: string;
  number_of_guests?: number;
  adults?: number;
  children?: number;
  special_requests?: string;
}

/**
 * Screen showing user's booked rooms
 */
export const MyBookingsScreen = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingType | null>(
    null
  );
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [bookingToCancel, setBookingToCancel] = useState<BookingType | null>(
    null
  );

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await bookingService.getMyBookings();
      console.log('Processing bookings:', data);
      setBookings(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(
        err instanceof Error
          ? err
          : new Error('Không thể tải danh sách đặt phòng')
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refetch when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [fetchBookings])
  );

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings();
  }, [fetchBookings]);

  // Open cancel modal
  const openCancelModal = (booking: BookingType) => {
    setBookingToCancel(booking);
    setCancelReason('');
    setCancelModalVisible(true);
  };

  // Handle booking cancellation
  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;

    try {
      setIsCancelling(true);

      await bookingService.cancelBooking(
        bookingToCancel.id,
        cancelReason.trim() || undefined
      );

      setCancelModalVisible(false);

      showSuccessToast('Đã hủy đặt phòng thành công');

      fetchBookings();
    } catch (err) {
      showErrorToast(
        err instanceof Error
          ? err.message
          : 'Không thể hủy đặt phòng, vui lòng thử lại'
      );
    } finally {
      setIsCancelling(false);
      setBookingToCancel(null);
    }
  };

  // View booking details
  const handleViewDetails = (booking: BookingType) => {
    console.log('View booking details:', booking.id);
    setSelectedBooking(booking);
    setDetailModalVisible(true);
  };

  // Close detail modal
  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedBooking(null);
  };

  // Format dates
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Calculate hours
  const calculateHours = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 1;

    try {
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);

      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;

      let diffMinutes = endTotalMinutes - startTotalMinutes;

      if (diffMinutes < 0) {
        diffMinutes += 24 * 60;
      }

      return Math.round(diffMinutes / 60);
    } catch {
      return 1;
    }
  };

  // Get status info
  const getStatusInfo = (
    status: string
  ): {
    color: string;
    text: string;
    icon: keyof typeof MaterialIcons.glyphMap;
  } => {
    switch (status) {
      case 'CONFIRMED':
        return { color: '#10B981', text: 'Đã xác nhận', icon: 'check-circle' };
      case 'CANCELED':
        return { color: '#EF4444', text: 'Đã hủy', icon: 'cancel' };
      case 'COMPLETED':
        return { color: '#6366F1', text: 'Hoàn thành', icon: 'done-all' };
      case 'WAITING_FOR_CHECK_IN':
        return { color: '#3B82F6', text: 'Chờ nhận phòng', icon: 'pending' };
      case 'PENDING':
      default:
        return { color: '#F59E0B', text: 'Đang chờ', icon: 'schedule' };
    }
  };

  // Get room image URL
  const getRoomImageUrl = (room: RoomType | undefined): string => {
    if (!room) return 'https://via.placeholder.com/300x200?text=Room+Image';

    try {
      if (room.detail && room.detail.thumbnail && room.detail.thumbnail.url) {
        return room.detail.thumbnail.url;
      }

      if (room.thumbnail && room.thumbnail.url) {
        return room.thumbnail.url;
      }

      if (
        room.detail &&
        room.detail.images &&
        room.detail.images.length > 0 &&
        room.detail.images[0].url
      ) {
        return room.detail.images[0].url;
      }

      if (room.images && room.images.length > 0 && room.images[0].url) {
        return room.images[0].url;
      }

      if (room.name) {
        const roomNumber = room.name.match(/\d+/);
        if (roomNumber) {
          const hue = (parseInt(roomNumber[0]) * 25) % 360;
          return `https://via.placeholder.com/400x250/${hslToHex(hue, 80, 60)}/FFFFFF?text=${encodeURIComponent(room.name)}`;
        }
      }

      return 'https://via.placeholder.com/300x200?text=Room+Image';
    } catch (err) {
      console.error('Error getting room image:', err);
      return 'https://via.placeholder.com/300x200?text=Room+Image';
    }
  };

  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number): string => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, '0');
    };
    return `${f(0)}${f(8)}${f(4)}`;
  };

  // Render booking item
  const renderBookingItem = ({ item }: { item: BookingType }) => {
    const statusInfo = getStatusInfo(item.status || 'PENDING');

    const roomData = item.room || ({} as RoomType);
    const roomDetail = roomData.detail || {};
    const roomName = roomData.name || 'Phòng khách sạn';

    let roomType = roomData.room_type || roomDetail.room_type || '';
    if (roomType === roomType.toUpperCase()) {
      roomType = roomType.charAt(0) + roomType.slice(1).toLowerCase();
    }

    if (!roomType) {
      roomType = roomData.bed_type || roomDetail.bed_type || 'Tiêu chuẩn';
    }

    const startDate = item.start_date || '';
    const startTime = item.start_time || '';
    const endTime = item.end_time || '';

    const hours = calculateHours(startTime, endTime);
    const durationText = `(${hours} giờ)`;

    const guestCount = item.number_of_guests || item.adults || 2;
    const totalAmount = item.total_amount || 0;

    const imageUrl = getRoomImageUrl(roomData);

    const bookingCode = item.code || '';

    const formattedDate = formatDate(startDate).split(',')[0]; // Remove day of week

    const canCancel = item.status === 'PENDING';

    return (
      <View style={styles.bookingCard}>
        {/* Room Image */}
        <Image
          source={{ uri: imageUrl }}
          style={styles.roomImage}
          contentFit='cover'
          transition={300}
          onError={e => {
            console.log('Image load error');
            console.log('Failed image URL:', imageUrl);
          }}
        />

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${statusInfo.color}20` },
          ]}
        >
          <MaterialIcons
            name={statusInfo.icon}
            size={14}
            color={statusInfo.color}
          />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
        </View>

        {/* Booking Info */}
        <View style={styles.infoContainer}>
          {/* Room name and type */}
          <Text style={styles.roomName}>{roomName}</Text>
          <Text style={styles.roomType}>{roomType}</Text>

          {/* Booking Code */}
          <View style={styles.codeRow}>
            <Text style={styles.codeLabel}>Mã đặt phòng:</Text>
            <Text style={styles.codeValue}>{bookingCode}</Text>
          </View>

          {/* Stay details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <MaterialIcons name='event' size={16} color='#64748b' />
              <Text style={styles.detailText}>{formattedDate}</Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons name='access-time' size={16} color='#64748b' />
              <Text style={styles.detailText}>
                {startTime} - {endTime} {durationText}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons name='person' size={16} color='#64748b' />
              <Text style={styles.detailText}>{guestCount} khách</Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tổng tiền:</Text>
            <Text style={styles.priceValue}>
              {formatCurrency(
                typeof totalAmount === 'number'
                  ? totalAmount
                  : parseFloat(totalAmount as string) || 0
              )}
            </Text>
          </View>

          {/* Action buttons */}
          <View style={styles.buttonsRow}>
            <Button
              title='Chi tiết'
              variant='outline'
              size='sm'
              style={canCancel ? styles.detailButton : styles.fullWidthButton}
              onPress={() => handleViewDetails(item)}
            />

            {canCancel && (
              <Button
                title='Hủy đặt phòng'
                variant='danger'
                size='sm'
                disabled={isCancelling}
                style={styles.cancelButton}
                onPress={() => openCancelModal(item)}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  // Empty state when no bookings
  const EmptyBookings = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name='hotel' size={64} color='#94a3b8' />
      <Text style={styles.emptyTitle}>Chưa có đặt phòng nào</Text>
      <Text style={styles.emptyMessage}>
        Bạn chưa đặt phòng nào. Khám phá các phòng và đặt ngay để nhận ưu đãi
        tốt nhất!
      </Text>
      <Button
        title='Tìm phòng ngay'
        variant='primary'
        onPress={() => router.push('/(tabs)')}
        style={{ marginTop: 16 }}
      />
    </View>
  );

  // Error state
  if (error && !isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <MaterialIcons name='error-outline' size={64} color='#ef4444' />
        <Text style={styles.errorTitle}>Đã xảy ra lỗi</Text>
        <Text style={styles.errorMessage}>
          {error instanceof Error
            ? error.message
            : 'Không thể tải danh sách đặt phòng'}
        </Text>
        <Button
          title='Thử lại'
          variant='primary'
          onPress={() => fetchBookings()}
          style={{ marginTop: 16 }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#f97316' />
          <Text style={styles.loadingText}>
            Đang tải danh sách đặt phòng...
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={item => item.id || item._id || String(Math.random())}
          renderItem={renderBookingItem}
          contentContainerStyle={
            bookings.length === 0
              ? styles.emptyListContainer
              : styles.listContainer
          }
          ListEmptyComponent={<EmptyBookings />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#f97316']}
              tintColor='#f97316'
            />
          }
        />
      )}

      {/* Cancel Booking Modal */}
      <Modal
        visible={cancelModalVisible}
        transparent={true}
        animationType='fade'
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cancelModalContainer}>
            <Text style={styles.cancelModalTitle}>Hủy đặt phòng</Text>

            <Text style={styles.cancelModalText}>
              Bạn có chắc chắn muốn hủy đặt phòng này không?
            </Text>

            <Text style={styles.cancelReasonLabel}>
              Lý do hủy (không bắt buộc):
            </Text>
            <TextInput
              style={styles.cancelReasonInput}
              value={cancelReason}
              onChangeText={setCancelReason}
              placeholder='Nhập lý do hủy phòng'
              multiline={true}
              numberOfLines={3}
            />

            <View style={styles.cancelModalActions}>
              <Button
                title='Đóng'
                variant='outline'
                onPress={() => setCancelModalVisible(false)}
                style={styles.cancelModalCloseButton}
              />
              <Button
                title='Xác nhận hủy'
                variant='danger'
                onPress={handleCancelBooking}
                loading={isCancelling}
                style={styles.cancelModalConfirmButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Detail Modal */}
      <BookingDetailModal
        booking={selectedBooking}
        visible={detailModalVisible}
        onClose={handleCloseDetailModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 0,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  roomImage: {
    width: '100%',
    height: 160,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  infoContainer: {
    padding: 16,
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  roomType: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 4,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
  codeLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  codeValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f97316',
    marginLeft: 4,
  },
  detailsContainer: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f97316',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailButton: {
    flex: 1,
    marginRight: 8,
  },
  fullWidthButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#64748b',
    marginBottom: 24,
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#64748b',
    marginBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  cancelModalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cancelModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  cancelModalText: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 16,
    textAlign: 'center',
  },
  cancelReasonLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  cancelReasonInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  cancelModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelModalCloseButton: {
    flex: 1,
    marginRight: 8,
  },
  cancelModalConfirmButton: {
    flex: 1,
    marginLeft: 8,
  },
});
