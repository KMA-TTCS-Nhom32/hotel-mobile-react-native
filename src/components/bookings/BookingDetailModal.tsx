import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Platform,
  StatusBar,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { formatCurrency } from '@/utils/format';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 300;

// Define proper types for the component props and data
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
}

interface BookingType {
  id: string;
  code: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'COMPLETED' | 'WAITING_FOR_CHECK_IN';
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

interface BookingDetailModalProps {
  booking: BookingType | null;
  visible: boolean;
  onClose: () => void;
}

export const BookingDetailModal = ({ booking, visible, onClose }: BookingDetailModalProps) => {
  // State for image gallery - moved before any conditional returns
  const [activeIndex, setActiveIndex] = useState(0);
  
  if (!visible || !booking) return null;
  
  // Safely access room data
  const room = booking.room || {} as RoomType;
  const roomDetail = room.detail || {} as RoomDetailType;
  
  // Get room name and type
  const roomName = room.name || 'Phòng khách sạn';
  let roomType = roomDetail.room_type || '';
  if (roomType === roomType.toUpperCase()) {
    roomType = roomType.charAt(0) + roomType.slice(1).toLowerCase();
  }
  
  // Get room area and capacity
  const roomArea = roomDetail.area || 26;
  const maxAdults = roomDetail.max_adults || 2;
  
  // Get room description
  const roomDescription = roomDetail.description || 'Phòng giường đơn cho bạn và người đồng hành nghỉ ngơi sau những chuyến đi. Dễ dàng tận hưởng quang cảnh khu phố cổ trong một không gian có thiết kế trẻ trung và rộng rãi.';
  
  // Get room images
  const images: ImageType[] = [];
  
  // Add thumbnail if exists
  if (roomDetail.thumbnail && roomDetail.thumbnail.url) {
    images.push(roomDetail.thumbnail);
  } else if (room.thumbnail && room.thumbnail.url) {
    images.push(room.thumbnail);
  }
  
  // Add other images if exist
  if (roomDetail.images && roomDetail.images.length > 0) {
    images.push(...roomDetail.images.filter(img => 
      !images.some(existingImg => existingImg.url === img.url)
    ));
  } else if (room.images && room.images.length > 0) {
    images.push(...room.images.filter(img => 
      !images.some(existingImg => existingImg.url === img.url)
    ));
  }
  
  // If no images, add a placeholder
  if (images.length === 0) {
    // Using a high-quality hotel room image as placeholder
    images.push({
      url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3'
    });
  }

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

  // Get booking info
  const bookingCode = booking.code || '';
  const startDate = formatDate(booking.start_date).split(',')[0];
  const startTime = booking.start_time || '';
  const endTime = booking.end_time || '';
  const guestCount = booking.number_of_guests || booking.adults || 2;
  const totalAmount = booking.total_amount || 0;
  
  // Calculate duration
  const calculateHours = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 1;
    
    try {
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      
      let diffMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
      if (diffMinutes < 0) diffMinutes += 24 * 60;
      
      return Math.round(diffMinutes / 60);
    } catch (_) {
      // Thay thế 'e' bằng '_' để tránh lỗi biến không sử dụng
      return 1;
    }
  };
  
  const hours = calculateHours(startTime, endTime);
  
  // Get payment info
  const paymentMethod = booking.payment_method || 'CASH';
  const paymentStatus = booking.payment_status || 'UNPAID';
  
  // Format payment method text
  const getPaymentMethodText = (method: string): string => {
    switch (method) {
      case 'CASH': return 'Tiền mặt';
      case 'VIET_QR': return 'VietQR';
      case 'CREDIT_CARD': return 'Thẻ tín dụng';
      default: return method || 'Chưa chọn';
    }
  };
  
  // Get payment status text and color
  const getPaymentStatusInfo = (status: string): { text: string, color: string } => {
    switch (status) {
      case 'PAID': return { text: 'Đã thanh toán', color: '#10B981' };
      case 'UNPAID': return { text: 'Chưa thanh toán', color: '#F59E0B' };
      case 'REFUNDED': return { text: 'Đã hoàn tiền', color: '#6366F1' };
      default: return { text: 'Chưa xác định', color: '#64748b' };
    }
  };

  // Get booking status
  const getStatusInfo = (status: string): { text: string, color: string, icon: string } => {
    switch (status) {
      case 'CONFIRMED': return { text: 'Đã xác nhận', color: '#10B981', icon: 'check-circle' };
      case 'CANCELED': return { text: 'Đã hủy', color: '#EF4444', icon: 'cancel' };
      case 'COMPLETED': return { text: 'Hoàn thành', color: '#6366F1', icon: 'done-all' };
      case 'WAITING_FOR_CHECK_IN': return { text: 'Chờ nhận phòng', color: '#3B82F6', icon: 'pending' };
      case 'PENDING':
      default: return { text: 'Đang chờ', color: '#F59E0B', icon: 'schedule' };
    }
  };

  const bookingStatus = getStatusInfo(booking.status);
  const paymentStatusInfo = getPaymentStatusInfo(paymentStatus);
  
  // Amenities - use room detail amenities or fallback to default
  const amenities = roomDetail.amenities || [
    { id: '1', name: 'TV' },
    { id: '2', name: 'Phòng tắm đứng' },
    { id: '3', name: 'Wifi miễn phí' },
    { id: '4', name: 'Máy lạnh' }
  ];

  // Room quantity available
  const roomQuantity = roomDetail.quantity || 1;

  // Render individual image in gallery
  const renderImage = ({ item }: { item: ImageType }) => (
    <Pressable style={styles.imageItem}>
      <Image
        source={{ uri: item.url }}
        style={{ width: SCREEN_WIDTH, height: IMAGE_HEIGHT }}
        contentFit="cover"
        transition={200}
      />
    </Pressable>
  );

  // Handle scroll in image gallery
  const onScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / SCREEN_WIDTH
    );
    setActiveIndex(slideIndex);
  };

  return (
    <View style={styles.modalContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Back Button */}
      <Pressable style={styles.backButton} onPress={onClose}>
        <MaterialIcons name="arrow-back" size={24} color="white" />
      </Pressable>
      
      <ScrollView style={styles.scrollView} bounces={false} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <FlatList
            data={images}
            renderItem={renderImage}
            keyExtractor={(item, index) => `${item.url || 'image'}-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            bounces={false}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
          />
          
          {/* Image Counter */}
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {activeIndex + 1} / {images.length}
            </Text>
          </View>
          
          {/* Pagination Dots */}
          {images.length > 1 && (
            <View style={styles.paginationDotsContainer}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === activeIndex ? styles.paginationDotActive : styles.paginationDotInactive
                  ]}
                />
              ))}
            </View>
          )}
          
          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: `${bookingStatus.color}20` }]}>
            <MaterialIcons name={bookingStatus.icon} size={16} color={bookingStatus.color} />
            <Text style={[styles.statusText, { color: bookingStatus.color }]}>
              {bookingStatus.text}
            </Text>
          </View>
        </View>
        
        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Room Header */}
          <View style={styles.roomHeaderContainer}>
            <View>
              <Text style={styles.roomName}>{roomName}</Text>
              <Text style={styles.roomType}>{roomType || 'Sáng trọng • Giường đơn'}</Text>
            </View>
            
            <View style={styles.availabilityBadge}>
              <Text style={styles.availabilityText}>Còn phòng</Text>
            </View>
          </View>
          
          {/* Room Features */}
          <View style={styles.featuresContainer}>
            {/* Area */}
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <MaterialIcons name="square-foot" size={20} color="#f97316" />
              </View>
              <Text style={styles.featureLabel}>Chi tiết phòng</Text>
              <Text style={styles.featureValue}>{roomArea} m²</Text>
            </View>
            
            {/* Capacity */}
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <MaterialIcons name="people" size={20} color="#f97316" />
              </View>
              <Text style={styles.featureLabel}>Sức chứa</Text>
              <Text style={styles.featureValue}>{maxAdults} Người lớn</Text>
            </View>
            
            {/* Rooms Available */}
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <MaterialIcons name="meeting-room" size={20} color="#f97316" />
              </View>
              <Text style={styles.featureLabel}>Còn phòng</Text>
              <Text style={styles.featureValue}>{roomQuantity} phòng trống</Text>
            </View>
          </View>
          
          {/* Booking Info */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Thông tin đặt phòng</Text>
            <View style={styles.bookingCodeContainer}>
              <Text style={styles.bookingCodeLabel}>Mã đặt phòng:</Text>
              <Text style={styles.bookingCodeValue}>{bookingCode}</Text>
            </View>
            
            <View style={styles.bookingInfoGrid}>
              <View style={styles.bookingInfoItem}>
                <MaterialIcons name="event" size={20} color="#64748b" />
                <Text style={styles.bookingInfoLabel}>Ngày:</Text>
                <Text style={styles.bookingInfoValue}>{startDate}</Text>
              </View>
              
              <View style={styles.bookingInfoItem}>
                <MaterialIcons name="access-time" size={20} color="#64748b" />
                <Text style={styles.bookingInfoLabel}>Thời gian:</Text>
                <Text style={styles.bookingInfoValue}>{startTime} - {endTime} ({hours} giờ)</Text>
              </View>
              
              <View style={styles.bookingInfoItem}>
                <MaterialIcons name="person" size={20} color="#64748b" />
                <Text style={styles.bookingInfoLabel}>Số khách:</Text>
                <Text style={styles.bookingInfoValue}>{guestCount} khách</Text>
              </View>
            </View>
          </View>
          
          {/* Payment Info */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Thông tin thanh toán</Text>
            
            <View style={styles.paymentInfoGrid}>
              <View style={styles.paymentInfoItem}>
                <MaterialIcons name="payment" size={20} color="#64748b" />
                <Text style={styles.paymentInfoLabel}>Phương thức:</Text>
                <Text style={styles.paymentInfoValue}>{getPaymentMethodText(paymentMethod)}</Text>
              </View>
              
              <View style={styles.paymentInfoItem}>
                <MaterialIcons name="account-balance-wallet" size={20} color="#64748b" />
                <Text style={styles.paymentInfoLabel}>Trạng thái:</Text>
                <Text style={[styles.paymentInfoValue, { color: paymentStatusInfo.color }]}>
                  {paymentStatusInfo.text}
                </Text>
              </View>
            </View>
            
            <View style={styles.totalPriceContainer}>
              <Text style={styles.totalPriceLabel}>Tổng tiền:</Text>
              <Text style={styles.totalPriceValue}>{formatCurrency(totalAmount)}</Text>
            </View>
          </View>
          
          {/* Room Info */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Thông tin phòng</Text>
            <Text style={styles.roomDescription}>
              {roomDescription}
            </Text>
          </View>
          
          {/* Room Amenities */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Tiện nghi phòng</Text>
            <View style={styles.amenitiesContainer}>
              {amenities.map((amenity, index) => (
                <View key={amenity.id || `amenity-${index}`} style={styles.amenityItem}>
                  <MaterialIcons name="check-circle" size={16} color="#10B981" />
                  <Text style={styles.amenityText}>{amenity.name}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* Special Requests */}
          {booking.special_requests && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Yêu cầu đặc biệt</Text>
              <Text style={styles.specialRequests}>{booking.special_requests}</Text>
            </View>
          )}
          
          <View style={styles.spacer} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    zIndex: 1000,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 30,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: IMAGE_HEIGHT,
  },
  imageItem: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  imageCounterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  paginationDotsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  paginationDot: {
    height: 6,
    borderRadius: 3,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: 'white',
  },
  paginationDotInactive: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  contentContainer: {
    padding: 16,
  },
  roomHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  roomName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  roomType: {
    fontSize: 14,
    color: '#64748b',
  },
  availabilityBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  featureItem: {
    alignItems: 'center',
    width: '30%',
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  featureValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  sectionContainer: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  bookingCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  bookingCodeLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  bookingCodeValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f97316',
    marginLeft: 4,
  },
  bookingInfoGrid: {
    gap: 12,
  },
  bookingInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingInfoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
    width: 80,
  },
  bookingInfoValue: {
    fontSize: 14,
    color: '#1e293b',
    flex: 1,
  },
  paymentInfoGrid: {
    gap: 12,
    marginBottom: 16,
  },
  paymentInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentInfoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
    width: 80,
  },
  paymentInfoValue: {
    fontSize: 14,
    color: '#1e293b',
    flex: 1,
  },
  totalPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  totalPriceLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748b',
  },
  totalPriceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f97316',
  },
  roomDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 10,
    paddingRight: 8,
  },
  amenityText: {
    fontSize: 14,
    color: '#475569',
    marginLeft: 8,
  },
  specialRequests: {
    fontSize: 14,
    color: '#475569',
    fontStyle: 'italic',
  },
  spacer: {
    height: 40,
  },
});