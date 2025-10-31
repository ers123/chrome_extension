meta:
  version: "0.1.0"
  timestamp: "2025-08-26T00:00:00Z"
  stage: "TRD"
  parentRef: "PRD-Tab Nudge-0.1.0"
  project: "Tab Nudge"

기술 요구사항서 (TRD) — Tab Nudge

1) 아키텍처 개요
	•	플랫폼: Chrome 확장프로그램 Manifest V3 (MV3), Chromium 계열 브라우저 우선.
	•	런타임 구성
	•	Background Service Worker: 탭 상태 모니터링, 임계치 감지, 액션 실행, Undo 스택 관리, 스케줄(알람) 기반 작업.
	•	UI Surfaces
	•	Side Panel 또는 Action Popup: 알림 트리거 시 액션 가능한 패널(UI) 제공.
	•	Options/Settings 페이지: 온보딩·설정 관리.
	•	Dashboard 페이지: 통계/리포트/CSV 내보내기.
	•	Notifications: 임계치 초과 경보 및 퀵액션 버튼(제한 2개) + 패널 열기.
	•	데이터 계층
	•	로컬 퍼시스턴스: IndexedDB(행위 로그·지표), chrome.storage(설정·플래그).
	•	텔레메트리(옵트인): 익명화·도메인 수준 집계만 배치 업로드(향후).
	•	주요 브라우저 API
	•	chrome.tabs, chrome.windows, chrome.notifications, chrome.alarms, chrome.storage, chrome.commands, chrome.i18n, chrome.action, chrome.runtime, chrome.sidePanel(지원 시), chrome.sessions(Undo), chrome.tabs.discard(절전).

2) 기술 스택
	•	언어/빌드: TypeScript, Vite(또는 Rollup) 번들, MV3 대응.
	•	UI: React 기반(Options/Dashboard/Side Panel/Popup), Recharts(차트), Tailwind(스타일), Headless UI(접근성 보조).
	•	상태관리: Zustand(경량) 또는 기반 React state + 메시지 패턴.
	•	데이터: IndexedDB (idb 헬퍼), chrome.storage.local/sync 병행.
	•	국제화: chrome.i18n + messages.json 구조.
	•	테스트: Vitest(단위), Playwright(이2이, 확장 시나리오), Lighthouse CI(옵션 페이지/대시보드 성능/접근성).
	•	품질: ESLint, Prettier, Commitlint, GitHub Actions(빌드/테스트).

3) 권한 및 매니페스트
	•	필수 권한: tabs, storage, notifications, alarms, commands, sessions(Undo), sidePanel(가능 시).
	•	선택 권한: activeTab(맥락 작업), scripting(필요 시), management(탭/윈도우 고급 질의가 필요할 경우 최소화).
	•	호스트 권한: 불필요(콘텐츠 접근 없음). URL/제목은 tabs로 취득.
	•	매니페스트 키: manifest_version: 3, background.service_worker, action(popup), options_page, side_panel, commands, i18n.

4) 데이터 모델 & 스토리지
	•	설정 (Settings)
	•	thresholdTabs: number (기본 30, 5–200)
	•	cooldownMinutes: number (기본 10)
	•	quickOldestCount: number (기본 10, 5–30)
	•	snoozeMinutesDefault: number (기본 60)
	•	weeklyReportOptIn: boolean (기본 false)
	•	i18nLocale: "ko" | "en" | ...
	•	런타임 상태 (RuntimeState)
	•	lastAlertAt: number | null
	•	snoozeUntil: number | null
	•	undoStack: Array<UndoEntry> (TTL=10초 단위 만료)
	•	UndoEntry
	•	id, createdAt, type: "close" | "group" | "archive"
	•	tabs: Array<{id?, url, index, pinned, title, windowId}>
	•	행위 로그 / 지표 (IndexedDB)
	•	ActionLog: {ts, actionType, count, reason, sampleDomains[]}
	•	DailyAgg: {date, avgConcurrent, maxConcurrent, openedCount, duplicateRate, topDomains[]}
	•	CSV Export
	•	스키마: 헤더 포함 UTF-8, date,avgConcurrent,maxConcurrent,openedCount,duplicateRate,topDomains

5) 인터모듈 메시징 규격
	•	Runtime Messages (chrome.runtime.sendMessage)
	•	ALERT_TRIGGERED {current, threshold}
	•	RUN_ACTION {action:"CLOSE_OLDEST"|"CLOSE_DUPLICATES"|"GROUP_DOMAIN"|"SNOOZE", payload}
	•	ACTION_PREVIEW / ACTION_RESULT {summary, affectedCount, undoId}
	•	SETTINGS_UPDATED {partialSettings}
	•	DASHBOARD_REQUEST / DASHBOARD_RESPONSE {metrics}
	•	Events
	•	Tabs: onCreated, onRemoved, onUpdated, onActivated
	•	Alarms: onAlarm(주간 리포트, 스누즈 해제)

6) 모듈 설계

TRD-MOD-001 코어 탭 모니터
	•	목적: 탭 수 집계·임계치 감지·쿨다운/스누즈 로직.
	•	PRD 맵핑: FR-001, NFR(성능·지연)
	•	주요 동작
	•	모든 윈도우의 탭 총합 계산(비정기: 이벤트 기반 + 아이들타임 샘플링).
	•	임계치 초과 시 2초 내 ALERT_TRIGGERED.
	•	쿨다운·스누즈 상태 체크.
	•	인터페이스
	•	입력: Tabs 이벤트
	•	출력: ALERT_TRIGGERED
	•	우선순위: P0
	•	성능: 평균 CPU ≤2% 유지(샘플링/디바운스).

TRD-MOD-002 알림 & 액션 UI
	•	목적: 경고 알림 및 액션 패널(UI) 제공.
	•	PRD 맵핑: FR-001, FR-002, FR-007
	•	구성
	•	Notification: 2개 버튼(Quick Clean, Snooze) + 본문 클릭 시 Side Panel/Popup 오픈.
	•	Side Panel/Popup: A1~A4 전체 액션, 미리보기, 확인/취소, Undo 토스트.
	•	인터페이스
	•	입력: ALERT_TRIGGERED
	•	출력: RUN_ACTION, ACTION_PREVIEW, ACTION_RESULT
	•	우선순위: P0
	•	접근성: 키보드 완전 조작, 스크린리더 라벨.

TRD-MOD-003 액션 엔진
	•	목적: A1~A4 실행 로직.
	•	PRD 맵핑: FR-002
	•	액션 상세
	•	A1 CLOSE_OLDEST: 최근 활성 시각 기준 오랫동안 미사용 탭 N개 닫기.
	•	A2 CLOSE_DUPLICATES: 정규화 URL 키로 묶어 중복 탭 닫기(최신 1개 유지).
	•	A3 GROUP_DOMAIN (보관/묶기): 선택 도메인 탭을 새 창/그룹으로 이동 또는 보관(닫고 Undo로 복구 가능).
	•	A4 SNOOZE: 알림 비활성(15/30/60/180분), 알람 스케줄링.
	•	미리보기: 각 액션 대상 탭 목록/수량 산출.
	•	Undo: 실행 전 UndoEntry 등록, 10초 내 복원.
	•	인터페이스: RUN_ACTION 처리 → ACTION_RESULT 반환
	•	우선순위: P0

TRD-MOD-004 Undo 매니저
	•	목적: 작업 후 10초 내 완전 복구.
	•	PRD 맵핑: FR-002, NFR(신뢰성)
	•	방법
	•	1차: chrome.sessions.restore 활용
	•	2차: 보관된 URL/인덱스/핀 상태로 탭 재생성
	•	우선순위: P0
	•	지표: 복구성공률 ≥99.9%

TRD-MOD-005 온보딩 & 설정
	•	목적: 3단계 온보딩, 임계치/스누즈/리포트 설정.
	•	PRD 맵핑: FR-006
	•	UI: Options 페이지(React), 검색형 설정.
	•	우선순위: P0

TRD-MOD-006 대시보드 & 통계
	•	목적: 지표 가시화, 7/30일 전환, CSV 내보내기.
	•	PRD 맵핑: FR-003
	•	소스: IndexedDB 집계 + 실시간 스냅샷.
	•	우선순위: P1
	•	성능: 페이지 로드 ≤2초(캐시 사용).

TRD-MOD-007 주간 리포트 & 점수/배지
	•	목적: 주간 요약, 개선율, 배지 로직.
	•	PRD 맵핑: FR-004
	•	스케줄: 로컬 일요일 09:00, chrome.alarms.
	•	우선순위: P2 (옵트인)

TRD-MOD-008 스마트 제안(휴리스틱 우선)
	•	목적: 주제별 그룹화/절전/읽기목록 제안.
	•	PRD 맵핑: FR-005
	•	휴리스틱
	•	제목/도메인 유사도(Jaccard/토큰), 상위 도메인 클러스터링
	•	미사용 X분 → tabs.discard 제안
	•	기사성 URL Y일 미열람 → 읽기목록 제안(내부 보관)
	•	우선순위: P2 (옵트인)
	•	피드백루프: 거부 증가 시 빈도 감소.

TRD-MOD-009 접근성 & 단축키
	•	목적: 키보드/스크린리더 지원, 사용자 단축키 재지정.
	•	PRD 맵핑: FR-007
	•	단축키(기본): 알림 열기, A1~A4에 매핑(사용자 재지정).
	•	우선순위: P1

TRD-MOD-010 국제화(i18n)
	•	목적: 한국어/영어 완전 지원.
	•	PRD 맵핑: FR-008
	•	구성: /_locales/{ko,en}/messages.json; 날짜/숫자 로케일 포맷.
	•	우선순위: P1

TRD-MOD-011 프라이버시 & 텔레메트리
	•	목적: 로컬 우선, 옵트인 익명 통계.
	•	PRD 맵핑: NFR(프라이버시/보안)
	•	원칙: URL 전체 저장 금지(도메인 수준만), 해시 처리, 익명 ID 로테이션.
	•	우선순위: P1

TRD-MOD-012 성능 & 리소스 매니저
	•	목적: CPU/메모리 예산 관리.
	•	PRD 맵핑: NFR(성능/지연)
	•	전략: 이벤트 드리븐+디바운스, 아이들타임 계산, 대규모 스캔 스로틀.
	•	우선순위: P0

TRD-MOD-013 빌드·패키징·배포
	•	목적: MV3 번들, 스토어 제출 산출물 생성.
	•	PRD 맵핑: 가용성/호환성 NFR
	•	산출물: zip 패키지, 아이콘 세트, 스토어 메타.
	•	우선순위: P0

TRD-MOD-014 테스트 & 품질
	•	목적: 단위/이2이/회귀/접근성 테스트.
	•	PRD 맵핑: 모든 FR/NFR 검증
	•	스코프
	•	단위: 액션 엔진/Undo/임계치/스누즈
	•	이2이: 임계치 초과→알림→액션→Undo 플로우
	•	접근성: 키보드 탐색, ARIA 라벨 낭독
	•	성능: 백그라운드 평균 CPU, 알림 지연
	•	우선순위: P0

7) 알고리즘 사양
	•	탭 집계: 모든 창의 tabs.query({}) 총합. 디바운스(250–500ms).
	•	오래된 탭: lastAccessed/활성 이력 기반 정렬 후 상위 N 닫기(고정탭 제외 옵션).
	•	중복 탐지: URL 정규화(스킴/www/트래킹 파라미터 제거 옵션) 키로 그룹화, 최신 1개 유지.
	•	도메인 묶기/보관: 도메인별 그룹 생성→새 창 이동 또는 닫고 Undo 스택 기록.
	•	Undo: chrome.sessions 우선, 실패 시 수동 복구.
	•	절전 제안: 미사용 X분, chrome.tabs.discard 대상 추천.
	•	스누즈: snoozeUntil=now+minutes, 알람 만료 시 재활성.

8) 국제화/현지화
	•	메시지 키 표준화: alert.threshold.title, action.closeOldest, …
	•	런타임 로케일 전환 지원(재시작 불필요), 날짜/숫자 Intl API 사용.

9) 접근성/단축키
	•	포커스 트랩, 명확한 포커스 인디케이터, ARIA 라벨.
	•	기본 커맨드: open_actions, close_oldest, close_duplicates, group_domain, snooze.
	•	사용자 재지정: Options 페이지에서 commands.update 기반.

10) 보안/프라이버시
	•	최소 권한 원칙, 외부 통신 화이트리스트.
	•	민감 데이터(설정) 로컬 저장, 동기화 선택 시 chrome.storage.sync.
	•	텔레메트리 옵트인만, 익명화, 전송 시 전송량 최소화.

11) 성능 예산
	•	백그라운드 평균 CPU ≤ 2%, 메모리 오버헤드 ≤ 100MB.
	•	알림 표시 ≤ 2초, 액션 피드백 시작 ≤ 1초.
	•	대시보드 로드 ≤ 2초.

12) 테스트 전략(요구사항 기반)
	•	FR-001: 임계치 초과 2초 내 알림 표시, 쿨다운 준수(이2이).
	•	FR-002: A1~A4 실행, 미리보기 수량/결과 일치, 10초 Undo(단위+이2이).
	•	FR-003: 7/30일 전환, CSV 스키마 유효(단위).
	•	FR-004: 일요일 09:00 트리거, 배지 로직(모의시계).
	•	FR-005: 제안 근거/효과 표기, 빈도 조절(단위).
	•	FR-006: 온보딩 3단계, 설정 즉시 반영(UI 테스트).
	•	FR-007: 키보드 조작·스크린리더 라벨 검증(aXe/Lighthouse).
	•	FR-008: 언어 전환 즉시 반영 스냅샷 테스트.

13) 릴리스 계획(마일스톤 대응)
	•	P0 리서치/스펙 동결 → MOD-001/002/003/004/005/012/013/014 구현
	•	M1: 임계치/스누즈/온보딩 알파
	•	M2: 액션 가능한 패널+Undo 베타
	•	M3: 대시보드/i18n/단축키
	•	M4: 스마트 제안/주간 리포트(옵트인)
	•	M5: 품질/보안/스토어 검수

14) 추적 매트릭스 (PRD ↔ TRD)

PRD FR/NFR	TRD 모듈
FR-001 임계치 기반 알림	MOD-001, MOD-002
FR-002 액션 가능한 알림 버튼(A1~A4), Undo	MOD-002, MOD-003, MOD-004
FR-003 대시보드 & 통계	MOD-006
FR-004 주간 리포트 & 배지	MOD-007
FR-005 스마트 제안	MOD-008
FR-006 온보딩 & 설정	MOD-005
FR-007 접근성 & 단축키	MOD-002, MOD-009
FR-008 국제화	MOD-010
NFR 성능/지연	MOD-001, MOD-012
NFR 신뢰성(Undo)	MOD-004
NFR 호환성/가용성	MOD-013
NFR 프라이버시/보안	MOD-011
NFR 사용성	MOD-002, MOD-005

15) 위험 및 완화
	•	Notifications 버튼 제한(최대 2개) → 퀵액션 2개 + 사이드패널 자동 오픈으로 전체 액션 제공.
	•	세션 복구 실패 케이스 → 이중화(세션+수동 복구), TTL·지표 모니터링.
	•	탭 스캔 비용 → 이벤트 기반+디바운스, 아이들타임 집계, 창 단위 샘플링.

16) 비범위(초기)
	•	북마크/세션 동기화 대체, 협업 공유, 비-Chromium 전용 기능.