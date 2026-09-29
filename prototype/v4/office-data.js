// Deliberately curated public directory, not a feed of private files or agent activity.
export const meta = Object.freeze({version:'4.0.0',reviewedAt:'2026-09-29',live:false,mode:'공개 업무 디렉터리'});
export const characters = Object.freeze([
 {id:'heo',name:'헤리',role:'전체 안내',file:'Heo-sajang.svg',color:'#dcaa88'},
 {id:'ko',name:'코부장',role:'설계와 검토',file:'Ko-bujang.svg',color:'#d89e72'},
 {id:'oh',name:'오과장',role:'실행과 점검',file:'Oh-gwajang.svg',color:'#7eae89'},
 {id:'jem',name:'젬대리',role:'조사와 발견',file:'Jem-daeri.svg',color:'#9a98c1'}
]);
export const areas = Object.freeze([
 {id:'business',number:'01',name:'사업 스튜디오',english:'OFFSPACE STUDIO',short:'사업',color:'#b87754',folder:'01_Offspace_Business',channel:'offs_business',guide:'heo',description:'작은 아이디어가, 매일 쓰는 서비스가 되는 곳.',note:'제품을 눌러 공개 페이지를 열거나 업무 구분을 확인하세요. 심사·매출·이용자 수의 실시간 상태를 뜻하지 않습니다.',projects:[
  {name:'숨은정원',description:'발견하고 구조하는 작은 게임',label:'웹 프로토타입',url:'https://hidden-garden-review.pages.dev/'},
  {name:'1분 두뇌체조',description:'짧게 즐기는 매일의 두뇌 게임',label:'Apps in Toss'},
  {name:'인터셉트',description:'내 관심사로 만나는 뉴스와 대화',label:'뉴스 서비스'},
  {name:'운명',description:'나를 이해하는 개인화된 리딩',label:'웹 서비스',url:'https://un-myeong.pages.dev/'},
  {name:'오늘의 짝꿍',description:'오늘의 인연을 만나는 즐거움',label:'Apps in Toss'},
  {name:'오늘의 골프',description:'필드 밖에서도 이어지는 골프',label:'웹 서비스',url:'https://todays-golf.pages.dev/'}]},
 {id:'investment',number:'02',name:'투자 관측소',english:'INVESTMENT OBSERVATORY',short:'투자',color:'#779271',folder:'02_BaToo_Investment',channel:'offs_investment',guide:'oh',description:'숫자는 정확하게, 판단은 차분하게.',note:'이 사무실은 계좌를 조회하거나 주문하지 않습니다. 잔고·조회 시각은 별도 투자 대시보드에서 확인합니다.',projects:[
  {name:'3종 투자 대시보드',description:'Smart · Snow · ISA 관측 자료',label:'별도 공개 화면',url:'https://batoo-dashboard.asitis0310.workers.dev/'},
  {name:'개인연금',description:'ETF 포트폴리오와 분할 매수 기록',label:'비공개 업무'}]},
 {id:'work',number:'03',name:'워크숍',english:'THE WORKSHOP',short:'업무',color:'#6e94aa',folder:'03_Work',channel:'work-in-sec',guide:'ko',description:'문제를 정리하고, 쓸모 있는 도구로 만드는 곳.',note:'회사 자료와 내부 도구의 내용은 이 공개 사무실에 게시하지 않습니다.',projects:[
  {name:'기술 · 업무 문서',description:'업무별 문서와 기술 검토',label:'비공개 업무'},
  {name:'내부 도구',description:'개발과 반복 업무 자동화',label:'비공개 업무'}]},
 {id:'research',number:'04',name:'리서치 온실',english:'RESEARCH GREENHOUSE',short:'연구',color:'#839783',folder:'04_RnD_References',channel:'research',guide:'jem',description:'아직 이름 없는 가능성을 천천히 키웁니다.',note:'연구 주제의 길잡이입니다. 실행 중인 실험이나 자동 갱신 상태로 표시하지 않습니다.',projects:[
  {name:'AI · 에이전트 연구',description:'모델, 도구, 에이전트 사용 경험',label:'탐색'},
  {name:'디자인 레퍼런스',description:'공간 · 빛 · 움직임이 있는 웹',label:'참고 자료'},
  {name:'실험과 프로토타입',description:'작게 만들고 실제로 확인하기',label:'R&D'}]},
 {id:'public',number:'05',name:'커뮤니티 홀',english:'COMMUNITY HALL',short:'대외활동',color:'#ba9859',folder:'05_Public_Professional_Engagement',channel:null,guide:'jem',description:'배운 것을 나누고, 새로운 관점을 만납니다.',note:'참여 영역만 소개합니다. 실제 일정·참석자·제출 자료는 공개하지 않습니다.',projects:[
  {name:'RAPA 멘토링',description:'경험을 나누는 멘토링 활동',label:'대외 활동'},
  {name:'KIEES 연구 활동',description:'함께 배우고 교류하는 연구',label:'전문 활동'}]},
 {id:'life',number:'06',name:'라이프 코티지',english:'LIFE COTTAGE',short:'생활',color:'#bc8b8c',folder:'06_Personal_Life',channel:'인생궁리',guide:'heo',description:'일 바깥의 시간이, 다시 일할 힘이 됩니다.',note:'가족 사진·건강·개인 일정은 연결하지 않은 비공개 영역입니다.',projects:[
  {name:'가족 · 기록',description:'함께 만든 순간을 모으는 공간',label:'비공개'},
  {name:'취미 · 휴식',description:'좋아하는 것과 회복하는 시간',label:'비공개'}]}
]);
export function getArea(id) { return areas.find(area => area.id === id) || null; }
