Struktur folder

src/
├── app/
│ ├── (tabs)/
│ │ ├── \_layout.tsx
│ │ ├── index.tsx
│ │ ├── timesheet.tsx
│ │ ├── history.tsx
│ │ └── profile.tsx
│ ├── \_layout.tsx
│ ├── index.tsx
│ └── login.tsx
├── components/
│ ├── AppButton.tsx
│ └── AppInput.tsx
└── constants/
└── theme.ts

New-Item -ItemType Directory -Force "src\app\(tabs)"
New-Item -ItemType Directory -Force "src\components"
New-Item -ItemType Directory -Force "src\constants"
