# Realtime Presence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hiển thị số lượng người đang xem trang trực tiếp trong component Terminal ở Homepage.

**Architecture:** Sử dụng Firebase Realtime Database. Ở frontend, chúng ta sẽ viết một custom hook `usePresence` để đăng ký kết nối (`onDisconnect().remove()`) và đếm số lượng node con trong thư mục `presence/connections`. Hook này sẽ cấp số lượng người online cho `Terminal` component.

**Tech Stack:** Next.js (React), Firebase Realtime Database (`firebase/database`).

---

### Task 1: Cập nhật cấu hình Firebase

**Files:**
- Modify: `/Volumes/Data/Code/web/yunkhngn-website/yunkhngn-fe/lib/firebase/config.js:25-33`

- [ ] **Step 1: Khởi tạo Realtime Database instance**
Thêm import và export cho Realtime Database.

```javascript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/** Required fields for a valid web client config... */
function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

let app = null;
let auth = null;
let database = null;

if (isFirebaseConfigured()) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  database = getDatabase(app);
}

export { app, auth, database, isFirebaseConfigured };
```

---

### Task 2: Tạo Hook `usePresence`

**Files:**
- Create: `/Volumes/Data/Code/web/yunkhngn-website/yunkhngn-fe/hooks/usePresence.js`

- [ ] **Step 1: Viết hook lắng nghe kết nối Firebase**
Sử dụng `ref`, `onValue`, `onDisconnect`, `set`, và `push` để quản lý presence.

```javascript
import { useState, useEffect } from 'react';
import { database } from '@/lib/firebase/config';
import { ref, onValue, onDisconnect, set, push } from 'firebase/database';

export function usePresence() {
    const [onlineCount, setOnlineCount] = useState(0);

    useEffect(() => {
        if (!database) return;

        // Reference to the connections list
        const connectionsRef = ref(database, 'presence/connections');
        // Reference to the special Firebase info/connected path
        const connectedRef = ref(database, '.info/connected');

        // Watch for our own connection status
        const unsubscribeConnected = onValue(connectedRef, (snap) => {
            if (snap.val() === true) {
                // We are connected. Add our device to the connections list
                const conRef = push(connectionsRef);
                
                // When we disconnect, remove this device
                onDisconnect(conRef).remove().then(() => {
                    // Once the disconnect hook is set, set our initial status
                    set(conRef, true);
                });
            }
        });

        // Watch the connections list to get the total count
        const unsubscribeConnections = onValue(connectionsRef, (snap) => {
            if (snap.exists()) {
                setOnlineCount(snap.size);
            } else {
                setOnlineCount(0);
            }
        });

        return () => {
            unsubscribeConnected();
            unsubscribeConnections();
        };
    }, []);

    return onlineCount;
}
```

---

### Task 3: Hiển thị lên Terminal Component

**Files:**
- Modify: `/Volumes/Data/Code/web/yunkhngn-website/yunkhngn-fe/components/home/Terminal.jsx`

- [ ] **Step 1: Import hook và lấy giá trị đếm**

Thêm import ở đầu file:
```javascript
import { useState, useRef, useEffect } from 'react';
import { readNestJson } from '@/lib/api/readJson';
import { Terminal as TerminalIcon, X, Maximize2, Minus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { stripHtml } from '@/lib/utils';
import { usePresence } from '@/hooks/usePresence';
```

Thêm lời gọi hook bên trong component `Terminal` (trước cái `useEffect` đầu tiên):
```javascript
export default function Terminal({ embedded = false, className = '' }) {
    const onlineCount = usePresence();
```

- [ ] **Step 2: Cập nhật giao diện Header**

Sửa phần render JSX của Header (vào khoảng dòng 256 của file `Terminal.jsx` gốc):
Thay vì để `Spacer for centering`, chúng ta hiển thị `onlineCount`.

Sửa từ:
```javascript
                    <div className="opacity-0">
                        {/* Spacer for centering */}
                        <div className="w-12" />
                    </div>
```

Thành:
```javascript
                    <div className="text-green-500 text-xs font-medium flex items-center gap-1.5 animate-pulse shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                        {onlineCount} {onlineCount <= 1 ? 'nerd' : 'nerds'} online
                    </div>
```

- [ ] **Step 3: Khởi tạo database rules**

Đây là bước bạn (người dùng) cần làm trên **Firebase Console**:
1. Vào Firebase Console -> Build -> Realtime Database -> Bấm **Create Database**.
2. Chọn khu vực (Singapore/Asia) -> Next -> Start in **Test Mode** (hoặc Locked Mode, sau đó sửa Rules).
3. Vào tab **Rules**, cập nhật thành:
```json
{
  "rules": {
    "presence": {
      "connections": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```
*(Nếu cần, có thể làm bước này sau khi deploy code. Code sẽ không bị lỗi crash màn hình mà chỉ hiện 0 online nếu chưa có rule).*
