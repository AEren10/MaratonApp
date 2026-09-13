import { useRoute } from "@react-navigation/native";

import { CommunityQuestionDetail } from "./components/detail/CommunityQuestionDetail";
import { OwnWrongDetail } from "./components/detail/OwnWrongDetail";

// WrongDetail rotasi iki ekran tasir:
// - kendi yanlisin -> "Yanlış Detayı" (yeni tasarim)
// - params.community -> topluluk sorusu (sosyal v1 disi, eski govde korunuyor)
// Iki taraf ayri bilesen: hook sirasi rota parametresine gore degismesin.
export default function WrongDetailScreen() {
  const { params } = useRoute();
  return params?.community ? <CommunityQuestionDetail /> : <OwnWrongDetail />;
}
