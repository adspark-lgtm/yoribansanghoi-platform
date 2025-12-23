# 🍳 요리반상회 AX Platform

> AI 푸드 IP 디지털 트랜스포메이션 플랫폼

레시피를 제품으로, 50일 만에 HMR 출시

---

## 🚀 배포 가이드

### 1단계: GitHub 저장소 생성

```bash
# 프로젝트 폴더에서
git init
git add .
git commit -m "Initial commit: 요리반상회 AX Platform"

# GitHub에서 새 저장소 생성 후
git remote add origin https://github.com/YOUR_USERNAME/yoribansanghoi-platform.git
git branch -M main
git push -u origin main
```

### 2단계: Vercel 배포

#### Option A: Vercel CLI (권장)

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포 (최초)
vercel

# 프로덕션 배포
vercel --prod
```

#### Option B: Vercel 웹사이트

1. [vercel.com](https://vercel.com) 접속
2. "Add New Project" 클릭
3. GitHub 저장소 연결
4. 자동 감지된 Next.js 설정 확인
5. "Deploy" 클릭

### 3단계: 환경 변수 설정

Vercel Dashboard → Settings → Environment Variables:

```
# 필수
NEXT_PUBLIC_APP_URL=https://ax.yoribansanghoi.com

# AI API (배포 후 설정)
ANTHROPIC_API_KEY=sk-ant-...
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-northeast-2

# 알림 (선택)
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

### 4단계: 도메인 연결 (선택)

1. Vercel Dashboard → Settings → Domains
2. `ax.yoribansanghoi.com` 추가
3. DNS 설정:
   - CNAME: `ax` → `cname.vercel-dns.com`
   - 또는 A 레코드: `76.76.21.21`

---

## 📂 프로젝트 구조

```
yoribansanghoi-platform/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── page.tsx         # 메인 랜딩 페이지
│   │   ├── analyze/         # AI 레시피 분석
│   │   ├── factory/         # 공장 매칭
│   │   └── consultation/    # 상담 신청
│   ├── components/          # 공통 컴포넌트
│   ├── lib/                 # 유틸리티, DB 클라이언트
│   └── types/               # TypeScript 타입
├── api/lambda/              # AWS Lambda 함수
├── infra/cloudformation/    # AWS 인프라 템플릿
└── public/                  # 정적 파일
```

---

## 🛠 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# http://localhost:3000 접속
```

---

## 📋 배포 후 체크리스트

- [ ] 메인 페이지 로드 확인
- [ ] 모바일 반응형 확인
- [ ] 각 서비스 페이지 접근 확인
- [ ] 상담 신청 폼 작동 확인
- [ ] 환경 변수 설정 완료
- [ ] 도메인 SSL 인증서 확인

---

## 🔗 관련 링크

- **Vercel 대시보드**: https://vercel.com/dashboard
- **GitHub Actions**: 자동 CI/CD 구성됨
- **AWS Console**: Lambda/DynamoDB 백엔드

---

## 📞 문의

- Email: contact@yoribansanghoi.com
- Tel: 02-1234-5678
