import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { AppleHaptic } from '../haptics';
import { PenToolIcon, TrashIcon } from './SvgIcons';

interface Props {
  children: React.ReactNode;
  onDelete: () => void;
  onEdit: () => void;
  isLast?: boolean;
}

const ACTION_WIDTH = 75;
const FULL_SWIPE_THRESHOLD = 140;

export function SwipeableRow({ children, onDelete, onEdit, isLast }: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const currentOffset = useRef(0);
  const thresholdHapticFired = useRef(false);
  const [isOpen, setIsOpen] = useState(false);

  const snapTo = (toValue: number, callback?: () => void) => {
    currentOffset.current = toValue;
    setIsOpen(toValue !== 0);
    Animated.spring(translateX, {
      toValue,
      tension: 340,
      friction: 28,
      useNativeDriver: true,
    }).start(callback);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => {
        // Disambiguate: only claim responder if horizontal movement clearly dominates vertical movement
        return (
          Math.abs(gesture.dx) > 12 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5
        );
      },
      onPanResponderGrant: () => {
        thresholdHapticFired.current = false;
        translateX.stopAnimation((val) => {
          currentOffset.current = val;
        });
      },
      onPanResponderMove: (_, gesture) => {
        let next = currentOffset.current + gesture.dx;

        // Apple rubber-band resistance damping when pulling past normal bounds
        if (next < -ACTION_WIDTH) {
          const extra = next + ACTION_WIDTH;
          next = -ACTION_WIDTH + extra * 0.4;
        } else if (next > ACTION_WIDTH) {
          const extra = next - ACTION_WIDTH;
          next = ACTION_WIDTH + extra * 0.4;
        }

        // Discrete single haptic tick when crossing action threshold
        if (!thresholdHapticFired.current && (next < -55 || next > 55)) {
          AppleHaptic.chipTap();
          thresholdHapticFired.current = true;
        } else if (thresholdHapticFired.current && next >= -40 && next <= 40) {
          thresholdHapticFired.current = false;
        }

        translateX.setValue(next);
      },
      onPanResponderRelease: (_, gesture) => {
        const netDx = currentOffset.current + gesture.dx;
        const velocity = gesture.vx;

        // Full swipe left -> immediate delete action
        if (netDx < -FULL_SWIPE_THRESHOLD || (gesture.dx < -70 && velocity < -0.8)) {
          AppleHaptic.warningDelete();
          snapTo(-Dimensions.get('window').width, () => {
            onDelete();
            snapTo(0);
          });
          return;
        }

        // Partial swipe left -> snap open delete button
        if (netDx < -40 || (gesture.dx < -20 && velocity < -0.3)) {
          AppleHaptic.chipTap();
          snapTo(-ACTION_WIDTH);
          return;
        }

        // Partial swipe right -> snap open edit button
        if (netDx > 40 || (gesture.dx > 20 && velocity > 0.3)) {
          AppleHaptic.chipTap();
          snapTo(ACTION_WIDTH);
          return;
        }

        // Snap back to 0
        snapTo(0);
      },
      onPanResponderTerminate: () => {
        snapTo(0);
      },
    })
  ).current;

  return (
    <View style={[styles.container, isLast && styles.containerLast]}>
      {/* Background Actions Layer */}
      <View style={styles.actionsLayer}>
        {/* Left Action (Revealed on Swipe Right) -> Edit */}
        <TouchableOpacity
          style={styles.editActionBtn}
          onPress={() => {
            AppleHaptic.chipTap();
            snapTo(0);
            onEdit();
          }}
          activeOpacity={0.8}
        >
          <PenToolIcon size={20} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.actionBtnText}>Ubah</Text>
        </TouchableOpacity>

        {/* Right Action (Revealed on Swipe Left) -> Delete */}
        <TouchableOpacity
          style={styles.deleteActionBtn}
          onPress={() => {
            AppleHaptic.warningDelete();
            snapTo(0);
            onDelete();
          }}
          activeOpacity={0.8}
        >
          <TrashIcon size={20} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.actionBtnText}>Hapus</Text>
        </TouchableOpacity>
      </View>

      {/* Foreground Content */}
      <Animated.View
        style={[
          styles.rowContent,
          { transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            if (isOpen) {
              snapTo(0);
            } else {
              AppleHaptic.chipTap();
              onEdit();
            }
          }}
          style={styles.touchableWrapper}
        >
          {children}
          {!isLast && <View style={styles.hairlineSeparator} />}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  containerLast: {
  },
  hairlineSeparator: {
    position: 'absolute',
    bottom: 0,
    left: 72,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(60, 60, 67, 0.12)',
  },
  actionsLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  editActionBtn: {
    width: ACTION_WIDTH,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  deleteActionBtn: {
    width: ACTION_WIDTH,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 3,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  rowContent: {
    backgroundColor: '#FFFFFF',
  },
  touchableWrapper: {
    width: '100%',
  },
});
