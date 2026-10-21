import React from 'react';
import { View, Modal, Image, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CloseIcon } from './SvgIcons';

interface Props {
  uri: string | null;
  onClose: () => void;
}

export function NativePhotoModal({ uri, onClose }: Props) {
  if (!uri) return null;

  return (
    <Modal visible={!!uri} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.topBar}>
            <Text style={styles.title}>Bukti Foto Nota</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <CloseIcon size={26} color="#FFFFFF" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
          <View style={styles.imageContainer}>
            <Image source={{ uri }} style={styles.image} resizeMode="contain" />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.94)',
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
