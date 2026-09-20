# Ekran envanteri — 111 kayıtlı ekran

Makine topladı: her ekranın (ve klasöründeki yerel bileşenlerin) hangi veri
kaynağına dokunduğu. "Eşik" sütunu o bağımlılıktan türetildi.

**Uyarı:** bu bir ilk geçiş. "GÜN 1" çıkan bir ekran veri istemiyor olabilir
ama yine de gün 1'de *anlamlı* olmayabilir (örn. bir ayar ekranı). Sınıflama
kararı hâlâ bize ait; bu tablo sadece kanıt.


## ROTA — 6 ekran (3 tanesi veri istemiyor)

| Ekran | Eşik | Dokunduğu veri | Satır |
|---|---|---|---|
| RANK_SIMULATOR | GUN 1 | — | 132 |
| ROUTE_FULL | GUN 1 | — | 86 |
| ROUTE_STOP_DETAIL | GUN 1 | — | 80 |
| SUMMARY | rota kurulu | rota | 119 |
| WEEKLY_REVIEW | rota kurulu | rota | 119 |
| WEEKLY_TRIAL_REVIEW | rota kurulu | rota | 119 |

## PROGRAM — 9 ekran (5 tanesi veri istemiyor)

| Ekran | Eşik | Dokunduğu veri | Satır |
|---|---|---|---|
| CALENDAR | 1+ calisma | calisma | 116 |
| DAILY_PLAN | sunucu verisi | sunucu | 117 |
| GAP_CLOSURE | GUN 1 | — | 74 |
| MONTH_PLAN | GUN 1 | — | 125 |
| PLAN_DETAIL | GUN 1 | — | 155 |
| PLAN_VS_ACTUAL | GUN 1 | — | 129 |
| ROADMAP | rota kurulu | rota | 105 |
| TOPIC_DEBT | 1+ calisma | konu | 147 |
| WEEK_PROGRAM | GUN 1 | — | 141 |

## ANALIZ — 19 ekran (9 tanesi veri istemiyor)

| Ekran | Eşik | Dokunduğu veri | Satır |
|---|---|---|---|
| CARD_DETAIL | GUN 1 | — | 143 |
| COMPARATIVE | 1+ deneme | deneme | 140 |
| EXAM_SIMULATOR | GUN 1 | — | 106 |
| NET_FORECAST | GUN 1 | — | 97 |
| QUICK_PRACTICE | 1+ yanlis | yanlis | 130 |
| REVIEW_DONE | GUN 1 | — | 140 |
| REVIEW_SESSION | 1+ yanlis | yanlis | 130 |
| SEARCH | GUN 1 | — | 152 |
| SUBJECT_DETAIL | GUN 1 | — | 138 |
| SUBJECT_LIST | GUN 1 | — | 126 |
| SWIPE_REVIEW | 1+ yanlis | yanlis | 130 |
| TOPIC_CARDS | 1+ calisma | konu, sunucu | 128 |
| TOPIC_STUDY | 1+ calisma | konu, sunucu | 105 |
| TRIAL_COMPARE | 1+ deneme | deneme | 134 |
| TRIAL_DETAIL | 1+ deneme | deneme | 160 |
| TRIAL_RECORDS | 1+ deneme | deneme | 134 |
| WEAK_AREAS | GUN 1 | — | 109 |
| WRONG_DETAIL | GUN 1 | — | 14 |
| WRONG_NOTEBOOK | 1+ yanlis | yanlis | 119 |

## PROFIL — 35 ekran (21 tanesi veri istemiyor)

| Ekran | Eşik | Dokunduğu veri | Satır |
|---|---|---|---|
| ABOUT | GUN 1 | — | 89 |
| ACCOUNT_DELETE | GUN 1 | — | 98 |
| APPEARANCE | GUN 1 | — | 112 |
| CHALLENGE | sunucu verisi | sunucu | 315 |
| CLASS_SCHEDULE | GUN 1 | — | 92 |
| CREATE_GROUP | GUN 1 | — | 126 |
| DATA_EXPORT | GUN 1 | — | 83 |
| DOCUMENT | GUN 1 | — | 80 |
| EXAM_DATE | GUN 1 | — | 141 |
| EXAM_DAY_PLAN | GUN 1 | — | 83 |
| EXAM_RESULT | GUN 1 | — | 88 |
| FORECAST_ACCURACY | GUN 1 | — | 95 |
| FRIENDS | sunucu verisi | sunucu | 304 |
| GOALS | GUN 1 | — | 112 |
| GROUP_DETAIL | 1+ grup | grup | 109 |
| GROUP_SETTINGS | 1+ grup | grup | 120 |
| GROUPS | 1+ grup | grup | 93 |
| HOW_IT_WORKS | GUN 1 | — | 108 |
| JOIN_GROUP | GUN 1 | — | 146 |
| LEAGUE | sunucu verisi | sunucu | 419 |
| LEVEL | GUN 1 | — | 128 |
| MILESTONE | GUN 1 | — | 104 |
| NOTIFICATIONS | GUN 1 | — | 310 |
| NOTIFICATIONS_SETTINGS | GUN 1 | — | 142 |
| PREMIUM | 1+ deneme | deneme | 118 |
| PRIVACY | GUN 1 | — | 87 |
| REFERRAL | sunucu verisi | sunucu | 309 |
| ROUTE_COMPANION | sunucu verisi | sunucu | 121 |
| SETTINGS | GUN 1 | — | 202 |
| SHARE_CARD | sunucu verisi | sunucu | 114 |
| STUDY_HISTORY | 1+ calisma | calisma | 94 |
| STUDY_LOG | 1+ calisma | calisma | 94 |
| SUBSCRIPTION | 1+ deneme | deneme | 115 |
| SUBSCRIPTION_CANCEL | 1+ deneme | deneme | 106 |
| TERMS | GUN 1 | — | 15 |

## ROOT — 30 ekran (11 tanesi veri istemiyor)

| Ekran | Eşik | Dokunduğu veri | Satır |
|---|---|---|---|
| ACCESS_ENDED | 1+ deneme | deneme | 68 |
| ADD_STUDY | GUN 1 | — | 54 |
| ADD_TASK | GUN 1 | — | 120 |
| ADD_WRONG | GUN 1 | — | 150 |
| CHANGE_PASSWORD | sunucu verisi | sunucu | 119 |
| EDIT_EMAIL | sunucu verisi | sunucu | 128 |
| EDIT_PROFILE | GUN 1 | — | 117 |
| EDIT_STUDY_LOG | GUN 1 | — | 61 |
| EIGHTH_DAY_LOCK | 1+ deneme | deneme | 148 |
| EXAM_SETUP | GUN 1 | — | 149 |
| FIRST_ROUTE_READY | 1+ deneme | deneme | 214 |
| FIRST_WEEK | 1+ deneme | deneme | 307 |
| GOAL_SETUP | GUN 1 | — | 97 |
| OFFLINE_QUEUE | GUN 1 | — | 91 |
| ONBOARDING | GUN 1 | — | 79 |
| ONE_WEEK_COMPLETED | 1+ deneme | deneme | 170 |
| PAYMENT_CARD | 1+ deneme | deneme | 280 |
| PAYMENT_FAILED | 1+ deneme | deneme | 223 |
| PAYMENT_PROCESSING | 1+ deneme | deneme | 129 |
| PAYMENT_SUCCESS | 1+ deneme | deneme | 264 |
| PAYWALL | 1+ deneme | deneme | 28 |
| PRO_PREVIEW | 1+ deneme | deneme | 131 |
| ROUTE_PAUSE | GUN 1 | — | 72 |
| ROUTE_REDRAW | GUN 1 | — | 54 |
| STUDY_PROCESSED | 1+ deneme | deneme | 178 |
| STUDY_SAVE | 1+ calisma | calisma | 98 |
| STUDY_SUMMARY | rota kurulu | rota | 144 |
| STUDY_TIMER | 1+ calisma | calisma | 128 |
| TRIAL_ENTRY | 1+ deneme | deneme | 98 |
| TRIAL_SUMMARY | 1+ deneme | deneme | 115 |

## - — 12 ekran (5 tanesi veri istemiyor)

| Ekran | Eşik | Dokunduğu veri | Satır |
|---|---|---|---|
| ANALYSIS | GUN 1 | — | 136 |
| CURRICULUM_MAP | GUN 1 | — | 102 |
| FORGOT_PASSWORD | sunucu verisi | sunucu | 106 |
| HOME | 1+ deneme | deneme | 133 |
| LEVEL_TEST | rota kurulu | rota | 132 |
| LOGIN | sunucu verisi | sunucu | 117 |
| NOTIFICATION_PERMISSION | GUN 1 | — | 141 |
| PROFILE | GUN 1 | — | 118 |
| REGISTER | sunucu verisi | sunucu | 145 |
| ROUTE_READY | rota kurulu | rota | 140 |
| SET_NEW_PASSWORD | sunucu verisi | sunucu | 153 |
| SETUP_INCOMPLETE | GUN 1 | — | 130 |
