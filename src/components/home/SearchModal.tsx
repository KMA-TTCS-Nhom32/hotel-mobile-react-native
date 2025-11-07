import { Branch, RoomDetail } from '@ahomevilla-hotel/node-sdk';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';

import { useBranches } from '@/hooks/useBranches';
import { useRooms } from '@/hooks/useRooms';

type SearchType = 'branch' | 'room';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
}) => {
  const [searchType, setSearchType] = useState<SearchType>('branch');
  const [keyword, setKeyword] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Gọi API chỉ khi đã search và có keyword
  const { data: branchData, isLoading: branchLoading } = useBranches(
    1,
    10,
    hasSearched && keyword ? { keyword } : undefined
  );
  const { data: roomData, isLoading: roomLoading } = useRooms(
    1,
    10,
    hasSearched && keyword ? { keyword } : undefined,
    hasSearched && !!keyword
  );
  const isLoading = searchType === 'branch' ? branchLoading : roomLoading;
  const data: Branch[] | RoomDetail[] =
    searchType === 'branch' ? branchData?.data || [] : roomData?.data || [];

  const handleSearch = () => {
    if (keyword.trim()) setHasSearched(true);
  };

  const renderItem = ({ item }: { item: Branch | RoomDetail }) => {
    const isBranch = searchType === 'branch';
    const branchItem = item as Branch;
    const roomItem = item as RoomDetail;

    return (
      <TouchableOpacity
        style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee' }}
      >
        {isBranch ? (
          <>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
              {branchItem.name}
            </Text>
            <Text style={{ color: '#64748b' }}>{branchItem.address}</Text>
          </>
        ) : (
          <>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
              {roomItem.name}
            </Text>
            <Text style={{ color: '#64748b' }}>{roomItem.description}</Text>
            <Text style={{ color: '#f97316' }}>
              Giá:{' '}
              {roomItem.base_price_per_hour ||
                roomItem.base_price_per_night ||
                roomItem.base_price_per_day}
              ₫
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  };

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
          backgroundColor: 'rgba(0,0,0,0.2)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: '90%',
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 12,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: searchType === 'branch' ? '#f97316' : '#eee',
                padding: 8,
                borderRadius: 8,
                marginRight: 4,
              }}
              onPress={() => {
                setSearchType('branch');
                setHasSearched(false);
                setKeyword('');
              }}
            >
              <Text
                style={{
                  color: searchType === 'branch' ? '#fff' : '#333',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                Chi nhánh
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: searchType === 'room' ? '#f97316' : '#eee',
                padding: 8,
                borderRadius: 8,
                marginLeft: 4,
              }}
              onPress={() => {
                setSearchType('room');
                setHasSearched(false);
                setKeyword('');
              }}
            >
              <Text
                style={{
                  color: searchType === 'room' ? '#fff' : '#333',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                Phòng
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={{ marginLeft: 8 }}>
              <Ionicons name='close' size={24} color='#64748b' />
            </TouchableOpacity>
          </View>
          {/* Input keyword */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <Ionicons name='search' size={20} color='#737373' />
            <TextInput
              style={{
                flex: 1,
                marginLeft: 8,
                borderBottomWidth: 1,
                borderColor: '#eee',
                fontSize: 16,
              }}
              value={keyword}
              onChangeText={setKeyword}
              placeholder={
                searchType === 'branch' ? 'Tìm chi nhánh...' : 'Tìm phòng...'
              }
              onSubmitEditing={handleSearch}
              returnKeyType='search'
            />
            <TouchableOpacity onPress={handleSearch} disabled={!keyword.trim()}>
              <Ionicons
                name='arrow-forward-circle'
                size={24}
                color={keyword.trim() ? '#f97316' : '#ccc'}
              />
            </TouchableOpacity>
          </View>
          {/* Result */}
          {isLoading && (
            <ActivityIndicator
              size='large'
              color='#f97316'
              style={{ marginTop: 16 }}
            />
          )}
          {hasSearched && !isLoading && (
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              style={{ maxHeight: 300 }}
              ListEmptyComponent={
                <Text
                  style={{
                    textAlign: 'center',
                    marginTop: 16,
                    color: '#64748b',
                  }}
                >
                  Không có kết quả phù hợp
                </Text>
              }
            />
          )}
          {!hasSearched && (
            <Text
              style={{ textAlign: 'center', marginTop: 16, color: '#64748b' }}
            >
              Nhập từ khóa và bấm tìm kiếm
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};
