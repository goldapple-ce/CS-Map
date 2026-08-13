# CS Map 콘텐츠

`frontend/content`에는 CS Map의 Scene, Topic 설명, 공통 Concept와 퀴즈가 들어 있습니다. 화면 코드와 분리되어 있어 YAML과 Markdown만으로 콘텐츠를 추가하거나 수정할 수 있습니다.

## 처음 작성할 때

1. 비슷한 기존 Scene과 Topic을 먼저 확인합니다.
2. [CONTENT_FORMAT.md](./CONTENT_FORMAT.md)의 파일 구조와 형식에 맞춰 YAML과 Markdown을 작성합니다.
3. 제품과 용어 기준이 필요하면 저장소 루트의 `REQUIREMENTS.md`, `TECHNICAL_DESIGN.md`, `GLOSSARY.md`를 확인합니다.
4. 콘텐츠 검증 명령으로 파일 구조와 참조를 확인합니다.

## 콘텐츠 확인

`frontend` 디렉터리에서 실행합니다.

```bash
npm run content:validate
```

개발 서버와 빌드는 실행 전에 콘텐츠 인덱스를 자동으로 생성합니다.

## 문서 안내

- [CONTENT_FORMAT.md](./CONTENT_FORMAT.md): 사람과 에이전트가 함께 따르는 파일 및 작성 형식
- [AGENTS.md](./AGENTS.md): AI 에이전트가 콘텐츠를 판단하고 작성할 때 따르는 규칙
- `REQUIREMENTS.md`: 제품과 콘텐츠 요구사항
- `TECHNICAL_DESIGN.md`: 콘텐츠 구조와 빌드 방식
- `GLOSSARY.md`: 프로젝트 권장 용어
