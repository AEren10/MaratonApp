import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from "../../themes/tokens";

export class ScreenErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.title}>Bir sorun olustu</Text>
          <Text style={styles.subtitle}>
            Bu ekranda beklenmeyen bir hata var.
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark.background,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xxl,
  },
  emoji: { fontSize: 48, marginBottom: SPACING.lg },
  title: {
    ...TYPOGRAPHY.subheading,
    color: COLORS.dark.textPrimary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.dark.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.xxl,
  },
  button: {
    backgroundColor: COLORS.dark.accent,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  buttonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.dark.textInverse,
  },
});
