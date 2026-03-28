import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BiLeftArrowAlt, BiWallet } from 'react-icons/bi';
import { getModel, updateModel } from '../../api/chatApi';
import { toast } from 'sonner';

import classes from './MyPageModel.module.css';

const MODEL_OPTIONS = [
    {
        value: 'free',
        label: '베이직',
        desc: '빠르고 가벼운 기본 대화를 제공해요',
        credit: 1,
    },
    {
        value: 'gpt',
        label: '스탠다드',
        desc: 'gpt-5-mini 기반의 빠르고 안정적인 답변을 제공해요',
        credit: 3,
    },
    {
        value: 'claude',
        label: '프로',
        desc: 'Claude Sonnet 4.6 기반의 풍부하고 자연스러운 답변을 제공해요',
        credit: 5,
    },
];

function MyPageModel() {
    const navigate = useNavigate();
    const [selected, setSelected] = useState(null);
    const [credit, setCredit] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        getModel()
            .then((data) => { setSelected(data.model); setCredit(data.credit); })
            .catch((err) => console.error('모델 설정 불러오기 실패:', err));
    }, []);

    if (selected === null) {
        return (
            <div className={classes.pageLoader}>
                <span className={classes.loadingDots}><span /><span /><span /></span>
            </div>
        );
    }

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateModel(selected);
            toast.success('모델 설정이 저장되었어요.');
        } catch (err) {
            console.error('모델 설정 실패:', err);
            toast.error('저장에 실패했어요. 다시 시도해주세요.');
        } finally {
            setIsSaving(false);
        }
    };

    const selectedOption = MODEL_OPTIONS.find((o) => o.value === selected);

    return (
        <div className={classes.page}>

            <div className={classes.pageHeader}>
                <button className={classes.backBtn} onClick={() => navigate('/mypage')}>
                    <BiLeftArrowAlt />
                </button>
                <span className={classes.pageTitle}>AI 모델 설정</span>
            </div>

            {/* ── 크레딧 섹션 ── */}
            <div className={classes.creditSection}>
                <div className={classes.creditTop}>
                    <BiWallet className={classes.creditIcon} />
                    <span className={classes.creditSectionLabel}>내 크레딧</span>
                </div>
                <div className={classes.creditBalance}>
                    <span className={classes.creditAmount}>{(credit ?? 0).toLocaleString()}</span>
                    <span className={classes.creditUnit}>크레딧</span>
                </div>
                {selectedOption && (
                    <div className={classes.creditInfo}>
                        현재 모델 기준 약{' '}
                        <strong>{Math.floor((credit ?? 0) / selectedOption.credit).toLocaleString()}회</strong>
                        {' '} 메세지 전송 또는 답변 재생성 가능
                    </div>
                )}
            </div>

            {/* ── 모델 선택 섹션 ── */}
            <div className={classes.modelSection}>
                <div className={classes.modelSectionHeader}>
                    <span className={classes.modelSectionTitle}>모델 선택</span>
                    <span className={classes.modelSectionDesc}>모델마다 차감되는 크레딧이 달라요</span>
                </div>
                <div className={classes.options}>
                    {MODEL_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            className={`${classes.optionCard} ${selected === opt.value ? classes.optionCardSelected : ''}`}
                            onClick={() => setSelected(opt.value)}
                        >
                            <div className={classes.optionTop}>
                                <span className={classes.optionLabel}>{opt.label}</span>
                                <span className={classes.optionBadge}>{opt.credit} 크레딧</span>
                            </div>
                            <p className={classes.optionDesc}>{opt.desc}</p>
                            <span className={classes.radioIndicator} />
                        </button>
                    ))}
                </div>

                <button
                    className={classes.saveBtn}
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? '저장 중...' : '저장하기'}
                </button>
            </div>

        </div>
    );
}

export default MyPageModel;
