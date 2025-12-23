import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';

import { useBranches } from '@/hooks/useBranches';

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (location: {
    type: 'city' | 'branch';
    id: string;
    name: string;
  }) => void;
  selectedLocation?: { type: 'city' | 'branch'; id: string; name: string };
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch branches with search filter
  const { data: branchesData } = useBranches(
    1,
    50,
    searchQuery ? { keyword: searchQuery } : undefined
  );

  // Popular cities
  const popularCities = [
    { id: 'hanoi', name: 'Hà Nội' },
    { id: 'hcm', name: 'Hồ Chí Minh' },
    { id: 'danang', name: 'Đà Nẵng' },
  ];

  const handleSelect = (location: {
    type: 'city' | 'branch';
    id: string;
    name: string;
  }) => {
    onSelect(location);
    onClose();
  };

  const filteredCities = popularCities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const branches = branchesData?.data || [];

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
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 32,
            maxHeight: '85%',
          }}
        >
          {/* Handle bar */}
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: '#cbd5e1',
              borderRadius: 2,
              alignSelf: 'center',
              marginBottom: 16,
            }}
          />

          {/* Search Input */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#f1f5f9',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginBottom: 20,
            }}
          >
            <Ionicons name='search' size={20} color='#64748b' />
            <TextInput
              style={{
                flex: 1,
                marginLeft: 12,
                fontSize: 16,
                color: '#1e293b',
              }}
              placeholder='Thành phố, Khách sạn, Điểm đến...'
              placeholderTextColor='#94a3b8'
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name='close-circle' size={20} color='#64748b' />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={{
                marginLeft: 12,
                backgroundColor: '#f97316',
                borderRadius: 8,
                padding: 8,
              }}
            >
              <Ionicons name='search' size={20} color='white' />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Popular Cities Section */}
            {!searchQuery || filteredCities.length > 0 ? (
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: '#64748b',
                    marginBottom: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  ĐỊA ĐIỂM
                </Text>
                {filteredCities.map(city => (
                  <TouchableOpacity
                    key={city.id}
                    onPress={() =>
                      handleSelect({
                        type: 'city',
                        id: city.id,
                        name: city.name,
                      })
                    }
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: '#f1f5f9',
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        backgroundColor: '#fff7ed',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}
                    >
                      <Ionicons name='location' size={20} color='#f97316' />
                    </View>
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 16,
                        fontWeight: '500',
                        color: '#1e293b',
                      }}
                    >
                      {city.name}
                    </Text>
                    {selectedLocation?.id === city.id && (
                      <Ionicons
                        name='checkmark-circle'
                        size={24}
                        color='#f97316'
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {/* Hotels/Branches Section */}
            {branches.length > 0 && (
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: '#64748b',
                    marginBottom: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  KHÁCH SẠN PHỔ BIẾN
                </Text>
                {branches.map(
                  (branch: { id: string; name: string; address: string }) => (
                    <TouchableOpacity
                      key={branch.id}
                      onPress={() =>
                        handleSelect({
                          type: 'branch',
                          id: branch.id,
                          name: branch.name,
                        })
                      }
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: '#f1f5f9',
                      }}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          backgroundColor: '#fff7ed',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12,
                        }}
                      >
                        <Ionicons name='business' size={20} color='#f97316' />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: '500',
                            color: '#1e293b',
                            marginBottom: 4,
                          }}
                        >
                          {branch.name}
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            color: '#64748b',
                          }}
                          numberOfLines={1}
                        >
                          {branch.address}
                        </Text>
                      </View>
                      {selectedLocation?.id === branch.id && (
                        <Ionicons
                          name='checkmark-circle'
                          size={24}
                          color='#f97316'
                        />
                      )}
                    </TouchableOpacity>
                  )
                )}
              </View>
            )}

            {searchQuery &&
              branches.length === 0 &&
              filteredCities.length === 0 && (
                <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                  <Ionicons name='search-outline' size={48} color='#cbd5e1' />
                  <Text
                    style={{
                      marginTop: 12,
                      fontSize: 16,
                      color: '#64748b',
                      textAlign: 'center',
                    }}
                  >
                    Không tìm thấy kết quả
                  </Text>
                </View>
              )}
          </ScrollView>

          {/* Cancel Button */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              marginTop: 16,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#64748b' }}>
              Hủy
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
