import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user: {
    name?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    birth_date?: string;
    avatar?: { url?: string } | string;
    email?: string;
    phone?: string;
  } | null;
  onSave: (updated: {
    name: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    birth_date: string; // yyyy-mm-dd
    avatar?: string;
  }) => Promise<void>;
}

const DEFAULT_BIRTH = new Date(2000, 0, 1);

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const parseBirthDate = (dateStr?: string): Date => {
  if (!dateStr) return DEFAULT_BIRTH;

  // Try native parse first (ISO or other)
  const d1 = new Date(dateStr);
  if (!isNaN(d1.getTime())) return d1;

  // Try dd-mm-yyyy or dd/MM/yyyy
  const ddmmyyyy = dateStr.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (ddmmyyyy) {
    const day = Number(ddmmyyyy[1]);
    const month = Number(ddmmyyyy[2]) - 1;
    const year = Number(ddmmyyyy[3]);
    const d2 = new Date(year, month, day);
    if (!isNaN(d2.getTime())) return d2;
  }

  return DEFAULT_BIRTH;
};

const formatDateToISO = (date: Date) => date.toISOString().split('T')[0];

const formatDisplayDate = (date: Date) =>
  `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  user,
  onSave,
}) => {
  const [name, setName] = useState(user?.name || '');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>(
    user?.gender || 'MALE'
  );
  const [birthDateStr, setBirthDateStr] = useState<string>(
    formatDisplayDate(parseBirthDate(user?.birth_date))
  );
  const [avatar, setAvatar] = useState<string>(
    typeof user?.avatar === 'string'
      ? (user.avatar as string)
      : user?.avatar?.url || ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(user?.name || '');
    setGender(user?.gender || 'MALE');
    setBirthDateStr(formatDisplayDate(parseBirthDate(user?.birth_date)));
    setAvatar(
      typeof user?.avatar === 'string'
        ? (user.avatar as string)
        : user?.avatar?.url || ''
    );
    setError(null);
  }, [visible, user]);

  // Tạm thời không dùng image picker => hiện alert
  const handlePickImage = () => {
    Alert.alert(
      'Tạm vô hiệu',
      'Chức năng thay avatar đang tạm vô hiệu. Để bật lại, cài "expo-image-picker" hoặc một thư viện chọn ảnh khác và build lại app.'
    );
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      // Chuyển birthDateStr (dd-mm-yyyy) sang ISO yyyy-mm-dd
      const parsed = parseBirthDate(birthDateStr);
      if (isNaN(parsed.getTime())) {
        throw new Error(
          'Định dạng ngày sinh không hợp lệ. Vui lòng dùng dd-mm-yyyy.'
        );
      }

      await onSave({
        name: name.trim(),
        gender,
        birth_date: formatDateToISO(parsed),
        avatar: avatar || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const renderGenderButton = (
    value: 'MALE' | 'FEMALE' | 'OTHER',
    label: string
  ) => (
    <TouchableOpacity
      key={value}
      onPress={() => setGender(value)}
      style={{
        flex: 1,
        paddingVertical: 10,
        marginHorizontal: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: gender === value ? '#f97316' : '#cbd5e1',
        backgroundColor: gender === value ? '#f97316' : '#fff',
      }}
    >
      <Text
        style={{
          textAlign: 'center',
          color: gender === value ? '#fff' : '#1e293b',
          fontWeight: '500',
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType='slide'
      transparent
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.2)',
        }}
      >
        <View
          style={{
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 16,
            width: '90%',
          }}
        >
          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>
            Chỉnh sửa thông tin cá nhân
          </Text>

          {/* Avatar */}
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity onPress={handlePickImage}>
              {avatar ? (
                <Image
                  source={{ uri: avatar }}
                  style={{ width: 80, height: 80, borderRadius: 40 }}
                />
              ) : (
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: '#e2e8f0',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 24, color: '#64748b' }}>+</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={{ color: '#f97316', marginTop: 6 }}>Thay ảnh</Text>
          </View>

          {/* Name */}
          <TextInput
            placeholder='Tên'
            value={name}
            onChangeText={setName}
            style={{ borderBottomWidth: 1, marginBottom: 16, fontSize: 16 }}
          />

          {/* Gender */}
          <Text style={{ fontSize: 16, marginBottom: 8, fontWeight: '500' }}>
            Giới tính
          </Text>
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            {renderGenderButton('MALE', 'Nam')}
            {renderGenderButton('FEMALE', 'Nữ')}
            {renderGenderButton('OTHER', 'Khác')}
          </View>

          {/* Birth date as manual input */}
          <Text style={{ fontSize: 16, fontWeight: '500' }}>
            Ngày sinh (dd-mm-yyyy)
          </Text>
          <TextInput
            placeholder='dd-mm-yyyy'
            value={birthDateStr}
            onChangeText={setBirthDateStr}
            style={{
              borderBottomWidth: 1,
              paddingVertical: 8,
              marginBottom: 16,
              fontSize: 16,
            }}
            keyboardType='numbers-and-punctuation'
            maxLength={10}
          />

          {error && (
            <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>
          )}

          {/* Buttons */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              marginTop: 16,
            }}
          >
            <TouchableOpacity onPress={onClose} style={{ marginRight: 16 }}>
              <Text style={{ color: '#64748b', fontSize: 16 }}>Đóng</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={loading || !name.trim()}
            >
              {loading ? (
                <ActivityIndicator color='#f97316' />
              ) : (
                <Text
                  style={{ color: '#f97316', fontWeight: 'bold', fontSize: 16 }}
                >
                  Lưu
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
