import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { C, SPACING, TYPOGRAPHY, RADIUS } from "../../themes/tokens";
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
        <View style={{ flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center", padding: SPACING.xxl }}>
          <Icon name="alert" size={48} color={C.warning} />
          <Text style={{ ...TYPOGRAPHY.subheading, color: C.text, marginTop: SPACING.lg, marginBottom: SPACING.sm }}>Bir sorun oluştu</Text>
          <Text style={{ ...TYPOGRAPHY.body, color: C.sec, textAlign: "center", marginBottom: SPACING.xxl }}>
            Bu ekranda beklenmeyen bir hata var.
          </Text>
          <View style={{ flexDirection: "row", gap: SPACING.md }}>
            <TouchableOpacity style={{ backgroundColor: C.accent, paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.md, borderRadius: RADIUS.md }} onPress={this.handleReset}>
              <Text style={{ ...TYPOGRAPHY.button, color: C.textOnFill }}>Tekrar Dene</Text>
            </TouchableOpacity>
            {hasNav && (
              <TouchableOpacity style={{ borderWidth: 1, borderColor: C.border, paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.md, borderRadius: RADIUS.md }} onPress={this.handleGoBack}>
                <Text style={{ ...TYPOGRAPHY.button, color: C.sec }}>Geri Dön</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}
