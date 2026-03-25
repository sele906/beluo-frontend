import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BiLeftArrowAlt } from 'react-icons/bi';
import { getModel, updateModel } from '../../api/chatApi';
import { toast } from 'sonner';

import classes from './MyPageModel.module.css';

const MODEL_OPTIONS = [
    {
        value: 'free',
        label: '기본 모델',
        desc: '답변 로딩 속도가 느릴 수 있어요',
        badge: null,
    },
    {
        value: 'gpt',
        label: 'GPT',
        desc: 'gpt-4o-mini 기반의 빠르고 안정적인 답변을 제공해요',
        badge: '유료',
    },
    {
        value: 'claude',
        label: 'Claude',
        desc: 'Claude Sonnet 4.6 기반의 풍부하고 자연스러운 답변을 제공해요',
        badge: '유료',
    },
];

function MyPageModel() {
    const navigate = useNavigate();
    const [selected, setSelected] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        getModel()
            .then((model) => setSelected(model))
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

    return (
        <div className={classes.page}>

            <div className={classes.pageHeader}>
                <button className={classes.backBtn} onClick={() => navigate('/mypage')}>
                    <BiLeftArrowAlt />
                </button>
                <span className={classes.pageTitle}>AI 모델 설정</span>
            </div>

            <p className={classes.desc}>대화에 사용할 AI 모델을 선택하세요</p>

            <div className={classes.options}>
                {MODEL_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        className={`${classes.optionCard} ${selected === opt.value ? classes.optionCardSelected : ''}`}
                        onClick={() => setSelected(opt.value)}
                    >
                        <div className={classes.optionTop}>
                            <span className={classes.optionLabel}>{opt.label}</span>
                            {opt.badge && <span className={classes.optionBadge}>{opt.badge}</span>}
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
    );
}

export default MyPageModel;
