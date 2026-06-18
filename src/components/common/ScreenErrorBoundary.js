import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from "../../themes/tokens";
import { Icon } from "../design";
import { captureError } from "../../lib/errorReporting";

export class ScreenErrorBoundary extends React.Component {
  state = { hasError: false, errorMsg: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMsg: error?.message || null };
  }

  componentDidCatch(error, info) {
    captureError(error, { componentStack: info?.componentStack });
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMsg: null });
  };

  handleGoBack = () => {
    this.setState({ hasError: false, errorMsg: null });
    this.props.navigation?.goBack?.();
  };

  render() {
    if (this.state.hasError) {
      const hasNav = !!this.props.navigation?.goBack;
      return (
        <View style={styles.container}>
          <Icon name="alert" size={48} color={COLORS.dark.warning} />
          <Text style={styles.title}>Bir sorun oluştu</Text>
          <Text style={styles.subtitle}>
            Bu ekranda beklenmeyen bir hata var.
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>Tekrar Dene</Text>
            </TouchableOpacity>
            {hasNav && (
              <TouchableOpacity style={styles.backButton} onPress={this.handleGoBack}>
                <Text style={styles.backText}>Geri Dön</Text>
              </TouchableOpacity>
            )}
          </View>
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
  title: {
    ...TYPOGRAPHY.subheading,
    color: COLORS.dark.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.dark.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.xxl,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.md,
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
  backButton: {
    borderWidth: 1,
    borderColor: COLORS.dark.border,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  backText: {
    ...TYPOGRAPHY.button,
    color: COLORS.dark.textSecondary,
  },
});
