import { useState, useRef } from "react";
import Avatar from "../common/Avatar";
import { BiChevronLeft, BiChevronRight, BiCheck, BiRefresh } from "react-icons/bi";
import rowClasses from "./MessageItem.module.css";
import controlClasses from "./ReplyControls.module.css";
import sliderClasses from "./ReplySlider.module.css";
import classes from "../../pages/chat/ChatRoom.module.css";

// 재생성 슬라이더
// 슬라이드 구조: 0 = 저장된 답변, 1~N = 재생성 답변, N+1 = 재생성 중 로딩
// - 저장된 답변(0번): 반투명, 체크버튼 없음
// - 재생성 답변(1~N): 체크버튼 표시 → 클릭 시 저장된 답변 교체
// - 로딩 슬롯: 재생성 요청 중일 때만 등장
function ReplySlider({
    info,
    sliderContent,  // 현재 슬라이드에 표시할 텍스트 (null이면 로딩 dots)
    isOnSaved,      // 현재 슬라이드가 저장된 답변(0번)인지
    isOnLoading,    // 현재 슬라이드가 재생성 중 로딩 슬롯인지
    sliderIdx,
    totalSlides,
    busy,           // 전송/재생성/타이핑 중 → 버튼 비활성화
    onPrev,
    onNext,
    onRegenerate,
    onConfirm,
}) {
    const [slideDir, setSlideDir] = useState("right");
    const touchStartX = useRef(null);

    const handlePrev = () => {
        setSlideDir("left");
        onPrev();
    };

    const handleNext = () => {
        setSlideDir("right");
        onNext();
    };

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
            if (diff > 0) {
                // 왼쪽 스와이프 → 다음 or 재생성
                if (sliderIdx >= totalSlides - 1) onRegenerate();
                else handleNext();
            } else {
                handlePrev(); // 오른쪽 스와이프 → 이전
            }
        }
        touchStartX.current = null;
    };

    return (
        <div
            className={`${rowClasses.row} ${rowClasses.rowAi}`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <div className={rowClasses.aiAvatar}>
                <Avatar filePath={info.characterImgUrl} name={info.characterName} size={150} />
            </div>
            <div className={rowClasses.msgWrapper} style={{ flexDirection: "column", alignItems: "flex-start" }}>

                {/* 답변 버블 - key로 슬라이드 변경 시 애니메이션 재실행 */}
                <div
                    key={sliderIdx}
                    className={`${rowClasses.bubble} ${rowClasses.bubbleAi} ${slideDir === "left" ? sliderClasses.slideFromLeft : sliderClasses.slideFromRight}`}
                    style={isOnSaved ? { opacity: 0.5 } : {}}
                >
                    {isOnLoading
                        ? <span className={classes.loadingDots}><span /><span /><span /></span>
                        : sliderContent
                    }
                </div>

                {/* 네비게이션 컨트롤 */}
                <div className={controlClasses.replyControls}>
                    <button
                        className={controlClasses.replyNavBtn}
                        onClick={handlePrev}
                        disabled={sliderIdx === 0 || busy}
                    >
                        <BiChevronLeft />
                    </button>
                    <span className={controlClasses.replyNavText}>{sliderIdx + 1} / {totalSlides}</span>
                    <button
                        className={controlClasses.replyNavBtn}
                        onClick={sliderIdx >= totalSlides - 1 ? onRegenerate : handleNext}
                        disabled={busy}
                    >
                        <BiChevronRight />
                    </button>
                    {totalSlides === 1 && (
                        <button className={controlClasses.regenBtn} onClick={onRegenerate} disabled={busy}>
                            <BiRefresh />
                        </button>
                    )}
                    {!isOnSaved && !isOnLoading && (
                        <button className={controlClasses.confirmBtn} onClick={onConfirm} disabled={busy}>
                            <BiCheck />
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}

export default ReplySlider;
