import { Link } from "react-router-dom";
import classes from "./PaymentSuccess.module.css";

function PaymentSuccess() {
    return (
        <div className={classes.page}>
            <div className={classes.card}>
                <div className={classes.icon}>✓</div>

                <h1 className={classes.title}>크레딧 충전이 완료되었습니다!</h1>

                <p className={classes.desc}>
                    결제 내역이 확인되면 크레딧이 계정에 반영됩니다.
                </p>

                <Link to="/" className={classes.mainBtn}>
                    메인화면으로 돌아가기
                </Link>

                <Link to="/mypage" className={classes.subLink}>
                    마이페이지에서 크레딧 확인하기
                </Link>
            </div>
        </div>
    );
}

export default PaymentSuccess;