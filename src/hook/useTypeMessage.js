import { useCallback, useRef } from "react";

/**
 * 타이핑 효과 훅
 * - typeText 재호출 시 이전 interval을 자동으로 정리
 *
 * @param {Function} onComplete - 타이핑 완료 시 호출할 콜백
 * @returns {{ typeText: (text: string, setText: Function) => void }}
 */
export function useTypeMessage(onComplete) {
  const intervalRef = useRef(null);

  const typeText = useCallback((text, setText) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    let index = 0;
    setText("");

    intervalRef.current = setInterval(() => {
      index++;
      setText(text.slice(0, index));

      if (index >= text.length) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        onComplete?.();
      }
    }, 30);
  }, [onComplete]);

  return { typeText };
}
