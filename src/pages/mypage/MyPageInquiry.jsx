import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BiLeftArrowAlt, BiCheckCircle } from 'react-icons/bi';
import { submitInquiry } from '../../api/chatApi';
import { toast } from 'sonner';

import classes from './MyPageInquiry.module.css';

function MyPageInquiry() {
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDone, setIsDone] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        setIsSubmitting(true);
        try {
            await submitInquiry(content.trim());
            setIsDone(true);
        } catch (err) {
            console.error('문의 제출 실패:', err);
            toast.error('문의 제출에 실패했어요. 다시 시도해주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={classes.page}>

            <div className={classes.pageHeader}>
                <button className={classes.backBtn} onClick={() => navigate('/mypage')}>
                    <BiLeftArrowAlt />
                </button>
                <span className={classes.pageTitle}>문의사항</span>
            </div>

            {isDone ? (
                <div className={classes.success}>
                    <BiCheckCircle className={classes.successIcon} />
                    <p className={classes.successTitle}>문의가 접수되었습니다</p>
                    <p className={classes.successDesc}>빠른 시일 내에 답변 드리겠습니다</p>
                    <button className={classes.backToBtn} onClick={() => navigate('/mypage')}>
                        마이페이지로 돌아가기
                    </button>
                </div>
            ) : (
                <form className={classes.form} onSubmit={handleSubmit}>
                    <div className={classes.field}>
                        <label className={classes.label}>문의 내용</label>
                        <textarea
                            className={classes.textarea}
                            placeholder="문의하실 내용을 자세히 입력해주세요"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={10}
                        />
                        <span className={classes.charCount}>{content.length}자</span>
                    </div>
                    <button
                        type="submit"
                        className={classes.submitBtn}
                        disabled={isSubmitting || !content.trim()}
                    >
                        {isSubmitting ? '제출 중...' : '문의하기'}
                    </button>
                </form>
            )}

        </div>
    );
}

export default MyPageInquiry;
