import { OwnWrongDetail } from "./components/detail/OwnWrongDetail";

// V1 yalniz kullanicinin kendi yanlis detayini gosterir. Eski topluluk
// parametreleri deep link veya kayitli navigation state ile gelse bile yok
// sayilir; topluluk govdesi production import zincirine alinmaz.
export default function WrongDetailScreen() {
  return <OwnWrongDetail />;
}
