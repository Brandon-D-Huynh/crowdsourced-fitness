import { TextInput, type TextInputProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedTextInput({ style, lightColor, darkColor, ...rest }: ThemedTextInputProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const borderColor = useThemeColor({ light: lightColor, dark: darkColor }, 'border');
  const placeholderTextColor = useThemeColor({ light: lightColor, dark: darkColor }, 'placeholder');

  return (
    <TextInput
      style={[{ color, borderColor }, styles.input, style]}
      placeholderTextColor={placeholderTextColor}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
});
