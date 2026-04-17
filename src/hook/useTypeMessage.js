import { useCallback, useRef } from "react";

// 타이핑 애니메이션 훅
// typeText(text, setText, onTick?, onComplete?)
//   - text       : 출력할 전체 문자열
//   - setText     : 글자씩 업데이트할 state setter
//   - onTick      : 글자 하나 출력될 때마다 호출 (스크롤 등)
//   - onComplete  : 타이핑 완료 시 호출
// 재호출 시 이전 interval 자동 정리
export function useTypeMessage() {
    const intervalRef = useRef(null);

    const typeText = useCallback((text, setText, onTick, onComplete) => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        let index = 0;
        setText("");

        intervalRef.current = setInterval(() => {
            index++;
            setText(text.slice(0, index));
            onTick?.();
            if (index >= text.length) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
                onComplete?.();
            }
        }, 20);
    }, []);

    return { typeText };
}
