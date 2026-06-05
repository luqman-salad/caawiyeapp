import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightIcon?: string; // Icon name from Feather or Ionicons
  rightIconType?: 'feather' | 'ionicons';
  onRightPress?: () => void;
  rightElement?: React.ReactNode;
  theme?: 'light' | 'dark' | 'green';
  transparent?: boolean;
  floating?: boolean;
}

export default function Header({
  title,
  showBack = false,
  onBackPress,
  rightIcon,
  rightIconType = 'feather',
  onRightPress,
  rightElement,
  theme = 'light',
  transparent = false,
  floating = false,
}: HeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  // Determine colors based on theme
  const getThemeStyles = () => {
    switch (theme) {
      case 'dark':
        return {
          bg: '#0f172a',
          text: '#ffffff',
          iconColor: '#ffffff',
          iconBg: 'rgba(255, 255, 255, 0.1)',
          statusBar: 'light-content' as const,
        };
      case 'green':
        return {
          bg: '#00b047',
          text: '#ffffff',
          iconColor: '#ffffff',
          iconBg: 'rgba(255, 255, 255, 0.15)',
          statusBar: 'light-content' as const,
        };
      case 'light':
      default:
        return {
          bg: '#ffffff',
          text: '#0f172a',
          iconColor: '#0f172a',
          iconBg: '#f1f5f9',
          statusBar: 'dark-content' as const,
        };
    }
  };

  const themeStyle = getThemeStyles();

  const renderRightIcon = () => {
    if (rightElement) return rightElement;
    if (!rightIcon) return <View style={styles.actionPlaceholder} />;

    return (
      <TouchableOpacity 
        style={[styles.actionButton, { backgroundColor: themeStyle.iconBg }]} 
        onPress={onRightPress}
        activeOpacity={0.7}
      >
        {rightIconType === 'feather' ? (
          <Feather name={rightIcon as any} size={18} color={themeStyle.iconColor} />
        ) : (
          <Ionicons name={rightIcon as any} size={18} color={themeStyle.iconColor} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View 
      style={[
        styles.headerContainer,
        { 
          backgroundColor: transparent ? 'transparent' : themeStyle.bg,
          paddingTop: transparent ? 10 : insets.top,
        },
        transparent && styles.transparentAbsolute,
        floating && styles.floatingLayout,
      ]}
    >
      <StatusBar barStyle={themeStyle.statusBar} backgroundColor={transparent ? 'transparent' : themeStyle.bg} translucent={transparent} />
      
      <View style={styles.contentRow}>
        {showBack ? (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: themeStyle.iconBg }]} 
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={18} color={themeStyle.iconColor} />
          </TouchableOpacity>
        ) : (
          <View style={styles.actionPlaceholder} />
        )}

        <Text 
          style={[
            styles.titleText, 
            { color: themeStyle.text },
            floating && styles.floatingTitle,
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>

        {renderRightIcon()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e2e8f0',
    zIndex: 10,
  },
  transparentAbsolute: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 10,
    left: 0,
    right: 0,
    borderBottomWidth: 0,
    borderColor: 'transparent',
  },
  floatingLayout: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    right: 20,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  contentRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  titleText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '800',
    marginHorizontal: 12,
  },
  floatingTitle: {
    color: '#0f172a',
    fontSize: 15,
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionPlaceholder: {
    width: 38,
    height: 38,
  },
});
