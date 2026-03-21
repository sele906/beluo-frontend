import { useCallback } from "react";

/**
 * 타이핑 효과 훅
 *
 * @param {Function} onComplete - 타이핑 완료 시 호출할 콜백
 * @returns {{ typeText: (text: string, setText: Function) => void }}
 */
export function useTypeMessage(onComplete) {
  const typeText = useCallback((text, setText) => {
    let index = 0;
    setText("");

    const interval = setInterval(() => {
      index++;
      setText(text.slice(0, index));

      if (index >= text.length) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 30);
  }, [onComplete]);

  return { typeText };
}
