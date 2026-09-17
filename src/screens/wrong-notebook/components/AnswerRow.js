import React from "react";
import { View, Text } from "react-native";
import { Avatar } from "../../../components/design";
import SignedImage from "../../../components/common/SignedImage";
import { formatTime, formatShortDate } from "../../../lib/format";

export function AnswerRow({ answer, s, C }) {
  const name = answer.profile?.name || "Anonim";
  const when = answer.created_at
    ? `${formatShortDate(answer.created_at)} · ${formatTime(answer.created_at)}`
    : "";
  return (
    <View style={s.answer}>
      <Avatar init={name.slice(0, 2).toUpperCase()} size={28} image={answer.profile?.avatar_url} />
      <View style={{ flex: 1 }}>
        <View style={s.answerHead}>
          <Text style={s.answerName}>{name}</Text>
          <Text style={s.answerTime}>{when}</Text>
        </View>
        {answer.text ? <Text style={s.answerText}>{answer.text}</Text> : null}
        {answer.image_path ? (
          <SignedImage
            bucket="community-answers"
            path={answer.image_path}
            style={s.answerImage}
            contentFit="cover"
          />
        ) : null}
      </View>
    </View>
  );
}
