import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPolarCheckout } from "../../api/chatApi";
import { BiLeftArrowAlt } from "react-icons/bi";
import classes from "./MyPageCredit.module.css";

const CREDIT_PRODUCTS = [
    {
        key: "CREDIT_100",
        title: "100 크레딧",
        subtitle: "가볍게 체험하기",
        price: "₩1,000",
        detail: "기본 모델 약 100회 · GPT 약 33회 · Claude 약 20회",
    },
    {
        key: "CREDIT_350",
        title: "350 크레딧",
        subtitle: "가장 무난한 선택",
        price: "₩3,000",
        detail: "기본 모델 약 350회 · GPT 약 116회 · Claude 약 70회",
        badge: "추천",
    },
    {
        key: "CREDIT_650",
        title: "650 크레딧",
        subtitle: "오래 대화하기",
        price: "₩5,000",
        detail: "기본 모델 약 650회 · GPT 약 216회 · Claude 약 130회",
    },
];

function MyPageCredit() {
    const navigate = useNavigate();
    const [loadingKey, setLoadingKey] = useState(null);

    const handleCheckout = async (packageKey) => {
        try {
            setLoadingKey(packageKey);

            const data = await createPolarCheckout(packageKey);
            window.location.href = data.checkoutUrl;
        } catch (error) {
            console.error("checkout error:", error);
            alert("결제 페이지를 여는 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.");
        } finally {
            setLoadingKey(null);
        }
    };

    return (
        <div className={classes.page}>
            {/* ── 페이지 헤더 ── */}
            <div className={classes.pageHeader}>
                <button className={classes.backBtn} onClick={() => navigate('/mypage')}><BiLeftArrowAlt /></button>
                <span className={classes.pageTitle}>크레딧 충전</span>
            </div>

            <section className={classes.header}>
                <span className={classes.eyebrow}>Credit Shop</span>
                <p className={classes.desc}>
                    AI 캐릭터와 대화할 때 사용할 크레딧을 충전해요.
                </p>
            </section>

            <div className={classes.grid}>
                {CREDIT_PRODUCTS.map((product) => (
                    <div
                        key={product.key}
                        className={`${classes.card} ${product.badge ? classes.recommended : ""}`}
                    >
                        {product.badge && (
                            <span className={classes.badge}>{product.badge}</span>
                        )}

                        <div className={classes.cardTop}>
                            <h2 className={classes.productTitle}>{product.title}</h2>
                            <p className={classes.subtitle}>{product.subtitle}</p>
                        </div>

                        <div className={classes.price}>{product.price}</div>

                        <p className={classes.detail}>{product.detail}</p>

                        <button
                            className={classes.buyBtn}
                            onClick={() => handleCheckout(product.key)}
                            disabled={loadingKey === product.key}
                        >
                            {loadingKey === product.key ? "결제 페이지 여는 중..." : "충전하기"}
                        </button>
                    </div>
                ))}
            </div>

            <p className={classes.notice}>
                결제가 완료되면 크레딧이 계정에 자동으로 지급됩니다.
            </p>
        </div>
    );
}

export default MyPageCredit;