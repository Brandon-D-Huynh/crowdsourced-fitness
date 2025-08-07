
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ThemedDropdownProps {
  options: string[];
  onSelect: (option: string) => void;
  placeholder?: string;
}

export function ThemedDropdown({ options, onSelect, placeholder = 'Select an option' }: ThemedDropdownProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const color = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'background');

  const handleSelect = (option: string) => {
    setSelectedOption(option);
    onSelect(option);
    setModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity style={[styles.dropdown, { borderColor }]} onPress={() => setModalVisible(true)}>
        <Text style={{ color }}>{selectedOption || placeholder}</Text>
      </TouchableOpacity>
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor }]}>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.option} onPress={() => handleSelect(item)}>
                  <Text style={{ color }}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderRadius: 8,
    padding: 16,
    width: '80%',
    maxHeight: '60%',
  },
  option: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});
